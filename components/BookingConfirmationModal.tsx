import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '@/theme/theme-provider';
import { Button } from '@/components/ui/buttons/Buttons';
import { X, Mail, Clock, Calendar, CreditCard } from 'lucide-react-native';
import { TimeSlot } from '@/api/services';
import {TextInput}  from "@/components/ui/Inputs/input"



interface BookingConfirmationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (email: string) => void;
  selectedDate: string;
  selectedTimeSlot: TimeSlot;
  serviceName: string;
  servicePrice: string;
  serviceDuration: number | string;
  serviceLocation: string;
  serviceIsOnline: boolean;
  serviceId: string;
  user: any;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  selectedDate,
  user,
  selectedTimeSlot,
  serviceName,
  servicePrice,
  serviceDuration,
  serviceLocation,
  serviceIsOnline,
  serviceId,
}) => {
  const { colors, spacing, borderRadius } = useTheme();
  const [email, setEmail] = useState('');

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(8, 43, 18, 0.5)',
    },
    modalContent: {
      backgroundColor: colors.neutral.white,
      borderTopLeftRadius: borderRadius.primary,
      borderTopRightRadius: borderRadius.primary,
      padding: spacing.lg,
      maxHeight: '90%',
      marginTop: 'auto',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xl,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.neutral.light,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text.primary,
    },
    closeButton: {
      padding: spacing.sm,
    },
    bookingDetailsContainer: {
      marginBottom: spacing.xl,
      backgroundColor: colors.neutral.lightest,
      borderRadius: borderRadius.primary,
      padding: spacing.lg,
    },
    bookingDetailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    bookingDetailIcon: {
      marginRight: spacing.md,
      backgroundColor: colors.neutral.lightest,
      padding: spacing.sm,
      borderRadius: borderRadius.primary,
    },
    bookingDetailText: {
      fontSize: 16,
      color: colors.text.primary,
      flex: 1,
    },
    emailInputContainer: {
      marginBottom: spacing.xl,
      backgroundColor: colors.neutral.lightest,
      borderRadius: borderRadius.primary,
      padding: spacing.lg,
    },
    emailInputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    priceContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xl,
      padding: spacing.lg,
      backgroundColor: colors.neutral.lightest,
      borderRadius: 20,
    },
    priceLabel: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary.main,
    },
    priceValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary.main,
    },
    serviceDetailsContainer: {
      backgroundColor: colors.neutral.lightest,
      borderRadius: borderRadius.primary,
      padding: spacing.lg,
      marginBottom: spacing.xl,
    },
    serviceDetailsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    serviceDetailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.neutral.light,
    },
    serviceDetailLabel: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    serviceDetailValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.secondary.main,
    },
    confirmButton: {
      marginTop: spacing.xl,
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleConfirm = () => {
    if (email) {
      onConfirm(email);
    }
  };

 

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Confirm Booking</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.bookingDetailsContainer}>
              <View style={styles.bookingDetailItem}>
                <Calendar size={24} color={colors.primary.main} style={styles.bookingDetailIcon} />
                <Text style={styles.bookingDetailText}>{formatDate(selectedDate)}</Text>
              </View>
              <View style={styles.bookingDetailItem}>
                <Clock size={24} color={colors.primary.main} style={styles.bookingDetailIcon} />
                <Text style={styles.bookingDetailText}>{formatTime(selectedTimeSlot.startTime)}</Text>
              </View>
            </View>

            <View style={styles.emailInputContainer}>
              <Text style={styles.emailInputLabel}>Email for Invoice</Text>
              <TextInput
                placeholder="Enter your email address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.serviceDetailsContainer}>
              <Text style={styles.serviceDetailsTitle}>Service Details</Text>
              <View style={styles.serviceDetailRow}>
                <Text style={styles.serviceDetailLabel}>Service Name</Text>
                <Text style={styles.serviceDetailValue}>{serviceName}</Text>
              </View>
              {/* <View style={styles.serviceDetailRow}>
                <Text style={styles.serviceDetailLabel}>Duration</Text>
                <Text style={styles.serviceDetailValue}>{serviceDuration} minutes</Text>
              </View> */}
              <View style={styles.serviceDetailRow}>
                <Text style={styles.serviceDetailLabel}>Location</Text>
                <Text style={styles.serviceDetailValue}>{serviceLocation}</Text>
              </View>
              {/* <View style={[styles.serviceDetailRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.serviceDetailLabel}>Online Session</Text>
                <Text style={styles.serviceDetailValue}>{serviceIsOnline ? 'Yes' : 'No'}</Text>
              </View> */}
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Total Amount</Text>
              <Text style={styles.priceValue}>₹{servicePrice}</Text>
            </View>
          </ScrollView>

          <Button
            title="Proceed to Payment"
            onPress={handleConfirm}
            variant="primary"
            size="large"
            style={styles.confirmButton}
            disabled={!email}
            icon={<CreditCard size={20} color={colors.neutral.white} />}
          />
        </View>
      </View>
    </Modal>
  );
}; 