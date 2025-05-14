import React, {useEffect, useState} from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {Manrope_600SemiBold as manropeMedium} from "@expo-google-fonts/manrope";
import {useFonts} from "expo-font";
import { ThemeProvider } from "@/theme/theme-provider";
import {Provider} from "react-redux";
import { store } from "@/store";
import AsyncStorage from "@react-native-async-storage/async-storage";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Canela-Hero': require('../assets/fonts/Canela_Collection/Canela Family/Canela-Black-Trial.otf'),
    'Canela-Heading': require('../assets/fonts/Canela_Collection/Canela Condensed Family/CanelaCondensed-Black-Trial.otf'),
    'Canela-SubHeading': require('../assets/fonts/Canela_Collection/Canela Condensed Family/CanelaCondensed-Bold-Trial.otf'),
    manropeMedium
  });

  useEffect(() => {
    if(loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if(!loaded && !error) {
    return null;
  }

// Add this to your App.js or index.js
if (__DEV__) {
  const clearStorageOnRefresh = async () => {
    try {
      console.log("Development mode");
      // await AsyncStorage.clear();
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
    }
  };
  
  clearStorageOnRefresh();
}




  return (
    <Provider store={store}>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </Provider>
  );
}
