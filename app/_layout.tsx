import "../global.css";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ConvexProvider, useAuthToken } from "@/lib/convex";

function RootLayoutNav() {
  const token = useAuthToken();
  const segments = useSegments();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inTabs = segments[0] === "(tabs)";
    const inOnboarding = segments[0] === "onboarding";
    const inLogin = segments[0] === "login";

    if (!token && inTabs) {
      router.replace("/login");
    } else if (token && !inTabs && !inOnboarding && !inLogin) {
      router.replace("/onboarding");
    }
  }, [token, isLoading, segments, router]);

  if (isLoading) {
    return null;
  }

  return (
    <>
      <Slot />
      <StatusBar style="dark" />
    </>
  );
}

export default function RootLayout() {
  return (
    <ConvexProvider>
      <RootLayoutNav />
    </ConvexProvider>
  );
}