import type { RpcTransport } from "@solana/web3.js";
import { createDefaultRpcTransport } from "@solana/web3.js";
import Bottleneck from "bottleneck";

interface RateLimitOptions {
  rateLimitPerSecond?: number;
  maxConcurrent?: number;
}

type RateLimitedRpcTransportConfig = Parameters<typeof createDefaultRpcTransport>[0] & RateLimitOptions;

export function createRateLimitedRpcTransport(config: RateLimitedRpcTransportConfig): RpcTransport {
  const defaultTransport = createDefaultRpcTransport(config);
  const minTime = 1000 / (config.rateLimitPerSecond ?? 10);
  const limiter = new Bottleneck({ maxConcurrent: config.maxConcurrent, minTime });
  return async (...args: Parameters<RpcTransport>) => limiter.schedule(async () => defaultTransport(...args));
}
