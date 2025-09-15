"use client"

import React, { useRef, useState } from "react"
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, Image, Dimensions } from "react-native"
import { Link, useRouter } from "expo-router"
import { ThemeProvider, useTheme } from "@/theme/theme-provider"
import { TextInput, validateEmail, validatePhone } from "@/components/ui/Inputs/input"
import { Mail, MoveRight, Phone, PhoneIcon, MoveLeftIcon, UserRound, KeyRound, Icon } from 'lucide-react-native';
import { Checkbox } from "@/components/ui/checkbox/checkbox"
import { Button } from "@/components/ui/buttons/Buttons"
import { Video, AVPlaybackStatus, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { IconButton } from "@/components/ui/buttons/IconButton"
import { signUpUser } from "@/api/auth"
import { AnimatedErrorScreen } from "@/components/ui/error/error-screen"
import { ErrorIllustration } from "@/components/ui/error/ErrorIllustration"
const { width, height } = Dimensions.get("window")
import { useSelector, useDispatch } from 'react-redux'
import { signUpStart, signUpFailure, signUpSuccess } from '@/features/auth/auth-slice'
import { RootState } from "@/store"
import PopupNotification from "@/components/Notification"

const inititalState = {
    name: "",
    emailOrPhone: "",
}

export default function SignUp() {
    const [payload, setPayload] = useState(inititalState)
    type PayloadKey = keyof typeof payload;
    const [agreed, setAgreed] = useState(false)
    const { colors, spacing, borderRadius, typography } = useTheme();
    const [fieldType, setFieldType] = useState('email');
    const [steps, setSteps] = useState(0);
    const videoRef = useRef<Video>(null);
    const router = useRouter();
    const { error, isLoading } = useSelector((state: RootState) => state.authReducer);
    const [notification, setNotification] = useState({
        type: "success",
        message: "",
        visible: false,
    });
    const dispatch = useDispatch()

    const hideNotification = () => {
        setNotification({
            type: "success",
            message: "",
            visible: false,
        });
    }

    const showNotification = (type: "success" | "error" | "info" | "warning", message: string) => {
        setNotification({
            type,
            message,
            visible: true,
        });
    }


    const handleChange = (text: any) => {
        if (steps !== 3) {
            const key = fields[steps].key;
            setPayload((prev) => ({ ...prev, [key]: text }));
        }
        else {
            // Remove non-numeric characters
            const cleaned = text.replace(/[^0-9]/g, '');

            let formatted = '';

            if (cleaned.length <= 2) {
                formatted = cleaned;
            } else if (cleaned.length <= 4) {
                formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
            } else if (cleaned.length <= 8) {
                formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4)}`;
            } else {
                formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 8)}`;
            }

            setPayload((prev) => ({ ...prev, [key]: formatted }));
        }
    };

    const handlePlaybackUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded && status.durationMillis && status.positionMillis >= status.durationMillis - 6000) {
            // restart video just before it ends
            videoRef.current?.replayAsync();
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.neutral.lightest,
        }
        ,
        logoContainer: {
            width: '100%',
            height: 400,
            backgroundColor: colors.primary.main,
            borderBottomLeftRadius: borderRadius.primary,
            borderBottomRightRadius: borderRadius.primary,
            overflow: 'hidden',
            position: 'relative'
        }
        ,
        logo: {
            width: '100%',
            height: '100%'
        },
        formContainer: {
            paddingHorizontal: 40,
            marginTop: 40
        },
        checkboxContainer: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 30,
        },
        termsText: {
            marginLeft: 10,
            color: colors.link.dark,
            textDecorationLine: 'underline',
            fontFamily: typography.fontFamily.sansSerif.manropeMedium,
            fontSize: typography.variants.baseTextStyles.label.fontSize,
        },
        submitButton: {
            backgroundColor: colors.button.main,
            borderRadius: 25,
            padding: 15,
            alignItems: "center",
            marginBottom: 15,
            borderWidth: 1,
            borderColor: colors.neutral.white,
        },
        submitButtonText: {
            color: colors.neutral.white,
            fontSize: 18,
            fontWeight: "600",
        },
        signUpButton: {
            backgroundColor: "transparent",
            borderRadius: 25,
            padding: 15,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.neutral.light,
        },
        signUpButtonText: {
            color: colors.neutral.white,
            fontSize: 18,
            fontWeight: "600",
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
        },
        backIcon: {
            backgroundColor: colors.neutral.lightest,
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 10000
        }
    })

    const fields = [
        { label: 'Enter your Name', key: 'name' as PayloadKey, placeholder: 'eg. Jhon Doe', icon: "UserRound" },
        { label: 'Enter your email address', key: 'emailOrPhone' as PayloadKey, placeholder: 'eg. jhondoe@mail.com', icon: "Mail" },
    ];

    const handleSignUp = async () => {
        try {
            if (!agreed) {
                showNotification("error", "Please agree to the terms of use");
                return;
            }
            if(!validateEmail(payload.emailOrPhone)) {
                showNotification("error", "Please enter a valid email address");
                return;
            }
            dispatch(signUpStart());
            await signUpUser({ ...payload, is_agreed_to_terms: agreed });
            dispatch(signUpSuccess(payload.emailOrPhone));
            setPayload(inititalState);
            router.push('/(auth)/otp-signup');
        }
        catch (err: any) {
            // handle signUp error gracefully
            setSteps(0);
            dispatch(signUpFailure(err.response.data.message || "Something bad happend during signup."));
            setPayload(inititalState);
        }
    }

    const handleNext = () => {
        if (steps < fields.length - 1) {
            setSteps((prev) => prev + 1);
        } else {
            // Final submit
            handleSignUp();
        }
    };

    const handleBack = () => {
        if (steps > 0) {
            setSteps((prev) => prev - 1);
        }
    };

    const { label, key, placeholder, icon } = fields[steps];

    const renderIcon = () => {
        switch (icon) {
            case 'UserRound':
                return <UserRound color={colors.icon.input} size={20} />
            case 'Mail':
                return <Mail color={colors.icon.input} size={20} />
            default:
                return <UserRound color={colors.icon.input} size={20} />
        }
    }


    if (error) {
        return (
            <ThemeProvider>
                <AnimatedErrorScreen
                    title="Oops! Something went wrong"
                    message={error}
                    onRetry={() => dispatch(signUpFailure(""))}
                    illustration={<ErrorIllustration />}
                    errorCode="ERR_NETWORK_FAILURE"
                />
            </ThemeProvider>
        )
    }


    return (
        <SafeAreaView style={styles.container} >
            <PopupNotification
                type={notification.type}
                message={notification.message}
                visible={notification.visible}
                onClose={hideNotification}
                duration={4000}
            />
            <View style={styles.logoContainer}>
                {
                    steps > 0 && (
                        <IconButton style={styles.backIcon} icon={<MoveLeftIcon color={"#000"} />} size="large" onPress={handleBack} accessibilityLabel="go back" />
                    )
                }

                <Video
                    ref={videoRef}
                    source={require('../../assets/videos/bg-video.mp4')}
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



            {/* Form */}
            <View style={styles.formContainer}>



                {
                    fieldType === 'phone' ? (
                        <>
                            <Text style={styles.label}>Enter your phone number</Text>
                            <TextInput value={payload[key]} keyboardType="numeric" inputType="phone" placeholder="eg. +91-8888888888" onChangeText={handleChange} style={{ marginBottom: 10, paddingTop: spacing.xs, paddingBottom: spacing.xs }} rightIcon={
                                <PhoneIcon color={colors.icon.input} size={20} />
                            } />
                        </>
                    ) : (
                        <>
                            <Text style={styles.label}>{label}</Text>
                            <TextInput value={payload[key]} inputType={steps === 2 ? 'email' : steps === 3 ? 'dob' : 'text'} keyboardType={steps === 3 ? "numeric" : steps === 2 ? 'email-address' : 'default'} placeholder={placeholder} onChangeText={handleChange} style={{ marginBottom: 10, paddingTop: spacing.xs, paddingBottom: spacing.xs }} rightIcon={
                                renderIcon()
                            } />
                        </>
                    )
                }

                <View style={styles.checkboxContainer}>
                    <Checkbox checked={agreed} onToggle={() => setAgreed(!agreed)} style={{ marginLeft: 8 }} />
                    <Link href={"/privacy-policy"} style={styles.termsText}>I agree with terms of use</Link>
                </View>

                <Button loading={isLoading} disabled={payload[key] === ""} title={`${steps === fields.length - 1 ? "Submit" : "Next"}`} onPress={handleNext} style={{ marginBottom: spacing.md }} fullWidth size="large" icon={
                    <MoveRight color={payload[key] !== "" ? colors.icon.light : colors.icon.disabled} size={spacing.buttonIcon} />
                } iconPosition="right" />

                {
                    steps === 2 && (
                        null
                    )
                }

            </View>
            <Text style={styles.linkToSignup}>Already have account? <Link href={'/(auth)/sign-in'} style={{ color: colors.link.dark, textDecorationLine: 'underline' }}>Sign In</Link></Text>
        </SafeAreaView>
    )
}

