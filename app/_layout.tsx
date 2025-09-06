import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TradingBotProvider } from "@/providers/TradingBotProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

console.log('RootLayout: Initializing app');

// Prevent auto hide splash screen
SplashScreen.preventAutoHideAsync().catch(console.warn);

const queryClient = new QueryClient();

function RootLayoutNav() {
  console.log('RootLayoutNav: Rendering stack');
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Back",
      headerStyle: {
        backgroundColor: '#0A0E27',
      },
      headerTintColor: '#FFFFFF',
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="bot-config" options={{ 
        title: "Configure Bot",
        presentation: "modal" 
      }} />
      <Stack.Screen name="exchange-connect" options={{ 
        title: "Connect Exchange",
        presentation: "modal" 
      }} />
      <Stack.Screen name="wallet-connect" options={{ 
        title: "Connect Wallet",
        presentation: "modal" 
      }} />
    </Stack>
  );
}

export default function RootLayout() {
  console.log('RootLayout: Rendering root layout');
  useEffect(() => {
    console.log('RootLayout: Hiding splash screen');
    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.warn('Error hiding splash screen:', error);
      }
    };
    hideSplash();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <TradingBotProvider>
              <RootLayoutNav />
            </TradingBotProvider>
          </AuthProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}