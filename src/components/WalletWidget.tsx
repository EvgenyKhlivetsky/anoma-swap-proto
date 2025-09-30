import { useState } from "react";

// Extend Window interface for TypeScript
declare global {
  interface Window {
    updateWalletBalance?: (token: string, amount: number) => void;
  }
}

type WalletBalance = {
  [token: string]: number;
};

type Props = {
  onBalanceChange?: (balances: WalletBalance) => void;
  onConnectionChange?: (connected: boolean) => void;
};

const INITIAL_BALANCES: WalletBalance = {
  ETH: 5.234,
  USDC: 1250.5,
  DAI: 750.25,
  USDT: 500.0,
  SOL: 12.8,
  MATIC: 2500.0,
};

export default function WalletWidget({
  onBalanceChange,
  onConnectionChange,
}: Props) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balances, setBalances] = useState<WalletBalance>(INITIAL_BALANCES);

  const handleConnect = async () => {
    setIsConnecting(true);
    // Simulate wallet connection
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsConnected(true);
    setIsConnecting(false);

    // Initialize localStorage with wallet data
    localStorage.setItem("walletBalances", JSON.stringify(balances));
    localStorage.setItem("walletConnected", "true");
    window.updateWalletBalance = updateBalance;

    onBalanceChange?.(balances);
    onConnectionChange?.(true);
  };

  const updateBalance = (token: string, amount: number) => {
    setBalances((prev) => {
      const newBalances = {
        ...prev,
        [token]: Math.max(0, prev[token] + amount),
      };
      onBalanceChange?.(newBalances);
      // Store balances in localStorage for other components to access
      localStorage.setItem("walletBalances", JSON.stringify(newBalances));

      // Dispatch custom event to notify other components of balance changes
      window.dispatchEvent(new CustomEvent("walletBalanceUpdate"));

      return newBalances;
    });
  };

  // Store initial balances and update function availability in localStorage
  useState(() => {
    if (isConnected) {
      localStorage.setItem("walletBalances", JSON.stringify(balances));
      localStorage.setItem("walletConnected", "true");
      // Store a way for other components to trigger balance updates
      window.updateWalletBalance = updateBalance;
    } else {
      localStorage.removeItem("walletBalances");
      localStorage.setItem("walletConnected", "false");
      delete window.updateWalletBalance;
    }
  });

  if (!isConnected) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Wallet</h3>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-6 py-2 rounded font-medium transition-colors flex items-center justify-center space-x-2 mx-auto"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <span>Connect Wallet</span>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2">Mocked functionality</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Wallet</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-400">Connected</span>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(balances).map(([token, balance]) => (
          <div key={token} className="flex items-center justify-between py-1">
            <span className="text-gray-300 font-medium">{token}</span>
            <span className="text-white font-mono">
              {balance.toFixed(token === "ETH" ? 4 : 2)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          Mock wallet • Balances update on swap execution
        </div>
      </div>
    </div>
  );
}
