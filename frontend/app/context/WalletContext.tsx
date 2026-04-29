"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import {
  isConnected,
  getAddress,
  getNetwork,
  requestAccess,
  WatchWalletChanges,
} from "@stellar/freighter-api";
import { useQueryClient } from "@tanstack/react-query";
import { useWalletBalances, Balance } from "../hooks/useWalletBalances";

/** Matches the CallbackParams shape from @stellar/freighter-api's WatchWalletChanges. */
interface WalletChangeEvent {
  address: string;
  network: string;
  networkPassphrase: string;
  error?: unknown;
}

interface WalletState {
  address: string | null;
  network: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

interface WalletContextValue extends WalletState {
  // Derived from React Query
  balances: Balance[];
  totalUsdValue: number;
  isBalancesLoading: boolean;
  balanceError: string | null;
  lastBalanceSync: number | null;
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  fetchBalances: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    network: null,
    isConnected: false,
    isLoading: false,
    error: null,
  });

  const queryClient = useQueryClient();
  const networkWatcher = useRef<WatchWalletChanges | null>(null);

  // React Query handles fetching, caching, and background refetch
  const {
    data,
    isFetching: isBalancesLoading,
    error: balancesQueryError,
    refetch,
  } = useWalletBalances(state.address, state.network);

  const balances = data?.balances ?? [];
  const totalUsdValue = data?.totalUsdValue ?? 0;
  const lastBalanceSync = data?.lastSync ?? null;
  const balanceError = balancesQueryError
    ? (balancesQueryError as Error).message
    : null;

  // Expose a manual refetch for backwards compatibility
  const fetchBalances = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const connected = await isConnected();
        if (connected?.isConnected) {
          const [addrResult, netResult] = await Promise.all([
            getAddress(),
            getNetwork(),
          ]);
          if (addrResult?.address) {
            setState((s) => ({
              ...s,
              address: addrResult.address,
              network: netResult?.network ?? null,
              isConnected: true,
              error: null,
            }));
          }
        }
      } catch {
        // Freighter not installed or not connected — silent fail
      }
    })();
  }, []);

  // Watch for network/address changes when wallet is connected
  useEffect(() => {
    if (!state.isConnected) {
      if (networkWatcher.current) {
        try { networkWatcher.current.stop(); } catch {}
        networkWatcher.current = null;
      }
      return;
    }

    try {
      networkWatcher.current = new WatchWalletChanges(3000);
      networkWatcher.current.watch((changes: WalletChangeEvent) => {
        if (changes.network && changes.network !== state.network) {
          setState((s) => ({ ...s, network: changes.network }));
        }
      });
    } catch (error) {
      console.error("Failed to initialize network watcher:", error);
    }

    return () => {
      if (networkWatcher.current) {
        try { networkWatcher.current.stop(); } catch {}
        networkWatcher.current = null;
      }
    };
  }, [state.isConnected, state.network]);

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const accessResult = await requestAccess();
      if (accessResult?.error) {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: accessResult.error ?? "Connection rejected",
        }));
        return;
      }
      const [addrResult, netResult] = await Promise.all([
        getAddress(),
        getNetwork(),
      ]);
      setState((s) => ({
        ...s,
        address: addrResult?.address ?? null,
        network: netResult?.network ?? null,
        isConnected: !!addrResult?.address,
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to connect wallet",
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    // Remove cached balance data for this address on disconnect
    if (state.address) {
      queryClient.removeQueries({ queryKey: ["balances", state.address] });
    }
    setState({
      address: null,
      network: null,
      isConnected: false,
      isLoading: false,
      error: null,
    });
  }, [state.address, queryClient]);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        balances,
        totalUsdValue,
        isBalancesLoading,
        balanceError,
        lastBalanceSync,
        connect,
        disconnect,
        fetchBalances,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
