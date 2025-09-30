export type Intent = {
  give: { token: string; amount: number };
  want: { token: string; minAmount?: number };
  preferences?: {
    maxSlippage: number;
    preferredChains: string[];
    privacyLevel: "low" | "medium" | "high";
    timePreference: "fast" | "balanced" | "cheap";
  };
};

export interface Route {
  id: string;
  steps: string[];
  expectedReceive: number;
  fees: number;
  latency: string;
  privacy: string;
  chains: string[];
  gasCost: number;
  bridgeTime?: string;
  highlight?: string;
  privacyScore: number;
  efficiency: number;
}

// Mock token prices (would be fetched from CoinGecko API in real app)
export const MOCK_PRICES = {
  ETH: 2450,
  USDC: 1,
  DAI: 1,
  USDT: 1,
  SOL: 145,
  MATIC: 0.65,
};

export function calculateSwapAmount(
  fromToken: string,
  toToken: string,
  amount: number,
  feePercent: number = 0.3
): number {
  const fromPrice = MOCK_PRICES[fromToken as keyof typeof MOCK_PRICES] || 1;
  const toPrice = MOCK_PRICES[toToken as keyof typeof MOCK_PRICES] || 1;

  const baseAmount = (amount * fromPrice) / toPrice;
  const feeAmount = baseAmount * (feePercent / 100);
  return baseAmount - feeAmount;
}

export async function mockSolve(intent: Intent): Promise<Route[]> {
  // Simulate processing time
  await new Promise((r) => setTimeout(r, 1500));

  const { give, want, preferences } = intent;
  const routes: Route[] = [];

  const preferredChains = preferences?.preferredChains || ["ethereum"];
  const privacyLevel = preferences?.privacyLevel || "medium";
  const timePreference = preferences?.timePreference || "balanced";

  // Ethereum mainnet route (always available)
  if (preferredChains.includes("ethereum")) {
    routes.push({
      id: "ethereum-direct",
      steps: [give.token, "Uniswap V3", want.token],
      expectedReceive: calculateSwapAmount(
        give.token,
        want.token,
        give.amount,
        0.3
      ),
      fees: 0.003,
      latency: timePreference === "fast" ? "15s" : "30s",
      privacy: privacyLevel,
      chains: ["ethereum"],
      gasCost: timePreference === "fast" ? 0.008 : 0.005,
      highlight: undefined,
      privacyScore:
        privacyLevel === "high" ? 80 : privacyLevel === "medium" ? 60 : 40,
      efficiency: 85,
    });
  }

  // L2 routes with better rates due to lower fees
  if (preferredChains.includes("arbitrum")) {
    routes.push({
      id: "arbitrum-route",
      steps: [give.token, "Arbitrum Bridge", "Uniswap V3", want.token],
      expectedReceive: calculateSwapAmount(
        give.token,
        want.token,
        give.amount,
        0.25
      ),
      fees: 0.0025,
      latency: timePreference === "fast" ? "45s" : "1.2m",
      privacy: privacyLevel,
      chains: ["ethereum", "arbitrum"],
      gasCost: 0.002,
      bridgeTime: "30s",
      highlight: "Lower fees on Arbitrum",
      privacyScore:
        privacyLevel === "high" ? 85 : privacyLevel === "medium" ? 70 : 50,
      efficiency: 92,
    });
  }

  if (preferredChains.includes("optimism")) {
    routes.push({
      id: "optimism-route",
      steps: [give.token, "Optimism Bridge", "Velodrome", want.token],
      expectedReceive: calculateSwapAmount(
        give.token,
        want.token,
        give.amount,
        0.28
      ),
      fees: 0.0028,
      latency: timePreference === "fast" ? "50s" : "1.5m",
      privacy: privacyLevel,
      chains: ["ethereum", "optimism"],
      gasCost: 0.0018,
      bridgeTime: "35s",
      highlight: "Good liquidity on Velodrome",
      privacyScore:
        privacyLevel === "high" ? 82 : privacyLevel === "medium" ? 68 : 48,
      efficiency: 90,
    });
  }

  if (preferredChains.includes("polygon")) {
    routes.push({
      id: "polygon-route",
      steps: [give.token, "Polygon Bridge", "QuickSwap", want.token],
      expectedReceive: calculateSwapAmount(
        give.token,
        want.token,
        give.amount,
        0.35
      ),
      fees: 0.0035,
      latency: "2m",
      privacy: privacyLevel,
      chains: ["ethereum", "polygon"],
      gasCost: 0.001,
      bridgeTime: "8m",
      highlight: "Cheapest gas fees",
      privacyScore:
        privacyLevel === "high" ? 78 : privacyLevel === "medium" ? 65 : 45,
      efficiency: 88,
    });
  }

  // Solana route for USDC trades
  if (
    preferredChains.includes("solana") &&
    (give.token === "USDC" || want.token === "USDC")
  ) {
    routes.push({
      id: "solana-route",
      steps: [give.token, "Wormhole Bridge", "Jupiter", want.token],
      expectedReceive: calculateSwapAmount(
        give.token,
        want.token,
        give.amount,
        0.22
      ),
      fees: 0.0022,
      latency: "3m",
      privacy: privacyLevel,
      chains: ["ethereum", "solana"],
      gasCost: 0.0005,
      bridgeTime: "15m",
      highlight: "Best rates via Solana",
      privacyScore:
        privacyLevel === "high" ? 88 : privacyLevel === "medium" ? 68 : 52,
      efficiency: 94,
    });
  }

  // Sort routes by best expected receive amount
  return routes.sort((a, b) => b.expectedReceive - a.expectedReceive);
}
