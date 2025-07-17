import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Modal, Alert } from 'react-native';
import { useTheme } from '@/theme/theme-provider';
import { Users, Crown, Star, CheckCircle, Clock, Shield, Gift, Calendar, User, X, AlertTriangle } from 'lucide-react-native';
import { typography } from '@/theme/typography';
import { cancelUserMembership } from '@/api/membership';
import PopupNotification from '@/components/Notification';
import { Badge } from '@/components/Badge';
import { useRouter, useFocusEffect } from 'expo-router';
import { useMemberships } from '@/app/hooks/useMemberships';

const { width } = Dimensions.get("window");

export default function MembershipsScreen() {
    const { colors, spacing, borderRadius } = useTheme();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'active' | 'plans'>('active');
    const { 
        membershipPlans, 
        userMemberships, 
        loading, 
        membershipsLoading, 
        error,
        refetch,
        setUserMemberships 
    } = useMemberships();
    const [notification, setNotification] = useState({
        type: 'success' as 'success' | 'error' | 'info' | 'warning',
        message: '',
        visible: false
    });
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [membershipToCancel, setMembershipToCancel] = useState<any>(null);
    const [cancelling, setCancelling] = useState(false);

    const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
        setNotification({ type, message, visible: true });
    };

    const hideNotification = () => {
        setNotification({ ...notification, visible: false });
    };

    const handleCancelMembership = (membership: any) => {
        setMembershipToCancel(membership);
        setCancelModalVisible(true);
    };

    const confirmCancelMembership = async () => {
        if (!membershipToCancel) return;

        try {
            setCancelling(true);
            await cancelUserMembership(membershipToCancel.id);
            
            // Update the memberships list by removing the cancelled membership
            setUserMemberships((prev: any) => ({
                ...prev,
                activeMemberships: prev.activeMemberships.filter((m: any) => m.id !== membershipToCancel.id),
                inactiveMemberships: prev.inactiveMemberships.filter((m: any) => m.id !== membershipToCancel.id)
            }));

            showNotification('success', 'Membership cancelled successfully');
            setCancelModalVisible(false);
            setMembershipToCancel(null);
        } catch (error) {
            console.error('Error cancelling membership:', error);
            showNotification('error', 'Failed to cancel membership. Please try again.');
        } finally {
            setCancelling(false);
        }
    };

    const closeCancelModal = () => {
        setCancelModalVisible(false);
        setMembershipToCancel(null);
    };

    // Show error notification if there's an error from the hook
    React.useEffect(() => {
        if (error) {
            showNotification('error', error);
        }
    }, [error]);

    // Refetch data when screen comes into focus (e.g., after navigating back from purchase)
    useFocusEffect(
        React.useCallback(() => {
            refetch();
        }, [refetch])
    );

    const getPlanColor = (planName: string) => {
        switch (planName.toLowerCase()) {
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

    const isPlanPopular = (planName: string) => {
        return planName.toLowerCase() === 'gold';
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const generateFeatures = (plan: any) => {
        const features = [];
        
        // Duration and membership details
        features.push(`${plan.durationYears} year membership duration`);
        features.push(`Up to ${plan.maxMembers} family members`);
        features.push(`${plan.renewalPeriodYears} year renewal period`);
        
        // Discount benefits
        if (plan.discountClubActivities > 0) {
            features.push(`${plan.discountClubActivities}% discount on club activities`);
        }
        if (plan.discountDining > 0) {
            features.push(`${plan.discountDining}% discount on dining`);
        }
        if (plan.discountAccommodations > 0) {
            features.push(`${plan.discountAccommodations}% discount on accommodations`);
        }
        if (plan.discountSpaActivities > 0) {
            features.push(`${plan.discountSpaActivities}% discount on spa activities`);
        }
        if (plan.discountMedicalWellness > 0) {
            features.push(`${plan.discountMedicalWellness}% discount on medical wellness`);
        }
        if (plan.guestDiscount > 0) {
            features.push(`${plan.guestDiscount}% guest discount`);
        }
        
        // Included services
        if (plan.includesYogaGuidance) {
            features.push('Yoga guidance included');
        }
        if (plan.includesDoctorConsultation) {
            features.push('Doctor consultation included');
        }
        if (plan.includesDietChartFor > 0) {
            features.push(`Diet chart for ${plan.includesDietChartFor} members`);
        }
        if (plan.panchkarmaWorth > 0) {
            features.push(`Panchkarma worth ${formatCurrency(plan.panchkarmaWorth)}`);
        }
        if (plan.referenceBenefits > 0) {
            features.push(`${plan.referenceBenefits}% reference benefits`);
        }

        return features;
    };

    const renderUserMembershipCard = (membership: any) => {
        const planColor = getPlanColor(membership.plan.name);
        const isActive = membership.isActive;

        return (
            <View key={membership.id} style={[
                styles.userMembershipCard, 
                isActive ? styles.activeMembershipCard : styles.inactiveMembershipCard
            ]}>
                <View style={styles.membershipHeader}>
                    <View style={styles.planInfo}>
                        <View style={styles.planNameContainer}>
                            <Shield size={20} color={planColor} />
                            <Text style={styles.userPlanName}>{membership.plan.name} Plan</Text>
                        </View>
                        <Badge 
                            text={isActive ? 'Active' : 'Inactive'} 
                            variant={isActive ? 'success' : 'error'} 
                            size="small" 
                        />
                    </View>
                    {membership.isPrimary && (
                        <View style={styles.primaryBadge}>
                            <Star size={12} color={colors.neutral.white} />
                            <Text style={styles.primaryText}>Primary</Text>
                        </View>
                    )}
                </View>

                <View style={styles.membershipDetails}>
                    <View style={styles.detailRow}>
                        <Calendar size={16} color={colors.text.secondary} />
                        <Text style={styles.detailLabel}>Start Date:</Text>
                        <Text style={styles.detailValue}>{formatDate(membership.startDate)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Calendar size={16} color={colors.text.secondary} />
                        <Text style={styles.detailLabel}>End Date:</Text>
                        <Text style={styles.detailValue}>{formatDate(membership.endDate)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <User size={16} color={colors.text.secondary} />
                        <Text style={styles.detailLabel}>Max Members:</Text>
                        <Text style={styles.detailValue}>{membership.plan.maxMembers}</Text>
                    </View>
                </View>

                <View style={styles.membershipBenefits}>
                    <Text style={styles.benefitsTitle}>Key Benefits:</Text>
                    <View style={styles.benefitsList}>
                        {membership.plan.discountClubActivities > 0 && (
                            <Text style={styles.benefitItem}>• {membership.plan.discountClubActivities}% discount on activities</Text>
                        )}
                        {membership.plan.discountDining > 0 && (
                            <Text style={styles.benefitItem}>• {membership.plan.discountDining}% discount on dining</Text>
                        )}
                        {membership.plan.includesYogaGuidance && (
                            <Text style={styles.benefitItem}>• Yoga guidance included</Text>
                        )}
                        {membership.plan.includesDoctorConsultation && (
                            <Text style={styles.benefitItem}>• Doctor consultation included</Text>
                        )}
                    </View>
                </View>

                <View style={styles.membershipFooter}>
                    <View style={styles.membershipCostInfo}>
                        <Text style={styles.membershipCost}>
                            Total Cost: {formatCurrency(membership.plan.cost)}
                        </Text>
                        <Text style={styles.membershipId}>
                            ID: {membership.id.slice(-8).toUpperCase()}
                        </Text>
                    </View>
                    {membership.isPrimary && membership.isActive && (
                        <Pressable 
                            style={styles.cancelMembershipButton}
                            onPress={() => handleCancelMembership(membership)}
                        >
                            <Text style={styles.cancelMembershipText}>Cancel</Text>
                        </Pressable>
                    )}
                </View>
            </View>
        );
    };

    const renderMembershipCard = (plan: any) => {
        const isPopular = isPlanPopular(plan.name);
        const planColor = getPlanColor(plan.name);
        const features = generateFeatures(plan);

        return (
            <View key={plan.id} style={[styles.membershipCard, isPopular && styles.popularCard]}>
                {isPopular && (
                    <View style={styles.popularBadge}>
                        <Star size={12} color={colors.neutral.white} />
                        <Text style={styles.popularText}>Most Popular</Text>
                    </View>
                )}
                
                <View style={styles.cardHeader}>
                    <View style={styles.planNameContainer}>
                        <Shield size={20} color={planColor} />
                        <Text style={styles.planName}>{plan.name}</Text>
                    </View>
                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>{formatCurrency(plan.cost)}</Text>
                        <Text style={styles.duration}>one-time payment</Text>
                    </View>
                </View>

                <View style={styles.featuresContainer}>
                    {features.slice(0, 6).map((feature, index) => (
                        <View key={index} style={styles.featureRow}>
                            <CheckCircle size={16} color={colors.feedback.success.main} />
                            <Text style={styles.featureText}>{feature}</Text>
                        </View>
                    ))}
                    {features.length > 6 && (
                        <Text style={styles.moreFeatures}>
                            +{features.length - 6} more benefits
                        </Text>
                    )}
                </View>

                <Pressable 
                    style={[styles.subscribeButton, { backgroundColor: planColor }]}
                    onPress={() => router.push({
                        pathname: '/(main)/membership/[id]',
                        params: { id: JSON.stringify(plan) }
                    })}
                >
                    <Text style={styles.subscribeText}>Choose {plan.name} Plan</Text>
                </Pressable>
            </View>
        );
    };

    const renderActiveMemberships = () => {
        if (membershipsLoading) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyDescription}>Loading your memberships...</Text>
                </View>
            );
        }

        const totalMemberships = userMemberships.activeMemberships.length + userMemberships.inactiveMemberships.length;

        if (totalMemberships === 0) {
            return (
                <View style={styles.emptyState}>
                    <Users size={64} color={colors.text.disabled} />
                    <Text style={styles.emptyTitle}>No Memberships Found</Text>
                    <Text style={styles.emptyDescription}>
                        You don't have any memberships yet. Choose a plan to start your wellness journey!
                    </Text>
                </View>
            );
        }

        return (
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.membershipsHeader}>
                    <Text style={styles.membershipsTitle}>Your Memberships</Text>
                    <Text style={styles.membershipsSubtitle}>
                        {userMemberships.activeMemberships.length} active • {userMemberships.inactiveMemberships.length} inactive
                    </Text>
                </View>

                {/* Active Memberships */}
                {userMemberships.activeMemberships.map(membership => renderUserMembershipCard(membership))}
                
                {/* Inactive Memberships */}
                {userMemberships.inactiveMemberships.map(membership => renderUserMembershipCard(membership))}
            </ScrollView>
        );
    };

    const renderMembershipPlans = () => {
        if (loading) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyDescription}>Loading membership plans...</Text>
                </View>
            );
        }

        if (membershipPlans.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Gift size={64} color={colors.text.disabled} />
                    <Text style={styles.emptyTitle}>No Plans Available</Text>
                    <Text style={styles.emptyDescription}>
                        Membership plans are currently being updated. Please check back later.
                    </Text>
                </View>
            );
        }

        return (
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.plansHeader}>
                    <Text style={styles.plansTitle}>Choose Your Wellness Plan</Text>
                    <Text style={styles.plansSubtitle}>
                        Unlock exclusive benefits and long-term wellness solutions
                    </Text>
                </View>
                
                {membershipPlans.map(plan => renderMembershipCard(plan))}
            </ScrollView>
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background.default,
        },
        header: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing['6xl'],
            paddingBottom: spacing.lg,
            backgroundColor: colors.primary.main,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.neutral.white,
            marginBottom: spacing.xs,
        },
        subtitle: {
            fontSize: 16,
            color: colors.neutral.light,
        },
        tabContainer: {
            flexDirection: 'row',
            backgroundColor: colors.background.paper,
            paddingHorizontal: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.main,
        },
        tab: {
            flex: 1,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.sm,
            alignItems: 'center',
            borderBottomWidth: 3,
            borderBottomColor: 'transparent',
        },
        activeTab: {
            borderBottomColor: colors.secondary.main,
        },
        tabIconContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.xs,
        },
        tabIcon: {
            marginRight: spacing.xs,
        },
        tabText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text.secondary,
            textAlign: 'center',
        },
        activeTabText: {
            color: colors.secondary.main,
        },
        content: {
            flex: 1,
        },
        scrollContent: {
            padding: spacing.lg,
            paddingBottom: 100,
        },
        membershipsHeader: {
            marginBottom: spacing.xl,
            alignItems: 'center',
        },
        membershipsTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text.primary,
            marginBottom: spacing.sm,
            textAlign: 'center',
        },
        membershipsSubtitle: {
            fontSize: 14,
            color: colors.text.secondary,
            textAlign: 'center',
        },
        userMembershipCard: {
            backgroundColor: colors.neutral.lightest,
            borderRadius: borderRadius.primary,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            borderWidth: 2,
            position: 'relative',
        },
        activeMembershipCard: {
            borderColor: colors.feedback.success.main,
            backgroundColor: colors.neutral.lightest,
        },
        inactiveMembershipCard: {
            borderColor: colors.neutral.light,
            backgroundColor: colors.neutral.offWhite,
        },
        membershipHeader: {
            marginBottom: spacing.md,
        },
        planInfo: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.sm,
        },
        userPlanName: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text.primary,
            marginLeft: spacing.sm,
        },
        primaryBadge: {
            position: 'absolute',
            top: 30,
            right: 4,
            backgroundColor: colors.feedback.warning.main,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: borderRadius.full,
            flexDirection: 'row',
            alignItems: 'center',
        },
        primaryText: {
            color: colors.neutral.white,
            fontSize: 10,
            fontWeight: 'bold',
            marginLeft: spacing.xs,
        },
        membershipDetails: {
            marginBottom: spacing.md,
        },
        detailRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.sm,
        },
        detailLabel: {
            fontSize: 14,
            color: colors.text.secondary,
            marginLeft: spacing.sm,
            minWidth: 80,
        },
        detailValue: {
            fontSize: 14,
            color: colors.text.primary,
            fontWeight: '600',
            marginLeft: spacing.sm,
        },
        membershipBenefits: {
            marginBottom: spacing.md,
        },
        benefitsTitle: {
            fontSize: 14,
            fontWeight: 'bold',
            color: colors.text.primary,
            marginBottom: spacing.sm,
        },
        benefitsList: {
            paddingLeft: spacing.sm,
        },
        benefitItem: {
            fontSize: 12,
            color: colors.text.secondary,
            marginBottom: 2,
        },
        membershipFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: spacing.sm,
            borderTopWidth: 1,
            borderTopColor: colors.neutral.light,
        },
        membershipCostInfo: {
            flex: 1,
        },
        membershipCost: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.primary.main,
        },
        membershipId: {
            fontSize: 12,
            color: colors.text.secondary,
        },
        cancelMembershipButton: {
            backgroundColor: colors.feedback.error.main,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.primary,
            marginLeft: spacing.sm,
        },
        cancelMembershipText: {
            color: colors.neutral.white,
            fontSize: 12,
            fontWeight: 'bold',
        },
        plansHeader: {
            marginBottom: spacing.xl,
            alignItems: 'center',
        },
        plansTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text.primary,
            marginBottom: spacing.sm,
            textAlign: 'center',
        },
        plansSubtitle: {
            fontSize: 14,
            color: colors.text.secondary,
            textAlign: 'center',
            maxWidth: width * 0.8,
        },
        membershipCard: {
            backgroundColor: colors.neutral.lightest,
            borderRadius: borderRadius.primary,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border.main,
            position: 'relative',
        },
        popularCard: {
            borderColor: colors.feedback.warning.main,
            borderWidth: 2,
        },
        popularBadge: {
            position: 'absolute',
            top: -10,
            right: spacing.lg,
            backgroundColor: colors.feedback.warning.main,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: borderRadius.full,
            flexDirection: 'row',
            alignItems: 'center',
        },
        popularText: {
            color: colors.neutral.white,
            fontSize: 10,
            fontWeight: 'bold',
            marginLeft: spacing.xs,
        },
        cardHeader: {
            marginBottom: spacing.lg,
        },
        planNameContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.sm,
        },
        planName: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text.primary,
            marginLeft: spacing.sm,
        },
        priceContainer: {
            flexDirection: 'row',
            alignItems: 'baseline',
        },
        price: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.primary.main,
            marginRight: spacing.xs,
        },
        duration: {
            fontSize: 14,
            color: colors.text.secondary,
        },
        featuresContainer: {
            marginBottom: spacing.xl,
        },
        featureRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.sm,
        },
        featureText: {
            fontSize: 14,
            color: colors.text.primary,
            marginLeft: spacing.sm,
            flex: 1,
        },
        moreFeatures: {
            fontSize: 12,
            color: colors.text.secondary,
            fontStyle: 'italic',
            textAlign: 'center',
            marginTop: spacing.sm,
        },
        subscribeButton: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderRadius: borderRadius.primary,
            alignItems: 'center',
        },
        subscribeText: {
            color: colors.neutral.white,
            fontSize: 16,
            fontWeight: 'bold',
        },
        emptyState: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing['6xl'],
        },
        emptyTitle: {
            fontFamily: typography.fontFamily.serif.Hero,
            fontSize: typography.variants.heading.fontSize,
            color: colors.text.primary,
            textAlign: 'center',
            marginBottom: spacing.md,
            marginTop: spacing.xl,
        },
        emptyDescription: {
            fontFamily: typography.fontFamily.sansSerif.manropeMedium,
            fontSize: typography.variants.paragraph.fontSize,
            color: colors.text.secondary,
            textAlign: 'center',
            lineHeight: typography.variants.paragraph.lineHeight,
            maxWidth: width * 0.8,
        },
        // Modal styles
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.lg,
        },
        modalContainer: {
            backgroundColor: colors.neutral.white,
            borderRadius: borderRadius.primary,
            width: '100%',
            maxWidth: 400,
        },
        modalHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.main,
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text.primary,
            flex: 1,
            marginLeft: spacing.sm,
        },
        modalCloseButton: {
            padding: spacing.xs,
        },
        modalContent: {
            padding: spacing.lg,
        },
        modalMessage: {
            fontSize: 16,
            color: colors.text.primary,
            textAlign: 'center',
            marginBottom: spacing.md,
            lineHeight: 22,
        },
        modalPlanName: {
            fontWeight: 'bold',
            color: colors.primary.main,
        },
        modalWarning: {
            fontSize: 14,
            color: colors.text.secondary,
            textAlign: 'center',
            lineHeight: 20,
        },
        modalActions: {
            flexDirection: "column",
            padding: spacing.lg,
            paddingTop: 0,
            gap: spacing.md,
            height: 130,
        },
        modalCancelButton: {
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: spacing.lg,
            borderRadius: borderRadius.primary,
            borderWidth: 1,
            borderColor: colors.border.main,
        },
        modalCancelText: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text.secondary,
        },
        modalConfirmButton: {
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: spacing.lg,
            borderRadius: borderRadius.primary,
            backgroundColor: colors.feedback.error.main,
        },
        modalConfirmButtonDisabled: {
            backgroundColor: colors.neutral.medium,
        },
        modalConfirmText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.neutral.white,
        },
    });

    return (
        <View style={styles.container}>
            <PopupNotification 
                visible={notification.visible}
                message={notification.message}
                type={notification.type}
                onClose={hideNotification}
            />
            
            <View style={styles.header}>
                <Text style={styles.title}>Memberships</Text>
                <Text style={styles.subtitle}>Choose your wellness journey</Text>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                <Pressable
                    style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                    onPress={() => setActiveTab('active')}
                >
                    <View style={styles.tabIconContainer}>
                        <Clock 
                            size={16} 
                            color={activeTab === 'active' ? colors.secondary.main : colors.text.secondary}
                            style={styles.tabIcon} 
                        />
                    </View>
                    <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
                        My Plans
                    </Text>
                </Pressable>

                <Pressable
                    style={[styles.tab, activeTab === 'plans' && styles.activeTab]}
                    onPress={() => setActiveTab('plans')}
                >
                    <View style={styles.tabIconContainer}>
                        <Crown 
                            size={16} 
                            color={activeTab === 'plans' ? colors.secondary.main : colors.text.secondary}
                            style={styles.tabIcon} 
                        />
                    </View>
                    <Text style={[styles.tabText, activeTab === 'plans' && styles.activeTabText]}>
                        All Plans
                    </Text>
                </Pressable>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {activeTab === 'active' ? renderActiveMemberships() : renderMembershipPlans()}
            </View>

            {/* Cancel Membership Confirmation Modal */}
            <Modal
                visible={cancelModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeCancelModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <AlertTriangle size={24} color={colors.feedback.error.main} />
                            <Text style={styles.modalTitle}>Cancel Membership</Text>
                            <Pressable style={styles.modalCloseButton} onPress={closeCancelModal}>
                                <X size={20} color={colors.text.secondary} />
                            </Pressable>
                        </View>

                        <View style={styles.modalContent}>
                            <Text style={styles.modalMessage}>
                                Are you sure you want to cancel your{' '}
                                <Text style={styles.modalPlanName}>
                                    {membershipToCancel?.plan.name} membership
                                </Text>
                                ?
                            </Text>
                            <Text style={styles.modalWarning}>
                                This action cannot be undone. You will lose access to all membership benefits immediately.
                            </Text>
                        </View>

                        <View style={styles.modalActions}>
                            <Pressable 
                                style={styles.modalCancelButton} 
                                onPress={closeCancelModal}
                                disabled={cancelling}
                            >
                                <Text style={styles.modalCancelText}>Keep Membership</Text>
                            </Pressable>
                            <Pressable 
                                style={[styles.modalConfirmButton, cancelling && styles.modalConfirmButtonDisabled]} 
                                onPress={confirmCancelMembership}
                                disabled={cancelling}
                            >
                                <Text style={styles.modalConfirmText}>
                                    {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}