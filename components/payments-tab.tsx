"use client"
import { View, Text, StyleSheet, FlatList, Pressable, Image, ActivityIndicator } from "react-native"
import { useTheme } from "@/theme/theme-provider"
import { CreditCard, Plus } from "lucide-react-native"
import { Button } from "@/components/ui/buttons/Buttons"
import { useEffect, useState, useRef } from "react"
import { getPaymentHistory } from "@/api/payment"

interface PaymentMethod {
  id: string;
  type: 'razorpay';
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  paymentId: string;
}

const PaymentsTab: React.FC<{ user?: any }> = ({ user }) => {
  const { colors, spacing, typography, borderRadius } = useTheme()
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Cache: store last userId and data
  const paymentCache = useRef<{ userId: string | undefined, data: any[] }>({ userId: undefined, data: [] });

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      setLoading(true);
      setError(null);
      // If cache matches, use it
      if (paymentCache.current.userId === user?.id && paymentCache.current.data.length > 0) {
        setPaymentHistory(paymentCache.current.data);
        setLoading(false);
        return;
      }
      try {
        const data = await getPaymentHistory({ userId: user.id });
        setPaymentHistory(data);
        paymentCache.current = { userId: user.id, data };
      } catch (err: any) {
        setError('Failed to load payment history. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentHistory();
  }, [user]); 

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 30,
      paddingBottom: 100,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: typography.variants.subHeading.fontSize,
      fontWeight: "bold",
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    cardContainer: {
      backgroundColor: colors.primary.main,
      borderRadius: borderRadius.primary,
      padding: spacing.lg,
      marginBottom: spacing.md,
      height: 180,
      justifyContent: "space-between",
    },
    defaultBadge: {
      position: "absolute",
      top: spacing.sm,
      right: spacing.sm,
      backgroundColor: colors.primary.accent,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.input,
    },
    defaultBadgeText: {
      color: colors.primary.main,
      fontSize: typography.variants.caption.fontSize,
      fontWeight: "bold",
    },
    cardTypeContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cardLogo: {
      width: 60,
      height: 40,
      resizeMode: "contain",
    },
    cardNumberContainer: {
      marginVertical: spacing.lg,
    },
    cardNumberText: {
      color: colors.neutral.white,
      fontSize: typography.variants.paragraph.fontSize,
      letterSpacing: 2,
    },
    cardDetailsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    cardDetailLabel: {
      color: colors.neutral.lightest,
      fontSize: typography.variants.caption.fontSize,
      marginBottom: spacing.xs,
    },
    cardDetailValue: {
      color: colors.neutral.white,
      fontSize: typography.variants.paragraph.fontSize,
    },
    historyItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.background.paper,
      borderRadius: borderRadius.primary,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    historyLeft: {
      flex: 1,
    },
    historyDate: {
      color: colors.text.secondary,
      fontSize: typography.variants.caption.fontSize,
      marginBottom: spacing.xs,
    },
    historyDescription: {
      color: colors.text.primary,
      fontSize: typography.variants.paragraph.fontSize,
      fontWeight: "500",
    },
    historyAmount: {
      color: colors.primary.main,
      fontSize: typography.variants.paragraph.fontSize,
      fontWeight: "bold",
    },
    historyStatus: {
      fontSize: typography.variants.caption.fontSize,
      color: colors.feedback.success.main,
      marginTop: spacing.xs,
    },
    paymentId: {
      color: colors.text.secondary,
      fontSize: typography.variants.caption.fontSize,
      marginTop: spacing.xs,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },
    emptyStateText: {
      color: colors.text.secondary,
      fontSize: typography.variants.paragraph.fontSize,
      textAlign: "center",
      marginBottom: spacing.lg,
    },
  })

  const renderCard = (item: any) => {
    return (
      <View style={styles.cardContainer}>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        )}
        <View style={styles.cardTypeContainer}>
          <CreditCard size={24} color={colors.neutral.white} />
          <Text style={{ color: colors.neutral.white, fontWeight: 'bold', fontSize: 16 }}>{item.network}</Text>
        </View>
        <View style={styles.cardNumberContainer}>
          <Text style={styles.cardNumberText}>**** **** **** {item.last4}</Text>
        </View>
        <View style={styles.cardDetailsContainer}>
          <View>
            <Text style={styles.cardDetailLabel}>CARD HOLDER</Text>
            <Text style={styles.cardDetailValue}>{item.name}</Text>
          </View>
          <View>
            <Text style={styles.cardDetailLabel}>EXPIRES</Text>
            <Text style={styles.cardDetailValue}>N/A</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHistoryItem = (item: any) => {
    // Defensive: parse fields from API response
    const date = item.date ? new Date(item.date) : (item.created_at ? new Date(item.created_at * 1000) : null);
    const notes = item.notes || {};
    return (
      <View style={styles.historyItem}>
        <View style={styles.historyLeft}>
          <Text style={styles.historyDate}>{date ? date.toLocaleDateString() : ''}</Text>
          <Text style={styles.historyDescription}>{notes.title || item.description || 'Payment'}</Text>
          <Text style={styles.historyStatus}>{item.status === 'captured' ? 'Completed' : item.status}</Text>
          <Text style={styles.paymentId}>Payment ID: {item.id || item.paymentId}</Text>
          <View style={{ marginTop: 4 }}>
            {notes.access && (
              <Text style={{ color: colors.text.secondary, fontSize: typography.variants.caption.fontSize }}>
                Access: <Text style={{ color: colors.text.primary }}>{notes.access}</Text>
              </Text>
            )}
            {notes.category && (
              <Text style={{ color: colors.text.secondary, fontSize: typography.variants.caption.fontSize }}>
                Category: <Text style={{ color: colors.text.primary }}>{notes.category}</Text>
              </Text>
            )}
            {notes.price && (
              <Text style={{ color: colors.text.secondary, fontSize: typography.variants.caption.fontSize }}>
                Price: <Text style={{ color: colors.text.primary }}>₹{notes.price}</Text>
              </Text>
            )}
            {notes.serviceId && (
              <Text style={{ color: colors.text.secondary, fontSize: typography.variants.caption.fontSize }}>
                Service ID: <Text style={{ color: colors.text.primary }}>{notes.serviceId}</Text>
              </Text>
            )}
            {notes.userId && (
              <Text style={{ color: colors.text.secondary, fontSize: typography.variants.caption.fontSize }}>
                User ID: <Text style={{ color: colors.text.primary }}>{notes.userId}</Text>
              </Text>
            )}
          </View>
        </View>
        <Text style={styles.historyAmount}>₹{(item.amount ? (item.amount / 100) : 0).toFixed(2)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Optionally render payment methods if available from API */}
      {/*
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        {paymentHistory.length > 0 && paymentHistory[0].cardLast4 && (
          <View key={paymentHistory[0].paymentId}>{renderCard({
            id: paymentHistory[0].paymentId,
            type: paymentHistory[0].cardNetwork?.toLowerCase() || 'card',
            last4: paymentHistory[0].cardLast4,
            expMonth: null,
            expYear: null,
            isDefault: true,
            name: paymentHistory[0].cardHolder || 'N/A',
            network: paymentHistory[0].cardNetwork || 'Card',
          })}</View>
        )}
      </View>
      */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment History</Text>
        {loading ? (
          <View style={{ alignItems: 'center', padding: spacing.xl }}>
            <ActivityIndicator size="large" color={colors.primary.main} />
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.feedback.error.main }]}>{error}</Text>
            <Button variant="primary" size="medium" title="Retry" onPress={() => {
              setLoading(true);
              setError(null);
              (async () => {
                // Always refetch and update cache on retry
                try {
                  const data = await getPaymentHistory({ userId: user.id });
                  setPaymentHistory(data);
                  paymentCache.current = { userId: user.id, data };
                } catch (err: any) {
                  setError('Failed to load payment history. Please try again.');
                } finally {
                  setLoading(false);
                }
              })();
            }} />
          </View>
        ) : paymentHistory.length > 0 ? (
          [...paymentHistory]
            .sort((a, b) => {
              const dateA = a.created_at ? new Date(a.created_at * 1000) : (a.date ? new Date(a.date) : new Date(0));
              const dateB = b.created_at ? new Date(b.created_at * 1000) : (b.date ? new Date(b.date) : new Date(0));
              return dateB.getTime() - dateA.getTime();
            })
            .map((item: any) => <View key={item.id || item.paymentId}>{renderHistoryItem(item)}</View>)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No payment history available</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default PaymentsTab
