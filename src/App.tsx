import { useState } from "react";
import IntentForm from "./components/IntentForm";
import ResultsView from "./components/ResultsView";
import WalletWidget from "./components/WalletWidget";
import type { Route, Intent } from "./mocks/solver";
import anomaLogo from "./assets/anoma.svg";

function App() {
  const [routes, setRoutes] = useState<Route[] | null>(null);
  const [currentIntent, setCurrentIntent] = useState<Intent | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleSolved = (solvedRoutes: Route[], intent: Intent) => {
    setRoutes(solvedRoutes);
    setCurrentIntent(intent);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Wallet Widget - Fixed position top right */}
      <div className="fixed top-4 right-4 z-10">
        <WalletWidget onConnectionChange={setIsWalletConnected} />
      </div>

      <div className="container mx-auto px-4 py-8 flex flex-col items-center space-y-8">
        {/* Clean Header */}
        <div className="text-center space-y-6">
          <div className="relative">
            {/* Anoma Logo/Symbol */}
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
              <img src={anomaLogo} alt="Anoma Logo" className="w-16 h-16" />
            </div>

            {/* Main Title */}
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-white">
                Anoma Intent Swap
              </h1>
              <div className="flex items-center justify-center space-x-3">
                <span className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium">
                  PROTOTYPE
                </span>
                <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-sm font-medium">
                  INTENT-CENTRIC
                </span>
              </div>
            </div>
          </div>

          <p className="text-gray-400 max-w-2xl text-lg">
            Express your trading intent across multiple chains. Anoma will find
            the optimal path for your swap.
          </p>
        </div>

        {/* Main Content */}
        {isWalletConnected ? (
          <>
            <IntentForm onSolved={handleSolved} />
            {routes && currentIntent && (
              <ResultsView routes={routes} intent={currentIntent} />
            )}
          </>
        ) : (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">
              Connect Your Wallet
            </h3>
            <p className="text-gray-400 mb-6">
              Please connect your wallet in the top-right corner to start
              trading with Anoma's intent-centric system.
            </p>
            <div className="text-sm text-gray-500">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Wallet required for all trading functionality
            </div>
          </div>
        )}

        {/* Footer */}
        {!routes && !isWalletConnected && (
          <div className="text-center space-y-4 mt-12">
            <div className="text-sm text-gray-500">
              Intent-Centric • Multi-Chain • Privacy-First
            </div>
            <p className="text-xs text-gray-400 max-w-md">
              This prototype demonstrates Anoma's vision for intent-centric
              trading. When Anoma launches, real intent matching will replace
              these simulations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
