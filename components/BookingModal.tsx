import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, StatusBar, SafeAreaView } from 'react-native';
import { useTheme } from '@/theme/theme-provider';
import { Button } from '@/components/ui/buttons/Buttons';
import { X } from 'lucide-react-native';
import { TimeSlot } from '@/api/services';
import { BookingConfirmationModal } from './BookingConfirmationModal';

interface BookingModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (date: string, timeSlot: TimeSlot, email: string) => void;
  serviceId: string;
  serviceName: string;
  servicePrice: string;
  availability: Array<{
    date: string;
    isBookable: boolean;
    timeSlots: TimeSlot[];
  }>;
  serviceDuration: number | string;
  serviceLocation: string;
  user: any;
  serviceIsOnline: boolean;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  serviceId,
  serviceName,
  servicePrice,
  availability,
  serviceDuration,
  serviceLocation,
  serviceIsOnline,
  user,
}) => {
  const { colors, spacing, borderRadius } = useTheme();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

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
      maxHeight: '80%',
      marginTop: 'auto',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text.primary,
    },
    closeButton: {
      padding: spacing.sm,
    },
    calendarContainer: {
      marginBottom: spacing.xl,
    },
    dateList: {
      marginBottom: spacing.lg,
    },
    dateItem: {
      padding: spacing.md,
      borderRadius: borderRadius.primary,
      marginRight: spacing.sm,
      minWidth: 100,
      alignItems: 'center',
    },
    dateItemSelected: {
      backgroundColor: colors.secondary.main,
    },
    dateText: {
      fontSize: 16,
      color: colors.text.primary,
    },
    dateTextSelected: {
      color: colors.neutral.white,
    },
    timeSlotsContainer: {
      marginTop: spacing.lg,
    },
    timeSlotTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    timeSlotGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    timeSlotItem: {
      padding: spacing.md,
      borderRadius: borderRadius.primary,
      borderWidth: 1,
      borderColor: colors.neutral.light,
      minWidth: '30%',
      alignItems: 'center',
    },
    timeSlotItemSelected: {
      backgroundColor: colors.secondary.main,
      borderColor: colors.secondary.main,
    },
    timeSlotText: {
      fontSize: 14,
      color: colors.text.primary,
    },
    timeSlotTextSelected: {
      color: colors.neutral.white,
    },
    confirmButton: {
      marginTop: spacing.xl,
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }),
      weekday: date.toLocaleString('default', { weekday: 'short' }),
    };
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };



  const handleConfirm = () => {
    if (selectedDate && selectedTimeSlot) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
  };

  const handleConfirmationConfirm = (email: string) => {
    if (selectedDate && selectedTimeSlot) {
      onConfirm(selectedDate, selectedTimeSlot, email);
      setShowConfirmation(false);
      onClose();
    }
  };


  return (
    <>
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
              <Text style={styles.modalTitle}>Select Date & Time</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.calendarContainer}>
                <Text style={styles.timeSlotTitle}>Select Date</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateList}>
                  {availability.map((day) => (
                    <TouchableOpacity
                      key={day.date}
                      style={[
                        styles.dateItem,
                        selectedDate === day.date && styles.dateItemSelected,
                      ]}
                      onPress={() => handleDateSelect(day.date)}
                      disabled={!day.isBookable}
                    >
                      <Text
                        style={[
                          styles.dateText,
                          selectedDate === day.date && styles.dateTextSelected,
                        ]}
                      >
                        {formatDate(day.date).weekday}
                      </Text>
                      <Text
                        style={[
                          styles.dateText,
                          { fontSize: 20, fontWeight: 'bold' },
                          selectedDate === day.date && styles.dateTextSelected,
                        ]}
                      >
                        {formatDate(day.date).day}
                      </Text>
                      <Text
                        style={[
                          styles.dateText,
                          selectedDate === day.date && styles.dateTextSelected,
                        ]}
                      >
                        {formatDate(day.date).month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {selectedDate && (
                <View style={styles.timeSlotsContainer}>
                  <Text style={styles.timeSlotTitle}>Select Time</Text>
                  <View style={styles.timeSlotGrid}>
                    {availability
                      .find((day) => day.date === selectedDate)
                      ?.timeSlots.filter((slot) => slot.status === 'AVAILABLE')
                      .map((slot) => (
                        <TouchableOpacity
                          key={slot.id}
                          style={[
                            styles.timeSlotItem,
                            selectedTimeSlot?.id === slot.id && styles.timeSlotItemSelected,
                          ]}
                          onPress={() => handleTimeSlotSelect(slot)}
                        >
                          <Text
                            style={[
                              styles.timeSlotText,
                              selectedTimeSlot?.id === slot.id && styles.timeSlotTextSelected,
                            ]}
                          >
                            {formatTime(slot.startTime)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <Button
              title="Confirm Booking"
              onPress={handleConfirm}
              variant="primary"
              size="large"
              style={styles.confirmButton}
              disabled={!selectedDate || !selectedTimeSlot}
            />
          </View>
        </View>
      </Modal>

      <BookingConfirmationModal
        isVisible={showConfirmation}
        onClose={handleConfirmationClose}
        onConfirm={handleConfirmationConfirm}
        selectedDate={selectedDate || ''}
        user={user}
        serviceId={serviceId}
        selectedTimeSlot={selectedTimeSlot || {} as TimeSlot}
        serviceName={serviceName}
        servicePrice={servicePrice}
        serviceDuration={serviceDuration}
        serviceLocation={serviceLocation}
        serviceIsOnline={serviceIsOnline}
      />
    </>
  );
}; 