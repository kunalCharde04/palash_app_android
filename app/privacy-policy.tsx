"use client"
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, useColorScheme, Platform, StatusBar } from "react-native"
import { Stack, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/theme/theme-provider"
import React from "react"

function PrivacyPolicy() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const {colors} = useTheme();

  // Determine background and text colors based on color scheme
  const backgroundColor = isDark ? colors.neutral.darkest : colors.background.default
  const textColor = isDark ? colors.neutral.white : colors.text.primary
  const secondaryTextColor = isDark ? colors.neutral.light : colors.text.secondary
  const linkColor = isDark ? colors.link.dark : colors.link.light
  const headerBgColor = colors.primary.main
  const headerTextColor = colors.neutral.white
  const sectionBgColor = isDark ? colors.neutral.darker : colors.background.paper

  return (
    <>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={headerBgColor} />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={[styles.container, { backgroundColor }]}>
        {/* Custom Header */}
        <View style={[styles.header, { backgroundColor: headerBgColor }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={headerTextColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: headerTextColor }]}>Privacy Policy</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          <View style={[styles.section, { backgroundColor: sectionBgColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Privacy Policy</Text>
            <Text style={[styles.lastUpdated, { color: secondaryTextColor }]}>Last Updated: April 12, 2025</Text>

            <Text style={[styles.paragraph, { color: textColor }]}>
              Thank you for choosing to be part of our community at Our Company ("Company", "we", "us", or "our"). We
              are committed to protecting your personal information and your right to privacy. If you have any questions
              or concerns about this privacy policy or our practices with regard to your personal information, please
              contact us.
            </Text>

            <Text style={[styles.sectionSubtitle, { color: textColor }]}>1. Information We Collect</Text>
            <Text style={[styles.paragraph, { color: textColor }]}>
              We collect personal information that you voluntarily provide to us when you register on the application,
              express an interest in obtaining information about us or our products and services, when you participate
              in activities on the application, or otherwise when you contact us.
            </Text>
            <Text style={[styles.paragraph, { color: textColor }]}>
              The personal information that we collect depends on the context of your interactions with us and the
              application, the choices you make, and the products and features you use. The personal information we
              collect may include the following:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: textColor }]}>• Name and contact data</Text>
              <Text style={[styles.bulletItem, { color: textColor }]}>• Credentials</Text>
              <Text style={[styles.bulletItem, { color: textColor }]}>• Payment data</Text>
              <Text style={[styles.bulletItem, { color: textColor }]}>• Location data</Text>
            </View>

            <Text style={[styles.sectionSubtitle, { color: textColor }]}>2. How We Use Your Information</Text>
            <Text style={[styles.paragraph, { color: textColor }]}>
              We process your information for purposes based on legitimate business interests, the fulfillment of our
              contract with you, compliance with our legal obligations, and/or your consent.
            </Text>
            <Text style={[styles.paragraph, { color: textColor }]}>
              We use personal information collected via our application for a variety of business purposes described
              below. We process your personal information for these purposes in reliance on our legitimate business
              interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance
              with our legal obligations.
            </Text>

            <Text style={[styles.sectionSubtitle, { color: textColor }]}>
              3. Will Your Information Be Shared With Anyone?
            </Text>
            <Text style={[styles.paragraph, { color: textColor }]}>
              We only share information with your consent, to comply with laws, to provide you with services, to protect
              your rights, or to fulfill business obligations.
            </Text>
            <Text style={[styles.paragraph, { color: textColor }]}>
              We may process or share your data that we hold based on the following legal basis:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: textColor }]}>
                • Consent: We may process your data if you have given us specific consent to use your personal
                information for a specific purpose.
              </Text>
              <Text style={[styles.bulletItem, { color: textColor }]}>
                • Legitimate Interests: We may process your data when it is reasonably necessary to achieve our
                legitimate business interests.
              </Text>
              <Text style={[styles.bulletItem, { color: textColor }]}>
                • Performance of a Contract: Where we have entered into a contract with you, we may process your
                personal information to fulfill the terms of our contract.
              </Text>
              <Text style={[styles.bulletItem, { color: textColor }]}>
                • Legal Obligations: We may disclose your information where we are legally required to do so.
              </Text>
            </View>

            <Text style={[styles.sectionSubtitle, { color: textColor }]}>4. How Long Do We Keep Your Information?</Text>
            <Text style={[styles.paragraph, { color: textColor }]}>
              We keep your information for as long as necessary to fulfill the purposes outlined in this privacy policy
              unless otherwise required by law.
            </Text>
            <Text style={[styles.paragraph, { color: textColor }]}>
              We will only keep your personal information for as long as it is necessary for the purposes set out in
              this privacy policy, unless a longer retention period is required or permitted by law (such as tax,
              accounting or other legal requirements).
            </Text>

            <Text style={[styles.sectionSubtitle, { color: textColor }]}>5. How Do We Keep Your Information Safe?</Text>
            <Text style={[styles.paragraph, { color: textColor }]}>
              We aim to protect your personal information through a system of organizational and technical security
              measures.
            </Text>
            <Text style={[styles.paragraph, { color: textColor }]}>
              We have implemented appropriate technical and organizational security measures designed to protect the
              security of any personal information we process. However, despite our safeguards and efforts to secure
              your information, no electronic transmission over the Internet or information storage technology can be
              guaranteed to be 100% secure.
            </Text>

            <Text style={[styles.sectionSubtitle, { color: textColor }]}>
              6. Do We Collect Information From Minors?
            </Text>
            <Text style={[styles.paragraph, { color: textColor }]}>
              We do not knowingly collect data from or market to children under 18 years of age.
            </Text>

            <Text style={[styles.sectionSubtitle, { color: textColor }]}>7. Your Privacy Rights</Text>
            <Text style={[styles.paragraph, { color: textColor }]}>
              In some regions, such as the European Economic Area, you have rights that allow you greater access to and
              control over your personal information.
            </Text>
            <Text style={[styles.paragraph, { color: textColor }]}>
              If you would like to request to review, correct, update, suppress, or delete personal information that you
              have previously provided to us, you may contact us using the contact information provided.
            </Text>

            <Text style={[styles.sectionSubtitle, { color: textColor }]}>8. Controls For Do-Not-Track Features</Text>
            <Text style={[styles.paragraph, { color: textColor }]}>
              Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ("DNT")
              feature or setting you can activate to signal your privacy preference not to have data about your online
              browsing activities monitored and collected. At this stage, no uniform technology standard for recognizing
              and implementing DNT signals has been finalized.
            </Text>

            <Text style={[styles.sectionSubtitle, { color: textColor }]}>9. Changes To This Privacy Policy</Text>
            <Text style={[styles.paragraph, { color: textColor }]}>
              We may update this privacy policy from time to time. The updated version will be indicated by an updated
              "Revised" date and the updated version will be effective as soon as it is accessible. If we make material
              changes to this privacy policy, we may notify you either by prominently posting a notice of such changes
              or by directly sending you a notification.
            </Text>

            <Text style={[styles.sectionSubtitle, { color: textColor }]}>10. Contact Us</Text>
            <Text style={[styles.paragraph, { color: textColor }]}>
              If you have questions or comments about this policy, you may email us at{" "}
              <Text style={[styles.link, { color: linkColor }]}>privacy@ourcompany.com</Text> or contact us at:
            </Text>
            <Text style={[styles.paragraph, { color: textColor }]}>Our Company</Text>
            <Text style={[styles.paragraph, { color: textColor }]}>123 Privacy Street</Text>
            <Text style={[styles.paragraph, { color: textColor }]}>Privacy City, PC 12345</Text>
          </View>
        </ScrollView>

      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 10,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerRight: {
    width: 40, // Balance the header
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  bulletList: {
    marginLeft: 8,
    marginBottom: 16,
  },
  bulletItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  link: {
    textDecorationLine: "underline",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#c5d1c9',
  },
  acceptButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
})

export default PrivacyPolicy;