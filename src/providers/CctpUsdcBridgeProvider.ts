import { BaseProvider } from "./BaseProvider";
import type { Intent, Quote, Route } from "../domain/types";
import type { ExecutionPlan } from "../domain/executionPlan";

import {
  getCctpAddresses,
  CCTP_TOKEN_MESSENGER_ABI,
  CCTP_MESSAGE_TRANSMITTER_ABI,
} from "../config/cctp";

import { Address, encodeFunctionData } from "viem";

/**
 * CCTP Provider implements cross-chain USDC bridging.
 * It produces two executionSteps:
 *  1. burn USDC on source chain
 *  2. mint USDC on destination chain
 */
export class CctpUsdcBridgeProvider extends BaseProvider {
  id = "circle-cctp" as const;

  supports(intent: Intent): boolean {
    const isCrossChain =
      intent.fromChain.id !== intent.toChain.id ||
      intent.fromChain.type !== intent.toChain.type;

    // Only USDC → USDC bridge
    const isUsdc =
      intent.fromToken.symbol === "USDC" && intent.toToken.symbol === "USDC";

    // CCTP is EVM-only
    const evmOnly =
      intent.fromChain.type === "evm" && intent.toChain.type === "evm";

    return isCrossChain && isUsdc && evmOnly;
  }

  async getQuote(intent: Intent): Promise<Quote | null> {
    this.validateIntent(intent);

    // Circle CCTP is fee-less → amountOut = amountIn
    return {
      providerId: this.id,
      chain: intent.fromChain,
      fromToken: intent.fromToken,
      toToken: intent.toToken,
      amountIn: intent.amountIn,
      amountOut: intent.amountIn,
      raw: null,
    };
  }

  async buildRoute(
    intent: Intent,
    quote: Quote,
    score: number
  ): Promise<Route> {
    this.validateIntent(intent);

    // ------------------------------
    // 1. Resolve CCTP configs
    // ------------------------------
    if (intent.fromChain.type !== "evm" || intent.toChain.type !== "evm") {
      throw new Error("[CCTP] Only EVM chains are supported.");
    }

    // ❗ getCctpAddresses now requires ChainRef (with id number|string)
    const fromCctp = getCctpAddresses(intent.fromChain);
    const toCctp = getCctpAddresses(intent.toChain);

    if (!fromCctp || !toCctp) {
      throw new Error(
        `[CCTP] No CCTP config for chains ${intent.fromChain.id} → ${intent.toChain.id}`
      );
    }

    // ------------------------------
    // 2. Build burn() calldata
    // ------------------------------
    const burnCalldata = encodeFunctionData({
      abi: CCTP_TOKEN_MESSENGER_ABI,
      functionName: "depositForBurn",
      args: [
        intent.amountIn,
        Number(intent.toChain.id), // DOMAIN_ID (Circle uses numeric domain IDs)
        intent.toToken.address as Address,
        intent.fromToken.address as Address,
      ],
    });

    const burnStep: ExecutionPlan = {
      providerId: this.id,
      type: "evm_bridge",
      chain: intent.fromChain,
      to: fromCctp.tokenMessenger,
      data: burnCalldata,
      value: 0n,
    };

    // ------------------------------
    // 3. Build mint() calldata (with attestation placeholder)
    // ------------------------------
    // In production:
    //   1) On-chain event emits message
    //   2) Fetch attestation from Circle API
    //   3) Execute mint() with message + attestation

    const placeholderAttestation = "0x" + "00".repeat(32); // placeholder 32 bytes

    const mintCalldata = encodeFunctionData({
      abi: CCTP_MESSAGE_TRANSMITTER_ABI,
      functionName: "receiveMessage",
      args: [
        "0x", // placeholder message
        placeholderAttestation as Address, // fake attestation bytes
      ],
    });

    const mintStep: ExecutionPlan = {
      providerId: this.id,
      type: "evm_bridge",
      chain: intent.toChain,
      to: toCctp.messageTransmitter,
      data: mintCalldata,
      value: 0n,
    };

    // ------------------------------
    // 4. Return a multi-step route
    // ------------------------------
    return {
      providerId: this.id,
      amountIn: quote.amountIn,
      amountOut: quote.amountOut,
      totalCostScore: score,
      executionPlans: [burnStep, mintStep],
    };
  }
}
