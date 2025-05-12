import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { useSelector } from 'react-redux';
import { RootState } from "@/store";
import { BackHandler } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_COMPLETE_KEY = "@onboarding_complete";

const AuthStack = () => {
    const router = useRouter();
    const { accessToken } = useSelector((state: RootState) => state.authReducer);
    console.log("accessToken", accessToken);

    useEffect(() => {
        const checkAuthAndOnboarding = async () => {
            if (accessToken) {
                try {
                    const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
                    if (onboardingComplete === "true") {
                        router.replace('/(main)');
                    } else {
                        router.replace('/(auth)/onboarding');
                    }
                } catch (error) {
                    console.error("Error checking onboarding status:", error);
                    router.replace('/(main)');
                }
            }
        };

        checkAuthAndOnboarding();
    }, [accessToken]);

    // Handle hardware back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (accessToken) {
                router.replace('/(main)');
                return true; // Prevent default back behavior
            }
            return false; // Allow default back behavior for non-authenticated users
        });

        return () => backHandler.remove();
    }, [accessToken]);

    return (
        <Stack 
            screenOptions={{
                headerShown: false,
                gestureEnabled: false // Disable swipe back
            }}
        />
    );
};

export default AuthStack;