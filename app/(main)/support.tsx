"use client"

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@/theme/theme-provider';
import { MessageSquare, Phone, Mail, HelpCircle, ChevronRight, Shield, ChevronDown, ChevronUp } from 'lucide-react-native';

interface SupportSection {
  title: string;
  icon: React.ReactNode;
  items: {
    title: string;
    description: string;
    action?: () => void;
  }[];
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function SupportScreen() {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const router = useRouter();
  const [expandedFAQs, setExpandedFAQs] = useState<number[]>([]);

  const faqItems: FAQItem[] = [
    {
      question: "How do I book a service?",
      answer: "To book a service, navigate to the service you're interested in, select your preferred date and time, and follow the booking process. You'll receive a confirmation email once your booking is confirmed."
    },
    {
      question: "What is your cancellation policy?",
      answer: "You can cancel your booking up to 24 hours before the scheduled time without any charges. Cancellations made within 24 hours may be subject to a cancellation fee."
    },
    {
      question: "How do I reschedule my appointment?",
      answer: "You can reschedule your appointment through the 'Booked Services' section in your profile. Select the booking you want to reschedule and choose a new date and time from the available slots."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and digital payment methods including UPI, Google Pay, and Apple Pay."
    },
    {
      question: "How do I contact customer support?",
      answer: "You can reach our customer support team through email at support@palash.com or call us at +1 (555) 123-4567. Our support team is available Monday to Friday, 9 AM to 6 PM."
    }
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQs(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const supportSections: SupportSection[] = [
    {
      title: "Get Help",
      icon: <HelpCircle size={24} color={colors.primary.main} />,
      items: [
        {
          title: "Contact Support",
          description: "Get in touch with our support team",
          action: () => Linking.openURL('mailto:support@palash.com')
        }
      ]
    },
    {
      title: "Contact Us",
      icon: <MessageSquare size={24} color={colors.primary.main} />,
      items: [
        {
          title: "Email Support",
          description: "support@palash.com",
          action: () => Linking.openURL('mailto:support@palash.com')
        },
        {
          title: "Phone Support",
          description: "+1 (555) 123-4567",
          action: () => Linking.openURL('tel:+15551234567')
        }
      ]
    },
    {
      title: "Legal & Privacy",
      icon: <Shield size={24} color={colors.primary.main} />,
      items: [
        {
          title: "Privacy Policy",
          description: "Read our privacy policy and terms of service",
          action: () => router.push('/privacy-policy')
        }
      ]
    }
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
    },
    header: {
      marginBottom: spacing.xl,
      marginTop: spacing['6xl'],
    },
    title: {
      fontSize: typography.variants.heading.fontSize,
      fontWeight: 800,
      fontFamily: typography.fontFamily.sansSerif.manropeMedium,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: typography.variants.paragraph.fontSize,
      color: colors.text.secondary,
      marginBottom: spacing.lg,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: 22,
      fontFamily: typography.fontFamily.sansSerif.manropeMedium,
      color: colors.text.primary,
      marginLeft: spacing.sm,
    },
    card: {
      backgroundColor: colors.neutral.lightest,
      borderRadius: borderRadius.primary,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    cardTitle: {
      fontSize: typography.variants.paragraph.fontSize,
      fontFamily: typography.fontFamily.sansSerif.manropeMedium,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    cardDescription: {
      fontSize: typography.variants.caption.fontSize,
      color: colors.text.secondary,
    },
    cardContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardLeft: {
      flex: 1,
    },
    cardRight: {
      marginLeft: spacing.md,
    },
    faqSection: {
      marginBottom: spacing.xl,
    },
    faqItem: {
      backgroundColor: colors.neutral.lightest,
      borderRadius: borderRadius.primary,
      marginBottom: spacing.md,
      overflow: 'hidden',
    },
    faqQuestion: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.lg,
    },
    faqQuestionText: {
      flex: 1,
      fontSize: typography.variants.paragraph.fontSize,
      fontFamily: typography.fontFamily.sansSerif.manropeMedium,
      color: colors.text.primary,
      marginRight: spacing.md,
    },
    faqAnswer: {
      padding: spacing.lg,
      paddingTop: 0,
      fontSize: typography.variants.paragraph.fontSize,
      color: colors.text.secondary,
      lineHeight: typography.variants.paragraph.lineHeight,
    },
    emergencySupport: {
      backgroundColor: colors.feedback.error.main,
      borderRadius: borderRadius.primary,
      padding: spacing.lg,
      marginTop: spacing.lg,
      marginBottom: 160,
    },
    emergencyTitle: {
      fontSize: typography.variants.paragraph.fontSize,
      fontFamily: typography.fontFamily.sansSerif.manropeMedium,
      color: colors.neutral.white,
      marginBottom: spacing.xs,
    },
    emergencyDescription: {
      fontSize: typography.variants.caption.fontSize,
      color: colors.neutral.white,
      opacity: 0.9,
    },
  });

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Support",
          headerStyle: {
            backgroundColor: colors.primary.main,
          },
          headerTintColor: colors.neutral.white,
        }}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>How can we help?</Text>
          <Text style={styles.subtitle}>
            We're here to help you with any questions or concerns you may have.
          </Text>
        </View>

        <View style={styles.faqSection}>
          <View style={styles.sectionHeader}>
            <HelpCircle size={24} color={colors.primary.main} />
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          </View>
          {faqItems.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleFAQ(index)}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                {expandedFAQs.includes(index) ? (
                  <ChevronUp size={20} color={colors.text.secondary} />
                ) : (
                  <ChevronDown size={20} color={colors.text.secondary} />
                )}
              </TouchableOpacity>
              {expandedFAQs.includes(index) && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </View>
          ))}
        </View>

        {supportSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              {section.icon}
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.card}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardLeft}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDescription}>{item.description}</Text>
                  </View>
                  <View style={styles.cardRight}>
                    <ChevronRight size={20} color={colors.text.secondary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity
          style={styles.emergencySupport}
          onPress={() => Linking.openURL('tel:+15551234567')}
          activeOpacity={0.7}
        >
          <Text style={styles.emergencyTitle}>Need Immediate Assistance?</Text>
          <Text style={styles.emergencyDescription}>
            Our emergency support team is available 24/7 to help you with urgent matters.
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
