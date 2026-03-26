import "../global.css";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AppProvider, useApp } from "@/context/app-context";

function RootLayoutNav() {
  const { isLoggedIn } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(tabs)";

    if (!isLoggedIn && inAuthGroup) {
      router.replace("/login");
    } else if (isLoggedIn && !inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isLoggedIn, segments, router]);

  return (
    <>
      <Slot />
      <StatusBar style="dark" />
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootLayoutNav />
    </AppProvider>
  );
}
