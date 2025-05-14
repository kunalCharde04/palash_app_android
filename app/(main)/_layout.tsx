import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from "@/store";
import { validateAccessToken, refreshAccessToken } from "@/api/auth";
import { getAccessToken, getRefreshToken } from "@/utils/token";
import { refreshTokenSuccess, refreshTokenFailure, logout } from "@/features/auth/auth-slice";
import { BackHandler, Alert, View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/theme/theme-provider';
import { BlurView } from 'expo-blur';
import { Home, Bell, User, Calendar } from 'lucide-react-native';

const MainLayout = () => {
    const router = useRouter();
    const { colors } = useTheme();

    // Handle hardware back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (router.canGoBack()) {
                return false;
            }
            
            Alert.alert(
                'Exit App',
                'Are you sure you want to exit?',
                [
                    {
                        text: 'Cancel',
                        onPress: () => null,
                        style: 'cancel'
                    },
                    {
                        text: 'Yes',
                        onPress: () => BackHandler.exitApp()
                    }
                ]
            );
            return true;
        });

        return () => backHandler.remove();
    }, []);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    elevation: 0,
                    backgroundColor: 'white',
                    height: 100,
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,
                    shadowColor: colors.neutral.dark,
                    shadowOffset: {
                        width: 0,
                        height: -2,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                tabBarBackground: () => (
                    <BlurView
                        tint="light"
                        intensity={90}
                        style={[
                            StyleSheet.absoluteFill,
                            {
                                borderTopLeftRadius: 30,
                                borderTopRightRadius: 30,
                                overflow: 'hidden',
                            }
                        ]}
                    />
                ),
                tabBarItemStyle: {
                    height: 80,
                    paddingVertical: 10,
                },
                tabBarActiveTintColor: colors.primary.main,
                tabBarInactiveTintColor: colors.text.secondary,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginBottom: 5,
                },
                tabBarIconStyle: {
                    marginTop: 5,
                },
                tabBarShowLabel: true,
                tabBarHideOnKeyboard: true,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[
                            styles.iconContainer 
                        ]}>
                            <Home size={size} color={focused ? colors.feedback.success.main : colors.text.secondary} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    title: 'Notifications',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[
                            styles.iconContainer,
                        ]}>
                            <Bell size={size} color={focused ? colors.feedback.success.main : colors.text.secondary} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="booked-services"
                options={{
                    title: 'My Bookings',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[
                            styles.iconContainer,
                        ]}>
                            <Calendar size={size} color={focused ? colors.feedback.success.main : colors.text.secondary} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[
                            styles.iconContainer,
                        ]}>
                            <User size={size} color={focused ? colors.feedback.success.main : colors.text.secondary} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="service/[id]"
                options={{
                    href: null,
                }}
            />

            <Tabs.Screen
                name="booking/[id]"
                options={{
                    href: null,
                }}
            />

            <Tabs.Screen
                name="support"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
};

const styles = StyleSheet.create({
    iconContainer: {
        padding: 8,
        borderRadius: 12,
    },
});

export default MainLayout;