import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider, useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import { ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || "http://127.0.0.1:3212";

export const convex = new ConvexReactClient(convexUrl);

const TokenStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

export function ConvexProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthProvider client={convex} storage={TokenStorage}>
      {children}
    </ConvexAuthProvider>
  );
}

export { useAuthActions, useAuthToken };
export const useAuth = useAuthActions;