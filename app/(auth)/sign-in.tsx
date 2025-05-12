"use client"

import React, { useRef, useState } from "react"
import { StyleSheet, View, Text, SafeAreaView, Image, Dimensions } from "react-native"
import { Link, useRouter } from "expo-router"
import { ThemeProvider, useTheme } from "@/theme/theme-provider"
import { TextInput, validateEmail } from "@/components/ui/Inputs/input"
import { Mail, MoveRight } from 'lucide-react-native';
import { Button } from "@/components/ui/buttons/Buttons"
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { signInUser } from "@/api/auth"
import { useSelector, useDispatch } from 'react-redux'
import { signInStart, signInFailure, signInSuccess } from '@/features/auth/auth-slice'
import { RootState } from "@/store"
import { AnimatedErrorScreen } from "@/components/ui/error/error-screen"
import { ErrorIllustration } from "@/components/ui/error/ErrorIllustration"

const { width } = Dimensions.get("window")

export default function SignIn() {
    const [email, setEmail] = useState("")
    const { colors, spacing, borderRadius, typography } = useTheme();
    const videoRef = useRef<Video>(null);
    const router = useRouter();
    const {error, isLoading} = useSelector((state: RootState) => state.authReducer);
    const dispatch = useDispatch()

    const handleSignIn = async () => {
        try {
            dispatch(signInStart());
            await signInUser(email);
            dispatch(signInSuccess(email));
            router.push('/(auth)/otp-signin');
        }
        catch (err) {
            dispatch(signInFailure("Something went wrong during sign in."));
            console.error(err);
            setEmail("");
        }
    };

    const handlePlaybackUpdate = (status: any) => {
        if (status.isLoaded && status.durationMillis && status.positionMillis >= status.durationMillis - 6000) {
            // restart video just before it ends
            videoRef.current?.replayAsync();
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.neutral.lightest,
        },
        logoContainer: {
            width: '100%',
            height: 400,
            backgroundColor: colors.primary.main,
            borderBottomLeftRadius: borderRadius.primary,
            borderBottomRightRadius: borderRadius.primary,
            overflow: 'hidden',
            position: 'relative'
        },
        logo: {
            width: '100%',
            height: '100%'
        },
        formContainer: {
            paddingHorizontal: 40,
            marginTop: 40
        },
        label: {
            color: colors.text.secondary,
            marginBottom: 8,
            fontFamily: typography.fontFamily.sansSerif.manropeMedium,
            fontSize: typography.variants.baseTextStyles.label.fontSize,
            marginLeft: 8
        },
        dont: {
            width: 160,
            height: 100,
            marginLeft: width / 2 - (160 / 2),
            marginTop: 160
        },
        linkToSignup: {
            textAlign: 'center',
            marginTop: 20,
            fontFamily: typography.fontFamily.sansSerif.manropeMedium,
            color: colors.text.secondary
        }
    });

   if (error) {
        return (
            <ThemeProvider>
                <AnimatedErrorScreen
                    title="Oops! Something went wrong"
                    message={error}
                    onRetry={() => dispatch(signInFailure(""))}
                    illustration={<ErrorIllustration />}
                    errorCode="ERR_NETWORK_FAILURE"
                />
            </ThemeProvider>
        )
    }



    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.logoContainer}>
                <Video
                    ref={videoRef}
                    source={require('../../assets/images/bg-video.mp4')}
                    style={StyleSheet.absoluteFill}
                    resizeMode={ResizeMode.COVER}
                    onPlaybackStatusUpdate={handlePlaybackUpdate}
                    shouldPlay
                    isMuted
                />
                <LinearGradient
                    colors={['transparent', colors.primary.main]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                />
                <View style={styles.dont}>
                    <Image source={require("../../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
                </View>
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.label}>Enter your email address</Text>
                <TextInput 
                    value={email} 
                    inputType="email"
                    keyboardType="email-address"
                    placeholder="eg. jhondoe@mail.com" 
                    onChangeText={setEmail} 
                    style={{ marginBottom: 10, paddingTop: spacing.xs, paddingBottom: spacing.xs }} 
                    rightIcon={<Mail color={colors.icon.input} size={20} />}
                />

                <Button 
                    loading={isLoading} 
                    disabled={email === "" || !validateEmail(email)} 
                    title="Continue" 
                    onPress={handleSignIn} 
                    style={{ marginBottom: spacing.md, marginTop: spacing.md }} 
                    fullWidth 
                    size="large" 
                    icon={
                        <MoveRight 
                            color={email !== "" ? colors.icon.light : colors.icon.disabled} 
                            size={spacing.buttonIcon} 
                        />
                    } 
                    iconPosition="right" 
                />
            </View>
            <Text style={styles.linkToSignup}>Don't have an account? <Link href={'/(auth)/sign-up'} style={{ color: colors.link.dark, textDecorationLine: 'underline' }}>Sign Up</Link></Text>
        </SafeAreaView>
    )
}
