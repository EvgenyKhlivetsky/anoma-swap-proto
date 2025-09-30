import { useState } from "react";
import type { Route, Intent } from "../mocks/solver";

// Extend Window interface for TypeScript
declare global {
  interface Window {
    updateWalletBalance?: (token: string, amount: number) => void;
  }
}

type Props = { routes: Route[]; intent: Intent };

const getChainIcon = (chains: string[]) => {
  const icons: Record<string, string> = {
    ethereum: "⬧",
    arbitrum: "⬟",
    optimism: "🔴",
    polygon: "⬣",
    solana: "🟢",
  };
  return chains.map((chain) => icons[chain] || "⚪").join(" → ");
};

export default function ResultsView({ routes, intent }: Props) {
  const [selectedRoute, setSelectedRoute] = useState<Route>(routes[0]);
  const [executing, setExecuting] = useState(false);

  const handleExecute = async () => {
    setExecuting(true);

    // Check if wallet is connected and has the update function
    const updateWalletBalance = window.updateWalletBalance;
    if (!updateWalletBalance) {
      alert("Please connect your wallet first!");
      setExecuting(false);
      return;
    }

    // Simulate execution time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get the give and receive tokens/amounts from the intent and route
    const giveToken = intent.give.token;
    const receiveToken = intent.want.token;
    const giveAmount = intent.give.amount;
    const receiveAmount = selectedRoute.expectedReceive;

    // Update wallet balances
    updateWalletBalance(giveToken, -giveAmount); // Subtract what we're giving
    updateWalletBalance(receiveToken, receiveAmount); // Add what we're receiving

    alert(
      `Swap executed! You gave ${giveAmount} ${giveToken} and received ${receiveAmount.toFixed(
        6
      )} ${receiveToken}`
    );
    setExecuting(false);
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Intent Routes Found
        </h2>
        <p className="text-gray-400">
          {routes.length} route{routes.length > 1 ? "s" : ""} found, sorted by
          best rate
        </p>
      </div>

      {/* Selected Route Highlight */}
      <div className="bg-gray-900 border-l-4 border-red-500 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-white">Selected Route</h3>
            {selectedRoute.highlight && (
              <span className="px-2 py-1 bg-red-600/20 text-red-400 rounded text-sm">
                {selectedRoute.highlight}
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {selectedRoute.expectedReceive.toFixed(6)}
            </div>
            <div className="text-sm text-gray-400">
              {selectedRoute.steps[selectedRoute.steps.length - 1]}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Route</div>
            <div className="text-white font-medium">
              {getChainIcon(selectedRoute.chains)}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Time</div>
            <div className="text-white font-medium">
              {selectedRoute.latency}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Fees</div>
            <div className="text-white font-medium">
              {(selectedRoute.fees * 100).toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-gray-400">Gas Cost</div>
            <div className="text-white font-medium">
              {selectedRoute.gasCost.toFixed(4)} ETH
            </div>
          </div>
        </div>

        {selectedRoute.bridgeTime && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Bridge time:{" "}
              <span className="text-white">{selectedRoute.bridgeTime}</span>
            </div>
          </div>
        )}
      </div>

      {/* All Routes List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">
          All Routes (Click to Select)
        </h3>
        <div className="space-y-2">
          {routes.map((route, index) => (
            <div
              key={route.id}
              onClick={() => setSelectedRoute(route)}
              className={`bg-gray-900 rounded-lg p-4 border transition-colors cursor-pointer ${
                selectedRoute.id === route.id
                  ? "border-red-500 bg-red-600/10"
                  : "border-gray-700 hover:border-gray-600 hover:bg-gray-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedRoute.id === route.id
                        ? "bg-red-600 text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {route.id
                        .replace("-", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </div>
                    <div className="text-sm text-gray-400">
                      {getChainIcon(route.chains)} • {route.latency}
                    </div>
                  </div>
                  {route.highlight && (
                    <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                      {route.highlight}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {route.expectedReceive.toFixed(6)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {(route.fees * 100).toFixed(2)}% fees
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Execute Button */}
      <div className="text-center pt-6">
        <button
          onClick={handleExecute}
          disabled={executing}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-8 py-3 rounded font-semibold transition-colors flex items-center justify-center space-x-2 mx-auto"
        >
          {executing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Executing...</span>
            </>
          ) : (
            <span>Execute Selected Route</span>
          )}
        </button>
        <p className="text-xs text-gray-500 mt-2">
          This would integrate with your wallet in a production environment
        </p>
      </div>
    </div>
  );
}
