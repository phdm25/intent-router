import type { ChainRef } from "../domain/chainref.schema";

// ------------------------------
// 1) TokenMessenger ABI
// ------------------------------
export const CCTP_TOKEN_MESSENGER_ABI = [
  {
    type: "function",
    name: "depositForBurn",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "destinationDomain", type: "uint32" },
      { name: "mintRecipient", type: "bytes32" },
      { name: "burnToken", type: "address" },
    ],
    outputs: [],
  },
] as const;

// ------------------------------
// 2) MessageTransmitter ABI
// ------------------------------
export const CCTP_MESSAGE_TRANSMITTER_ABI = [
  {
    type: "function",
    name: "receiveMessage",
    stateMutability: "nonpayable",
    inputs: [
      { name: "message", type: "bytes" },
      { name: "attestation", type: "bytes" },
    ],
    outputs: [{ name: "success", type: "bool" }],
  },
] as const;

// --------------------------------------
// CCTP addresses per EVM chain
// --------------------------------------
// Official Circle documentation mapping
export const CCTP_ADDRESSES = {
  1: {
    // Ethereum Mainnet
    domainId: 0, // Circle Domain ID for Ethereum
    tokenMessenger: "0xbd3fa81b58ba92a82136038b25adec7066af3155",
    messageTransmitter: "0x0a992d191deec32afe36203ad87d7d289a738f81",
  },
  137: {
    // Polygon
    domainId: 5,
    tokenMessenger: "0x0a992d191deec32afe36203ad87d7d289a738f81",
    messageTransmitter: "0x0a992d191deec32afe36203ad87d7d289a738f81",
  },
  42161: {
    // Arbitrum One
    domainId: 3,
    tokenMessenger: "0x0a992d191deec32afe36203ad87d7d289a738f81",
    messageTransmitter: "0x0a992d191deec32afe36203ad87d7d289a738f81",
  },
  10: {
    // Optimism
    domainId: 2,
    tokenMessenger: "0x0a992d191deec32afe36203ad87d7d289a738f81",
    messageTransmitter: "0x0a992d191deec32afe36203ad87d7d289a738f81",
  },
  11155111: {
    // Sepolia (Testnet)
    domainId: 10002,
    tokenMessenger: "0x0a992d191deec32afe36203ad87d7d289a738f81",
    messageTransmitter: "0x0a992d191deec32afe36203ad87d7d289a738f81",
  },
} as const;

export type CctpAddressMap = typeof CCTP_ADDRESSES;

// --------------------------------------
// Helper: Get addresses by ChainRef
// --------------------------------------
export function getCctpAddresses(chain: ChainRef) {
  if (chain.type !== "evm") return null;

  const addresses = CCTP_ADDRESSES[Number(chain.id)];
  if (!addresses) return null;

  return addresses;
}
