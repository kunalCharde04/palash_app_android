import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView } from "react-native"
import React, { useEffect } from "react";
import { useTheme } from "@/theme/theme-provider";
import { Link, useRouter } from "expo-router"
import { Button } from "@/components/ui/buttons/Buttons";
import { Ionicons } from '@expo/vector-icons'
import { Camera, MoveRight } from 'lucide-react-native';
const { width, height } = Dimensions.get("window")


const Index = () => {
  const {colors, borderRadius, spacing, typography} = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>

        <Image source={require("../../assets/images/squiggles.png")} style={{width: 400, height: 400, marginTop: 80, opacity: 0.3, position: 'absolute'}}  resizeMode="cover" />
      <View style={styles.imagesContainer}>

        <View style={[styles.imageWrapper, styles.topImage]} >
          <View style={{width: '100%', height: '100%', position: 'absolute', top: 20, right: 20, borderRadius: borderRadius.primary}}>
        <Image source={require("../../assets/images/app-images/ingredients.png")} style={{width: '100%', height: '100%', borderRadius: borderRadius.primary}}  resizeMode="cover" />
          </View>
        </View>
        <View style={[styles.imageWrapper, styles.bottomLeftImage]} >
          <View style={{width: '100%', height: '100%', position: 'absolute', top: 20, right: 20, borderRadius: borderRadius.primary}}>
        <Image source={require("../../assets/images/app-images/meditation.png")} style={{width: '100%', height: '100%', borderRadius: borderRadius.primary}}  resizeMode="cover" />
          </View>
        </View>

        <View style={[styles.imageWrapper, styles.bottomRightImage]} >
          <View style={{width: '100%', height: '100%', position: 'absolute', top: 20, right: 20, borderRadius: borderRadius.primary}}>
        <Image source={require("../../assets/images/app-images/products.png")} style={{width: '100%', height: '100%', borderRadius: borderRadius.primary}}  resizeMode="cover" />
          </View>
        </View>
      </View>

      <View style={styles.logoContainer}>
        <Image source={require("../../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
      </View>

      <Text style={{marginTop: -2, marginBottom: 40, color: colors.text.inverse, fontFamily: typography.fontFamily.sansSerif.manropeMedium, opacity: 0.8}}>Read our <Link href={'/privacy-policy'} style={{color: colors.link.light,  textDecorationLine: "underline"}}>Privacy Policy</Link>.</Text>


      <Button title="Sign In"  onPress={() => {return router.push('/(auth)/sign-in')}}  style={{ marginBottom: spacing.md}} variant="secondary" textStyle={{color: colors.text.inverse}} fullWidth size="large"  />

      <Button title="Get Started" onPress={() => {return router.push('/(auth)/sign-up')}}  style={{backgroundColor: colors.button.accent}} textStyle={{color: colors.text.primary}} fullWidth size="large" icon={
        <MoveRight color={colors.icon.dark} size={spacing.buttonIcon} />
      } iconPosition="right" />
    
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a2924",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
    position: "relative",
  },
  imagesContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  imageWrapper: {
    position: "absolute",
    backgroundColor: "#1d473e",
    borderRadius: 32,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  topImage: {
    width: width * 0.40,
    aspectRatio: 1,
    top: -5,
    left: 100,
    opacity: 0.8,
    // left: width / 2 - (width * 0.45) / 2,
    transform: [{ rotate: "-10deg" }],
    // opacity: 0
  },
  bottomLeftImage: {
    width: width * 0.46,
    aspectRatio: 1,
    bottom: 300,
    left: -40,
    transform: [{ rotate: "-20deg" }],
  },
  bottomRightImage: {
    width: width * 0.35,
    aspectRatio: 1,
    bottom: 350,
    opacity: 0.7,
    right: -50,
    transform: [{ rotate: "10deg" }],
  },
  logoContainer: {
    marginTop: "auto",
    alignItems: "center",
    zIndex: 10,
  },
  logo: {
    width: 150,
    height: 80,
  },
  buttonsContainer: {
    width: "100%",
    maxWidth: 400,
    marginBottom: 40,
    gap: 24,
    zIndex: 10,
  },
  signInButton: {
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    color: "white",
    fontSize: 22,
    fontWeight: "500",
  },
  getStartedButton: {
    height: 90,
    borderRadius: 45,
    backgroundColor: "#ffc18e",
    justifyContent: "center",
    alignItems: "center",
  },
  getStartedText: {
    color: "#0a2924",
    fontSize: 22,
    fontWeight: "500",
  },
})


export default Index;