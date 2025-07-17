import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, TextInput, Modal, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme/theme-provider';
import { ArrowLeft, Shield, User, Mail, AlertTriangle, Info, CreditCard, X } from 'lucide-react-native';
import { typography } from '@/theme/typography';
import { createMembershipOrder, verifyMembershipOrder, subscribeToMembership, isAlreadySubscribed } from '@/api/membership';
import PopupNotification from '@/components/Notification';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Constants from 'expo-constants';
import { Button } from '@/components/ui/buttons/Buttons';
import { useMemberships } from '@/app/hooks/useMemberships';

const { width } = Dimensions.get("window");

interface MembershipPlan {
    id: string;
    name: string;
    durationYears: number;
    maxMembers: number;
    renewalPeriodYears: number;
    discountClubActivities: number;
    discountDining: number;
    discountAccommodations: number;
    discountSpaActivities: number;
    discountMedicalWellness: number;
    referenceBenefits: number;
    guestDiscount: number;
    includesYogaGuidance: boolean;
    includesDietChartFor: number;
    includesDoctorConsultation: boolean;
    panchkarmaWorth: number;
    cost: number;
    createdAt: string;
}

export default function MembershipPurchaseScreen() {
    const { colors, spacing, borderRadius } = useTheme();
    const router = useRouter();
    const { id: planId } = useLocalSearchParams();
    const { user } = useSelector((state: RootState) => state.authReducer);
    const { refetch } = useMemberships();
    const [membershipPlan, setMembershipPlan] = useState<MembershipPlan | null>(null);
    const [memberEmails, setMemberEmails] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPaymentWebView, setShowPaymentWebView] = useState(false);
    const [razorpayHtml, setRazorpayHtml] = useState('');
    const [notification, setNotification] = useState({
        type: 'success' as 'success' | 'error' | 'info' | 'warning',
        message: '',
        visible: false
    });

    const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
        setNotification({ type, message, visible: true });
    };

    const hideNotification = () => {
        setNotification({ ...notification, visible: false });
    };

    useEffect(() => {
        // Get plan data from route params
        const planData = JSON.parse(planId as string);
        setMembershipPlan(planData);

        // Set number of input fields based on plan type
        const inputCount = planData.name.toLowerCase() === 'platinum' ? 6 : 4;
        setMemberEmails(new Array(inputCount).fill(''));
    }, [planId]);



    const getPlanColor = (planName: string) => {
        switch (planName?.toLowerCase()) {
            case 'silver':
                return colors.primary.main;
            case 'gold':
                return colors.feedback.warning.main;
            case 'platinum':
                return colors.primary.main;
            default:
                return colors.secondary.main;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handleEmailChange = (index: number, email: string) => {
        const newEmails = [...memberEmails];
        newEmails[index] = email;
        setMemberEmails(newEmails);
    };

    const handleWebViewMessage = async (event: any) => {
        const message = JSON.parse(event.nativeEvent.data);

        if (message.type === 'payment_success') {
            setShowPaymentWebView(false);
            setRazorpayHtml('');

            try {
                // Verify payment
                await verifyMembershipOrder({
                    orderId: message.orderId,
                    paymentId: message.paymentId,
                    signature: message.signature,
                    userId: user?.id,
                    membershipPlanId: membershipPlan?.id,
                    amount: membershipPlan?.cost,
                    currency: "INR",
                    status: "PAID",
                    email: user?.phone_or_email
                });

                // Subscribe to membership
                const validEmails = memberEmails.filter(email => email.trim() !== '');
                const membershipData = {
                    planId: membershipPlan?.id,
                    memberEmails: validEmails,
                    paymentId: message.paymentId
                };

                await subscribeToMembership(membershipData);

                showNotification('success', 'Payment and membership subscription successful!');

                // Refetch the membership data before navigating back
                await refetch();

                // Navigate back after success
                setTimeout(() => {
                    router.back();
                }, 1500);

            } catch (error: any) {
                console.error('Payment verification failed:', error);
                showNotification('error', 'Payment verification failed. If amount is deducted, it will be refunded within 24 hours.');
            } finally {
                setIsProcessing(false);
            }
        } else if (message.type === 'payment_error') {
            setShowPaymentWebView(false);
            setRazorpayHtml('');
            setIsProcessing(false);
            showNotification('error', 'Payment was cancelled or failed');
        }
    };

    const handleProceedToPurchase = async () => {
        try {
            if (!membershipPlan || !user) {
                showNotification('error', 'Missing required information');
                return;
            }

            setIsProcessing(true);

            // Check if already subscribed
            const subscriptionCheck = await isAlreadySubscribed({
                userId: user.id,
                membershipPlanId: membershipPlan.id
            });

            if (subscriptionCheck.isAlreadySubscribed) {
                showNotification('error', 'You are already subscribed to this membership plan');
                setIsProcessing(false);
                return;
            }

            // Create order
            const { order: orderData } = await createMembershipOrder({
                userId: user.id,
                membershipPlanId: membershipPlan.id,
            });

            // Prepare Razorpay options
            const options = {
                key: Constants.expoConfig?.extra?.EXPO_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount, // Use backend amount instead of hardcoded
                currency: "INR",
                name: "Palash Wellness",
                description: `Payment for ${membershipPlan.name} Membership`,
                order_id: orderData.id,
                prefill: {
                    name: user.name || '',
                    email: user.phone_or_email || '',
                    contact: user.phone_or_email || '',
                },
                theme: {
                    color: "#012b2b"
                }
            };

            // Create HTML string for Razorpay checkout
            const html = `
                <html>
                    <head>
                        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    </head>
                    <body>
                        <script src='https://checkout.razorpay.com/v1/checkout.js'></script>
                        <script>
                            var options = ${JSON.stringify(options)};
                            options.handler = function (response){
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'payment_success',
                                    orderId: options.order_id,
                                    paymentId: response.razorpay_payment_id,
                                    signature: response.razorpay_signature
                                }));
                            };
                            options.modal = {
                                ondismiss: function(){
                                    window.ReactNativeWebView.postMessage(JSON.stringify({
                                        type: 'payment_error'
                                    }));
                                }
                            };
                            var rzp = new Razorpay(options);
                            rzp.open();
                        </script>
                    </body>
                </html>
            `;

            setRazorpayHtml(html);
            setShowPaymentWebView(true);

        } catch (error: any) {
            console.error('Error creating order:', error);
            showNotification('error', 'Failed to create payment order. Please try again.');
            setIsProcessing(false);
        }
    };

    const planColor = membershipPlan ? getPlanColor(membershipPlan.name) : colors.primary.main;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background.default,
        },
        header: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing['6xl'],
            paddingBottom: spacing.lg,
            backgroundColor: planColor,
            flexDirection: 'row',
            alignItems: 'center',
        },
        backButton: {
            marginRight: spacing.md,
            padding: spacing.sm,
        },
        headerContent: {
            flex: 1,
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.neutral.white,
            marginBottom: spacing.xs,
        },
        subtitle: {
            fontSize: 14,
            color: colors.neutral.white,
        },
        scrollContent: {
            padding: spacing.lg,
            paddingBottom: 100,
        },
        planDetailsCard: {
            backgroundColor: colors.neutral.lightest,
            borderRadius: borderRadius.primary,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border.main,
        },
        planHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.lg,
        },
        planIcon: {
            marginRight: spacing.sm,
        },
        planInfo: {
            flex: 1,
        },
        planName: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text.primary,
        },
        planPrice: {
            fontSize: 24,
            fontWeight: 'bold',
            color: planColor,
            marginTop: spacing.xs,
        },
        detailsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: spacing.lg,
        },
        detailItem: {
            width: '50%',
            marginBottom: spacing.sm,
        },
        detailLabel: {
            fontSize: 12,
            color: colors.text.secondary,
            marginBottom: spacing.xs,
        },
        detailValue: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text.primary,
        },
        costSummary: {
            padding: spacing.md,
            backgroundColor: colors.neutral.offWhite,
            borderRadius: borderRadius.input,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        costLabel: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.text.primary,
        },
        costValue: {
            fontSize: 20,
            fontWeight: 'bold',
            color: planColor,
        },
        membersSection: {
            backgroundColor: colors.neutral.lightest,
            borderRadius: borderRadius.primary,
            padding: spacing.lg,
            marginBottom: spacing.lg,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.text.primary,
            marginBottom: spacing.sm,
        },
        sectionSubtitle: {
            fontSize: 12,
            color: colors.text.secondary,
            marginBottom: spacing.lg,
        },
        inputContainer: {
            marginBottom: spacing.md,
        },
        inputLabel: {
            fontSize: 14,
            fontWeight: '500',
            color: colors.text.primary,
            marginBottom: spacing.sm,
        },
        textInput: {
            borderWidth: 1,
            borderColor: colors.border.main,
            borderRadius: borderRadius.input,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            fontSize: 14,
            color: colors.text.primary,
            backgroundColor: colors.neutral.white,
        },
        inputNote: {
            fontSize: 12,
            color: colors.text.secondary,
            marginTop: spacing.sm,
        },
        noticeCard: {
            borderRadius: borderRadius.primary,
            padding: spacing.md,
            marginBottom: spacing.md,
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        warningCard: {
            backgroundColor: '#FEF3C7',
            borderColor: '#F59E0B',
            borderWidth: 1,
        },
        infoCard: {
            backgroundColor: '#DBEAFE',
            borderColor: '#3B82F6',
            borderWidth: 1,
        },
        noticeIcon: {
            marginRight: spacing.sm,
            marginTop: 2,
        },
        noticeContent: {
            flex: 1,
        },
        noticeTitle: {
            fontSize: 14,
            fontWeight: 'bold',
            marginBottom: spacing.xs,
        },
        warningTitle: {
            color: '#92400E',
        },
        infoTitle: {
            color: '#1E40AF',
        },
        noticeText: {
            fontSize: 12,
            lineHeight: 16,
        },
        warningText: {
            color: '#B45309',
        },
        infoText: {
            color: '#1E3A8A',
        },
        actionContainer: {
            flexDirection: 'row',
            gap: spacing.md,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.lg,
            borderTopWidth: 1,
            borderTopColor: colors.border.main,
            backgroundColor: colors.neutral.white,
            paddingBottom: 130,
        },
        cancelButton: {
            flex: 1,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderRadius: borderRadius.primary,
            borderWidth: 1,
            borderColor: colors.border.main,
            alignItems: 'center',
        },
        cancelButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text.secondary,
        },
        purchaseButton: {
            flex: 1,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderRadius: borderRadius.primary,
            backgroundColor: planColor,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
        },
        purchaseButtonDisabled: {
            backgroundColor: colors.neutral.medium,
        },
        purchaseButtonText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.neutral.white,
            marginLeft: spacing.sm,
        },
        // Payment Modal Styles
        paymentModalContainer: {
            flex: 1,
            backgroundColor: colors.background.default,
        },
        paymentModalHeader: {
            backgroundColor: colors.primary.main,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing['6xl'],
            paddingBottom: spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        paymentModalTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.neutral.white,
            flex: 1,
        },
        paymentModalCloseButton: {
            padding: spacing.sm,
        },
        paymentWebView: {
            flex: 1,
        },
    });

    if (!membershipPlan) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }



    return (
        <View style={styles.container}>
            <PopupNotification
                visible={notification.visible}
                message={notification.message}
                type={notification.type}
                onClose={hideNotification}
            />

            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <ArrowLeft size={24} color={colors.neutral.white} />
                </Pressable>
                <View style={styles.headerContent}>
                    <Text style={styles.title}>{membershipPlan.name.toUpperCase()} MEMBERSHIP</Text>
                    <Text style={styles.subtitle}>Complete your membership purchase</Text>
                </View>
            </View>
        
            <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Important Notices */}
            <View style={[styles.noticeCard, styles.warningCard]}>
                <AlertTriangle size={16} color="#F59E0B" style={styles.noticeIcon} />
                <View style={styles.noticeContent}>
                    <Text style={[styles.noticeTitle, styles.warningTitle]}>
                        Cancellation & Refund Policy
                    </Text>
                    <Text style={[styles.noticeText, styles.warningText]}>
                        To cancel your membership or request a refund, please contact our admin team directly.
                        Cancellation requests are processed on a case-by-case basis.
                    </Text>
                </View>
            </View>

            <View style={[styles.noticeCard, styles.infoCard]}>
                <Info size={16} color="#3B82F6" style={styles.noticeIcon} />
                <View style={styles.noticeContent}>
                    <Text style={[styles.noticeTitle, styles.infoTitle]}>
                        Important: Member Accounts Required
                    </Text>
                    <Text style={[styles.noticeText, styles.infoText]}>
                        All members you add to your membership must have existing accounts on our platform.
                        Please ensure all member emails are associated with registered accounts before proceeding.
                    </Text>
                </View>
            </View>
                {/* Plan Details */}
                <View style={styles.planDetailsCard}>
                    <View style={styles.planHeader}>
                        <Shield size={24} color={planColor} style={styles.planIcon} />
                        <View style={styles.planInfo}>
                            <Text style={styles.planName}>{membershipPlan.name} Plan</Text>
                            <Text style={styles.planPrice}>{formatCurrency(membershipPlan.cost)}</Text>
                        </View>
                    </View>

                    <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Duration</Text>
                            <Text style={styles.detailValue}>{membershipPlan.durationYears} Years</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Max Members</Text>
                            <Text style={styles.detailValue}>{membershipPlan.maxMembers}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Renewal Period</Text>
                            <Text style={styles.detailValue}>{membershipPlan.renewalPeriodYears} Years</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Club Activities</Text>
                            <Text style={styles.detailValue}>{membershipPlan.discountClubActivities}% Discount</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Dining</Text>
                            <Text style={styles.detailValue}>{membershipPlan.discountDining}% Discount</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Spa Activities</Text>
                            <Text style={styles.detailValue}>{membershipPlan.discountSpaActivities}% Discount</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Medical Wellness</Text>
                            <Text style={styles.detailValue}>{membershipPlan.discountMedicalWellness}% Discount</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Reference Benefits</Text>
                            <Text style={styles.detailValue}>{membershipPlan.referenceBenefits}%</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Guest Discount</Text>
                            <Text style={styles.detailValue}>{membershipPlan.guestDiscount > 0 ? `${membershipPlan.guestDiscount}%` : 'No'}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Yoga Guidance</Text>
                            <Text style={styles.detailValue}>{membershipPlan.includesYogaGuidance ? 'Yes' : 'No'}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Diet Chart</Text>
                            <Text style={styles.detailValue}>{membershipPlan.includesDietChartFor > 0 ? `For ${membershipPlan.includesDietChartFor} people` : 'No'}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Doctor Consultation</Text>
                            <Text style={styles.detailValue}>{membershipPlan.includesDoctorConsultation ? 'Yes' : 'No'}</Text>
                        </View>
                        {membershipPlan.panchkarmaWorth > 0 && (
                            <View style={[styles.detailItem, { width: '100%' }]}>
                                <Text style={styles.detailLabel}>Free Panchkarma</Text>
                                <Text style={styles.detailValue}>Worth {formatCurrency(membershipPlan.panchkarmaWorth)}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.costSummary}>
                        <Text style={styles.costLabel}>Total Cost:</Text>
                        <Text style={styles.costValue}>{formatCurrency(membershipPlan.cost)}</Text>
                    </View>
                </View>

                {/* Add Members Section */}
                <View style={styles.membersSection}>
                    <Text style={styles.sectionTitle}>Add Members (Optional)</Text>
                    <Text style={styles.sectionSubtitle}>
                        You can add up to {memberEmails.length} additional members
                    </Text>

                    {memberEmails.map((email, index) => (
                        <View key={index} style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Member {index + 1} Email (Optional)</Text>
                            <TextInput
                                style={styles.textInput}
                                value={email}
                                onChangeText={(text) => handleEmailChange(index, text.trim())}
                                placeholder="Enter email address"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    ))}

                    <Text style={styles.inputNote}>
                        Note: Members must have existing accounts on our platform.
                    </Text>
                </View>


            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                <Pressable
                    style={[styles.purchaseButton, isProcessing && styles.purchaseButtonDisabled]}
                    onPress={handleProceedToPurchase}
                    disabled={isProcessing}
                >
                    <CreditCard size={18} color={colors.neutral.white} />
                    <Text style={styles.purchaseButtonText}>
                        {isProcessing ? 'Processing...' : 'Proceed to Purchase'}
                    </Text>
                </Pressable>
            </View>

            {/* Razorpay Payment Modal */}
            <Modal
                visible={showPaymentWebView}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={() => {
                    setShowPaymentWebView(false);
                    setRazorpayHtml('');
                    setIsProcessing(false);
                }}
            >
                <View style={styles.paymentModalContainer}>
                    <StatusBar barStyle="light-content" backgroundColor={colors.primary.main} />

                    {/* Payment Modal Header */}
                    <View style={styles.paymentModalHeader}>
                        <Text style={styles.paymentModalTitle}>Complete Payment</Text>
                        <Pressable
                            style={styles.paymentModalCloseButton}
                            onPress={() => {
                                setShowPaymentWebView(false);
                                setRazorpayHtml('');
                                setIsProcessing(false);
                                showNotification('info', 'Payment cancelled');
                            }}
                        >
                            <X size={24} color={colors.neutral.white} />
                        </Pressable>
                    </View>

                    {/* WebView */}
                    <WebView
                        source={{ html: razorpayHtml }}
                        onMessage={handleWebViewMessage}
                        style={styles.paymentWebView}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        startInLoadingState={true}
                    />
                </View>
            </Modal>
        </View>
    );
} 