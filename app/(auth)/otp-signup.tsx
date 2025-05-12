"use client"

import React, { useRef, useState, useEffect } from "react"
import { StyleSheet, View, Text, Keyboard, Dimensions, NativeSyntheticEvent, TextInputKeyPressEventData, TextInput as RNTextInput, Image } from "react-native"
import { useTheme } from "@/theme/theme-provider"
import { Button } from "@/components/ui/buttons/Buttons"
import { MoveLeftIcon, MoveRight } from 'lucide-react-native'
import { Video, AVPlaybackStatus, ResizeMode } from "expo-av"
import { LinearGradient } from "expo-linear-gradient"
import { IconButton } from "@/components/ui/buttons/IconButton"
import { useRouter } from "expo-router"
import { useDispatch, useSelector } from "react-redux";
import { verifySignUpOTPFailure, verifySignUpOTPStart, verifySignUpOTPSuccess } from "@/features/auth/auth-slice";
import { RootState } from "@/store"
import { verifyOTP } from "@/api/auth"
const { width } = Dimensions.get("window")

export default function OtpVerification() {
    const { colors, spacing, borderRadius, typography } = useTheme()
    const [otp, setOtp] = useState<string[]>(['', '', '', ''])
    const [activeInput, setActiveInput] = useState<number>(0)
    const inputRefs = useRef<RNTextInput[]>([])
    const videoRef = useRef<Video>(null);
    const router = useRouter();
    const dispatch = useDispatch();
    const { phoneOrEmail, isLoading, error } = useSelector((state: RootState) => state.authReducer);

    // Initialize refs array
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, 4)
    }, [])

    const handleOtpChange = (value: string, index: number) => {
        // Only accept digits
        if (!/^\d*$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value.slice(0, 1)
        setOtp(newOtp)

        // If a value is entered, move to next input
        if (value && index < 3) {
            setActiveInput(index + 1)
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        // Handle backspace
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            setActiveInput(index - 1)
            inputRefs.current[index - 1]?.focus()

            // Clear previous input value
            const newOtp = [...otp]
            newOtp[index - 1] = ''
            setOtp(newOtp)
        }
    }

    const handleInputFocus = (index: number) => {
        setActiveInput(index)
    }

    // Check if all OTP fields are filled
    const isOtpComplete = otp.every(digit => digit !== '')

    // Verify OTP button handler
    const handleVerifyOtp = async () => {
        try {
            const otpValue = otp.join('')
            dispatch(verifySignUpOTPStart());
            const { accessToken, refreshToken, user } = await verifyOTP({ type: "signup", phoneOrEmail: phoneOrEmail, otp: otpValue });
            dispatch(verifySignUpOTPSuccess({ accessToken, refreshToken, user }));
            router.push('/(auth)/onboarding');
        }
        catch (err) {
            dispatch(verifySignUpOTPFailure("Something bad happend during OTP function."))
            console.log(err)
        }
    }

    // Reset all fields
    const handleResendOtp = () => {
        setOtp(['', '', '', ''])
        setActiveInput(0)
        inputRefs.current[0]?.focus()
        // Add your resend OTP logic here
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            position: 'relative'
        },
        backIcon: {
            backgroundColor: colors.neutral.lightest,
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 10000
        },
        title: {
            fontSize: typography.variants.hero.fontSize,
            lineHeight: typography.variants.subHeading.lineHeight,
            color: colors.text.primary,
            marginBottom: spacing.md,
            fontFamily: typography.fontFamily.serif.SubHeading,
        },
        description: {
            fontSize: typography.variants.paragraph.fontSize,
            lineHeight: typography.variants.paragraph.lineHeight,
            color: colors.text.secondary,
            marginBottom: spacing.xl,
            fontFamily: typography.fontFamily.sansSerif.manropeMedium,
        },
        otpContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: spacing.xl,
        },
        otpInput: {
            width: (width - 80 - spacing.md * 3) / 4,
            height: 60,
            borderRadius: borderRadius.input,
            borderWidth: 1,
            borderColor: colors.border.main,
            backgroundColor: colors.input.bg,
            textAlign: 'center',
            fontSize: 24,
            fontFamily: typography.fontFamily.sansSerif.manropeMedium,
            padding: 0,
            color: colors.text.primary,
        },
        activeInput: {
            borderColor: colors.primary.main,
            borderWidth: 2,
        },
        buttonContainer: {
            marginTop: spacing.xl,
        },
        resendText: {
            textAlign: 'center',
            marginTop: spacing.lg,
            color: colors.link.dark,
            fontFamily: typography.fontFamily.sansSerif.manropeMedium,
            textDecorationLine: 'underline',
        },

        logoContainer: {
            width: '100%',
            height: 400,
            backgroundColor: colors.primary.main,
            borderBottomLeftRadius: borderRadius.primary,
            borderBottomRightRadius: borderRadius.primary,
            overflow: 'hidden'
        },
        dont: {
            width: 160,
            height: 100,
            marginLeft: width / 2 - (160 / 2),
            marginTop: 160
        },

        logo: {
            width: '100%',
            height: '100%'
        },
        paddingHori: {
            paddingHorizontal: 40,
            paddingTop: 40
        }
    })


    const handlePlaybackUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded && status.durationMillis && status.positionMillis >= status.durationMillis - 6000) {
            // restart video just before it ends
            videoRef.current?.replayAsync();
        }
    };

    return (
        <View style={styles.container}>
            <IconButton style={styles.backIcon} icon={<MoveLeftIcon color={"#000"} />} size="large" onPress={() => router.push("/(auth)")} accessibilityLabel="go back" />
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
            <View style={styles.paddingHori}>
                <Text style={styles.description}>
                    Enter the 4-digit code sent to your email address or phone number
                </Text>

                <View style={styles.otpContainer}>
                    {[0, 1, 2, 3].map((index) => (
                        <RNTextInput
                            key={index}
                            ref={(ref) => {
                                if (ref) {
                                    inputRefs.current[index] = ref
                                }
                            }}
                            style={[
                                styles.otpInput,
                                activeInput === index && styles.activeInput
                            ]}
                            value={otp[index]}
                            onChangeText={(value) => handleOtpChange(value, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            onFocus={() => handleInputFocus(index)}
                            keyboardType="numeric"
                            maxLength={1}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Verify OTP"
                        onPress={handleVerifyOtp}
                        disabled={!isOtpComplete}
                        fullWidth
                        loading={isLoading}
                        size="large"
                        icon={
                            <MoveRight
                                color={isOtpComplete ? colors.icon.light : colors.icon.disabled}
                                size={spacing.buttonIcon}
                            />
                        }
                        iconPosition="right"
                    />
                    {/* <Text style={styles.resendText} onPress={handleResendOtp}>
          Resend OTP
        </Text> */}
                </View>
            </View>

        </View>
    )
}