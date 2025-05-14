import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  SafeAreaView,
  Platform,
  FlatList,
  Image,
} from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { colors } from "../../theme/coloring"
import { typography } from "../../theme/typography"
import { spacing } from "../../theme/spacing"
import { borderRadius } from "../../theme/border-radius"
import { Feather } from "@expo/vector-icons"
import Svg, { Path, Circle, Ellipse, G, Rect, Defs, Stop, RadialGradient } from "react-native-svg"
const { width, height } = Dimensions.get("window")
const ONBOARDING_COMPLETE_KEY = "@onboarding_complete"

// Onboarding data with multiple screens
const onboardingData = [
  {
    id: "1",
    title: "Welcome to Palash",
    description: "Your journey to better health and wellness starts here",
    illustration: require('../../assets/images/onboarding-3.png'),
  },
  {
    id: "2",
    title: "Discover Yoga",
    description: "Find your balance with expert-guided yoga sessions tailored to your needs",
    illustration: require('../../assets/images/onboarding-2.png'),
  },
  {
    id: "3",
    title: "Mindful Meditation",
    description: "Reduce stress and improve focus with our guided meditation practices",
    illustration: require('../../assets/images/onboarding-1.png'),
  },
]

const OnboardingScreen = () => {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollX = useRef(new Animated.Value(0)).current
  const slidesRef = useRef<FlatList<any>>(null)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY)
      if (onboardingComplete === "true") {
        router.replace("/(main)")
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error)
    }
  }

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true")
      router.replace("/(main)")
    } catch (error) {
      console.error("Error saving onboarding status:", error)
      router.replace("/(main)")
    }
  }

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true")
      router.replace("/(main)")
    } catch (error) {
      console.error("Error saving onboarding status:", error)
      router.replace("/(main)")
    }
  }

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 })
    } else {
      handleGetStarted()
    }
  }

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any }) => {
    setCurrentIndex(viewableItems[0]?.index || 0)
  }).current

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current

  // Render onboarding item
  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.slide}>
        <Image source={item.illustration} style={styles.illustration} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    )
  }

  // Pagination dots
  const Paginator = () => {
    return (
      <View style={styles.paginationContainer}>
        {onboardingData.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width]

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 20, 10],
            extrapolate: "clamp",
          })

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          })

          return (
            <Animated.View
              key={index.toString()}
              style={[styles.dot, { width: dotWidth, opacity }, index === currentIndex && styles.dotActive]}
            />
          )
        })}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.content}>
        {/* Skip button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Carousel */}
        <Animated.FlatList
          data={onboardingData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          scrollEventThrottle={32}
          ref={slidesRef}
          style={styles.carousel}
        />

        {/* Bottom section with pagination and button */}
        <View style={styles.bottomSection}>
          {/* Pagination */}
          <Paginator />

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <LinearGradient
                colors={[colors.primary.main, colors.secondary.main]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"}
                </Text>
                <Feather
                  name={currentIndex === onboardingData.length - 1 ? "check" : "arrow-right"}
                  size={20}
                  color={colors.neutral.white}
                  style={styles.buttonIcon}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
  },
  skipButton: {
    position: "absolute",
    top: Platform.OS === 'ios' ? spacing.lg : spacing.lg + (StatusBar.currentHeight || 0),
    right: spacing.lg,
    zIndex: 10,
    padding: spacing.sm,
  },
  skipText: {
    fontFamily: typography.fontFamily.sansSerif.manropeMedium,
    fontSize: typography.variants.paragraph.fontSize,
    color: colors.text.secondary,
  },
  carousel: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationContainer: {
    width: width * 0.9,
    height: height * 0.45,
    borderRadius: borderRadius.primary,
    overflow: "hidden",
    marginTop: spacing.xl,
    elevation: 4,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  illustrationBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    marginTop: spacing.lg,
  },
  title: {
    fontFamily: typography.fontFamily.serif.Hero,
    fontSize: typography.variants.heading.fontSize,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  description: {
    fontFamily: typography.fontFamily.sansSerif.manropeMedium,
    fontSize: typography.variants.paragraph.fontSize,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: typography.variants.paragraph.lineHeight,
  },
  bottomSection: {
    paddingBottom: Platform.OS === 'ios' ? spacing["3xl"] : spacing["2xl"],
  },
  paginationContainer: {
    flexDirection: "row",
    height: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary.main,
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: colors.primary.main,
  },
  buttonContainer: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  button: {
    borderRadius: borderRadius.primary,
    overflow: "hidden",
    elevation: 4,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  buttonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: typography.variants.baseTextStyles.button.fontSize,
    color: colors.neutral.white,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginRight: spacing.sm,
  },
  buttonIcon: {
    marginLeft: spacing.xs,
  },
  illustration: {
    width: width * 0.9,
    height: height * 0.45,
    borderRadius: borderRadius.primary,
    marginTop: spacing.xl,
  },
})

export default OnboardingScreen 