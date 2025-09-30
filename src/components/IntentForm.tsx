import { useState, useEffect } from "react";
import {
  mockSolve,
  calculateSwapAmount,
  type Route,
  type Intent,
} from "../mocks/solver";

type Props = { onSolved: (routes: Route[], intent: Intent) => void };

const TOKENS = [
  {
    symbol: "ETH",
    name: "Ethereum",
    chains: ["ethereum", "arbitrum", "optimism", "polygon"],
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    chains: ["ethereum", "arbitrum", "optimism", "polygon", "solana"],
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    chains: ["ethereum", "arbitrum", "optimism", "polygon"],
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    chains: ["ethereum", "arbitrum", "optimism", "polygon", "solana"],
  },
  { symbol: "SOL", name: "Solana", chains: ["solana"] },
  { symbol: "MATIC", name: "Polygon", chains: ["polygon", "ethereum"] },
];

const CHAINS = [
  { id: "ethereum", name: "Ethereum", icon: "⬧" },
  { id: "arbitrum", name: "Arbitrum", icon: "⬟" },
  { id: "optimism", name: "Optimism", icon: "🔴" },
  { id: "polygon", name: "Polygon", icon: "⬣" },
  { id: "solana", name: "Solana", icon: "🟢" },
];

export default function IntentForm({ onSolved }: Props) {
  const [giveToken, setGiveToken] = useState("ETH");
  const [wantToken, setWantToken] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [minReceive, setMinReceive] = useState("");
  const [preferredChains, setPreferredChains] = useState(["ethereum"]);
  const [maxSlippage, setMaxSlippage] = useState("1.0");
  const [privacyLevel, setPrivacyLevel] = useState("medium");
  const [timePreference, setTimePreference] = useState("balanced");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calculatedAmount, setCalculatedAmount] = useState("");
  const [walletBalances, setWalletBalances] = useState<Record<string, number>>(
    {}
  );

  // Load wallet balances from localStorage and listen for changes
  useEffect(() => {
    const loadBalances = () => {
      const balances = localStorage.getItem("walletBalances");
      if (balances) {
        setWalletBalances(JSON.parse(balances));
      }
    };

    // Load initial balances
    loadBalances();

    // Listen for storage changes (when balances are updated from other components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "walletBalances") {
        loadBalances();
      }
    };

    // Also add a custom event listener for same-window updates
    const handleBalanceUpdate = () => {
      loadBalances();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("walletBalanceUpdate", handleBalanceUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("walletBalanceUpdate", handleBalanceUpdate);
    };
  }, []);

  // Auto-calculate expected receive amount when user inputs amount and tokens
  useEffect(() => {
    if (amount && giveToken && wantToken && parseFloat(amount) > 0) {
      const expectedAmount = calculateSwapAmount(
        giveToken,
        wantToken,
        parseFloat(amount)
      );
      setCalculatedAmount(expectedAmount.toFixed(6));
    } else {
      setCalculatedAmount("");
    }
  }, [amount, giveToken, wantToken]);

  // Check if user has filled the "give" section
  const hasGiveInput = amount && parseFloat(amount) > 0;

  // Validation for amount
  const amountValue = parseFloat(amount);
  const availableBalance = walletBalances[giveToken] || 0;
  const isAmountValid = amountValue > 0 && amountValue <= availableBalance;
  const amountError =
    amountValue < 0
      ? "Amount cannot be negative"
      : amountValue > availableBalance
      ? `Insufficient balance. Available: ${availableBalance.toFixed(
          4
        )} ${giveToken}`
      : null;

  const toggleChain = (chainId: string) => {
    setPreferredChains((prev) =>
      prev.includes(chainId)
        ? prev.filter((id) => id !== chainId)
        : [...prev, chainId]
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const intent: Intent = {
      give: { token: giveToken, amount: parseFloat(amount) },
      want: {
        token: wantToken,
        minAmount: minReceive ? parseFloat(minReceive) : undefined,
      },
      preferences: {
        maxSlippage: parseFloat(maxSlippage),
        preferredChains,
        privacyLevel: privacyLevel as "low" | "medium" | "high",
        timePreference: timePreference as "fast" | "balanced" | "cheap",
      },
    };

    const res = await mockSolve(intent);
    onSolved(res, intent);
    setLoading(false);
  }

  return (
    <div className="w-full max-w-2xl">
      <form
        onSubmit={handleSubmit}
        className="p-8 bg-gray-900 rounded-lg space-y-6 border border-gray-700"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Express Your Intent
          </h2>
          <p className="text-gray-400 text-sm">
            Specify what you want to trade and we'll find the best path
          </p>
        </div>

        {/* Main Intent */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              I want to give
            </label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  max={availableBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full bg-black border p-3 rounded focus:ring-2 focus:border-red-500 text-white placeholder-gray-500 ${
                    amountError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600 focus:ring-red-500"
                  }`}
                  placeholder="Amount"
                />
                {amountError && (
                  <p className="text-red-400 text-xs mt-1">{amountError}</p>
                )}
                {availableBalance > 0 && (
                  <p className="text-gray-500 text-xs mt-1">
                    Available: {availableBalance.toFixed(4)} {giveToken}
                  </p>
                )}
              </div>
              <select
                value={giveToken}
                onChange={(e) => setGiveToken(e.target.value)}
                className="bg-black border border-gray-600 p-3 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
              >
                {TOKENS.map((token) => (
                  <option
                    key={token.symbol}
                    value={token.symbol}
                    className="bg-black text-white"
                  >
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* You will receive section - always present but conditional content */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              You will receive approximately
            </label>
            {hasGiveInput ? (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <div className="flex-1 bg-gray-800 border border-gray-600 p-3 rounded text-gray-300 flex items-center justify-between">
                    <span className="text-lg font-semibold text-white">
                      {calculatedAmount} {wantToken}
                    </span>
                    <span className="text-sm text-gray-400">(Market rate)</span>
                  </div>
                  <select
                    value={wantToken}
                    onChange={(e) => setWantToken(e.target.value)}
                    className="bg-black border border-gray-600 p-3 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
                  >
                    {TOKENS.filter((token) => token.symbol !== giveToken).map(
                      (token) => (
                        <option
                          key={token.symbol}
                          value={token.symbol}
                          className="bg-black text-white"
                        >
                          {token.symbol}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <input
                  type="number"
                  step="0.001"
                  value={minReceive}
                  onChange={(e) => setMinReceive(e.target.value)}
                  className="w-full bg-black border border-gray-600 p-2 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-500 text-sm"
                  placeholder={`Set minimum amount (optional, default: ${calculatedAmount})`}
                />
              </div>
            ) : (
              <div className="bg-gray-800 border border-gray-600 p-3 rounded text-gray-500 text-center">
                Enter amount above to see calculated receive amount
              </div>
            )}
          </div>
        </div>

        {!hasGiveInput && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              Enter the amount and token you want to give above to see the
              calculated receive amount and additional options.
            </p>
          </div>
        )}

        {/* Chain Selection - Only show after user fills give section */}
        {hasGiveInput && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Choose preferred chains
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {CHAINS.map((chain) => (
                <button
                  key={chain.id}
                  type="button"
                  onClick={() => toggleChain(chain.id)}
                  className={`p-3 rounded border transition-all ${
                    preferredChains.includes(chain.id)
                      ? "border-red-500 bg-red-600/20 text-red-400"
                      : "border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  <div className="text-lg mb-1">{chain.icon}</div>
                  <div className="text-xs font-medium">{chain.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Preferences Toggle - Only show after user fills give section */}
        {hasGiveInput && (
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full text-left text-sm text-gray-400 hover:text-gray-300 font-medium transition-colors"
          >
            {showAdvanced ? "↑ Hide" : "↓ Show"} Advanced Preferences
          </button>
        )}

        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-800 rounded border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Slippage
                </label>
                <select
                  value={maxSlippage}
                  onChange={(e) => setMaxSlippage(e.target.value)}
                  className="w-full bg-black border border-gray-600 p-2 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
                >
                  <option value="0.1" className="bg-black">
                    0.1%
                  </option>
                  <option value="0.5" className="bg-black">
                    0.5%
                  </option>
                  <option value="1.0" className="bg-black">
                    1.0%
                  </option>
                  <option value="2.0" className="bg-black">
                    2.0%
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Privacy Level
                </label>
                <select
                  value={privacyLevel}
                  onChange={(e) => setPrivacyLevel(e.target.value)}
                  className="w-full bg-black border border-gray-600 p-2 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
                >
                  <option value="low" className="bg-black">
                    Low (Faster)
                  </option>
                  <option value="medium" className="bg-black">
                    Medium
                  </option>
                  <option value="high" className="bg-black">
                    High (More Private)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Time vs Cost
                </label>
                <select
                  value={timePreference}
                  onChange={(e) => setTimePreference(e.target.value)}
                  className="w-full bg-black border border-gray-600 p-2 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
                >
                  <option value="fast" className="bg-black">
                    Fast (Higher Fees)
                  </option>
                  <option value="balanced" className="bg-black">
                    Balanced
                  </option>
                  <option value="cheap" className="bg-black">
                    Cheap (Slower)
                  </option>
                </select>
              </div>
            </div>
          </div>
        )}

        {hasGiveInput && (
          <button
            type="submit"
            disabled={loading || preferredChains.length === 0 || !isAmountValid}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Finding optimal routes...</span>
              </>
            ) : (
              <span>Find Intent Routes</span>
            )}
          </button>
        )}
      </form>
    </div>
  );
}
