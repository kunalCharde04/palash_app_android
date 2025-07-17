import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Dimensions } from 'react-native';
import { useTheme } from '@/theme/theme-provider';
import { getBookings, getBookingsByUserId } from '@/api/booking';
import PopupNotification from '@/components/Notification';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Badge } from '@/components/Badge';
import { Calendar, Clock, MapPin, User, CreditCard, ArrowRight, Users, CheckCircle, XCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Svg, Defs, RadialGradient, Stop, Circle, Rect, Path } from 'react-native-svg';
import { typography } from '@/theme/typography';
const { width } = Dimensions.get("window");

interface Location {
    address: string;
    city: string;
}

interface Service {
    id: string;
    name: string;
    instructorName: string;
    media: string[];
    location?: Location;
}

interface Booking {
    id: string;
    service: Service;
    date: string;
    time_slot: string;
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
    total_amount: number;
}

interface BookingsResponse {
    activeBookings: Booking[];
    cancelledBookings: Booking[];
    totalBookings: number;
    expiredCount: number;
}

type TabType = 'active' | 'inactive';

export default function BookedServicesScreen() {
    const { colors, spacing, borderRadius } = useTheme();
    const [activeTab, setActiveTab] = useState<TabType>('active');
    const [bookingsData, setBookingsData] = useState<BookingsResponse>({
        activeBookings: [],
        cancelledBookings: [],
        totalBookings: 0,
        expiredCount: 0
    });
    console.log("bookingsData: ", bookingsData);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({
        type: 'success' as 'success' | 'error' | 'info' | 'warning',
        message: '',
        visible: false
    });
    const { user } = useSelector((state: RootState) => state.authReducer);
    const { currentBooking } = useSelector((state: RootState) => state.bookingReducer);
    const router = useRouter();

    const tabs = [
        { 
            key: 'active' as TabType, 
            title: 'Active Bookings', 
            count: bookingsData.activeBookings.length,
            icon: CheckCircle
        },
        { 
            key: 'inactive' as TabType, 
            title: 'Past Bookings', 
            count: bookingsData.cancelledBookings.length,
            icon: XCircle
        },
    ];

    const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
        setNotification({ type, message, visible: true });
    };

    const hideNotification = () => {
        setNotification({ ...notification, visible: false });
    };

    useEffect(() => {
        const loadBookings = async () => {
            try {
                if (!user?.id) {
                    showNotification('error', 'User not found');
                    return;
                }
                const response = await getBookingsByUserId(user.id);
                // Handle both old and new API response formats
                if (response.activeBookings && response.cancelledBookings) {
                    setBookingsData(response);
                } else {
                    // Fallback for old format - treat all as active bookings
                    setBookingsData({
                        activeBookings: response,
                        cancelledBookings: [],
                        totalBookings: response.length,
                        expiredCount: 0
                    });
                }
                showNotification('success', 'Bookings loaded successfully');
            } catch (error) {
                console.error(error);
                showNotification('error', 'Failed to load bookings');
            } finally {
                setLoading(false);
            }
        }
        loadBookings();
    }, [user?.id, currentBooking]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: Booking['status']) => {
        switch (status) {
            case 'CONFIRMED':
                return 'success';
            case 'PENDING':
                return 'warning';
            case 'CANCELLED':
                return 'error';
            default:
                return 'info';
        }
    };

    const handleBookingPress = (bookingId: string) => {
        router.push({
            pathname: "/(main)/booking/[id]",
            params: { id: bookingId }
        });
    };

    const renderBookingCard = (booking: Booking) => (
        <Pressable
            key={booking.id}
            style={styles.bookingCard}
            onPress={() => handleBookingPress(booking.id)}
        >
            <Image
                source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/api/v1${booking.service.media[0]}` }}
                style={styles.bookingImage}
            />
            <View style={styles.bookingContent}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.serviceName}>{booking.service.name.length > 20 ? booking.service.name.slice(0, 20) + '...' : booking.service.name}</Text>
                    <Badge
                        text={booking.status}
                        variant={getStatusColor(booking.status)}
                        size="small"
                    />
                </View>
                <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                        <Calendar size={16} color={colors.text.secondary} style={styles.detailIcon} />
                        <Text style={styles.detailText}>{formatDate(booking.date)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Clock size={16} color={colors.text.secondary} style={styles.detailIcon} />
                        <Text style={styles.detailText}>{booking.time_slot}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <User size={16} color={colors.text.secondary} style={styles.detailIcon} />
                        <Text style={styles.detailText}>{booking.service.instructorName}</Text>
                    </View>
                    {booking.service.location && (
                        <View style={styles.detailRow}>
                            <MapPin size={16} color={colors.text.secondary} style={styles.detailIcon} />
                            <Text style={styles.detailText}>
                                {booking.service.location.address}, {booking.service.location.city}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.priceContainer}>
                    <Text style={styles.price}>₹{booking.total_amount}</Text>
                    <View style={styles.viewDetailsButton}>
                        <Text style={styles.viewDetailsText}>View Details</Text>
                        <ArrowRight size={16} color={colors.neutral.white} />
                    </View>
                </View>
            </View>
        </Pressable>
    );

    const renderEmptyState = (title: string, description: string, icon: any) => {
        const IconComponent = icon;
        return (
            <View style={styles.emptyTabState}>
                <IconComponent size={64} color={colors.text.disabled} />
                <Text style={styles.emptyTitle}>{title}</Text>
                <Text style={styles.emptyDescription}>{description}</Text>
            </View>
        );
    };

    const renderTabContent = () => {
        if (activeTab === 'active') {
            if (bookingsData.activeBookings.length === 0) {
                return renderEmptyState(
                    'No Active Bookings', 
                    'You don\'t have any active bookings at the moment. Book a service to get started!',
                    CheckCircle
                );
            }
            return (
                <ScrollView contentContainerStyle={styles.tabContent}>
                    {bookingsData.activeBookings
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((booking) => renderBookingCard(booking))}
                </ScrollView>
            );
        } else {
            if (bookingsData.cancelledBookings.length === 0) {
                return renderEmptyState(
                    'No Past Bookings', 
                    'Your booking history will appear here once you complete or cancel services.',
                    XCircle
                );
            }
            return (
                <ScrollView contentContainerStyle={styles.tabContent}>
                    {bookingsData.cancelledBookings
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((booking) => renderBookingCard(booking))}
                </ScrollView>
            );
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background.default,
        },
        content: {
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
            borderBottomColor: colors.primary.main,
        },
        tabContent: {
            padding: spacing.lg,
            paddingBottom: 100,
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
            color: colors.primary.main,
        },
        tabCount: {
            fontSize: 10,
            color: colors.text.disabled,
            marginTop: 2,
        },
        activeTabCount: {
            color: colors.primary.main,
        },
        bookingCard: {
            backgroundColor: colors.neutral.lightest,
            borderRadius: borderRadius.primary,
            marginBottom: spacing.lg,
            overflow: 'hidden',
            elevation: 2,
            shadowColor: colors.neutral.dark,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        bookingImage: {
            width: '100%',
            height: 200,
            resizeMode: 'cover',
        },
        bookingContent: {
            padding: spacing.lg,
        },
        serviceName: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text.primary,
            marginBottom: spacing.sm,
        },
        bookingDetails: {
            marginTop: spacing.md,
        },
        detailRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.sm,
        },
        detailIcon: {
            marginRight: spacing.sm,
        },
        detailText: {
            fontSize: 14,
            color: colors.text.secondary,
            flex: 1,
        },
        priceContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: spacing.md,
            paddingTop: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.neutral.light,
        },
        price: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.primary.main,
        },
        viewDetailsButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.primary.main,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: borderRadius.primary,
        },
        viewDetailsText: {
            color: colors.neutral.white,
            marginRight: spacing.xs,
            fontWeight: '600',
        },
        emptyState: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: spacing.xl,
            backgroundColor: colors.background.default,
        },
        emptyTabState: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing['6xl'],
        },
        illustrationContainer: {
            width: width * 0.7,
            height: width * 0.7,
            marginBottom: spacing.xl,
        },
        emptyTitle: {
            fontFamily: typography.fontFamily.serif.Hero,
            fontSize: typography.variants.heading.fontSize,
            color: colors.text.primary,
            textAlign: 'center',
            marginBottom: spacing.md,
        },
        emptyDescription: {
            fontFamily: typography.fontFamily.sansSerif.manropeMedium,
            fontSize: typography.variants.paragraph.fontSize,
            color: colors.text.secondary,
            textAlign: 'center',
            lineHeight: typography.variants.paragraph.lineHeight,
            maxWidth: width * 0.8,
        },
        emptyStateText: {
            fontFamily: typography.fontFamily.sansSerif.manropeMedium,
            fontSize: typography.variants.paragraph.fontSize,
            color: colors.text.secondary,
            textAlign: 'center',
        },
    });

    if (loading) {
        return (
            <View style={[styles.container, styles.emptyState]}>
                <Text style={styles.emptyStateText}>Loading bookings...</Text>
            </View>
        );
    }

    const totalBookings = bookingsData.totalBookings;

    if (totalBookings === 0 && activeTab === 'active') {
        return (
            <View style={[styles.container, styles.emptyState]}>
                <View style={styles.illustrationContainer}>
                    <Svg width="100%" height="100%" viewBox="0 0 400 300">
                        <Defs>
                            <RadialGradient id="gradientCircle" cx="200" cy="150" r="150" gradientUnits="userSpaceOnUse">
                                <Stop offset="0" stopColor={colors.primary.accent} stopOpacity="0.1" />
                                <Stop offset="1" stopColor={colors.primary.accent} stopOpacity="0" />
                            </RadialGradient>
                        </Defs>
                        <Circle cx="200" cy="150" r="150" fill="url(#gradientCircle)" />
                        <Rect x="120" y="80" width="160" height="180" rx="8" fill={colors.primary.main} />
                        <Rect x="120" y="80" width="160" height="40" rx="8" fill={colors.secondary.main} />
                        <Path d="M140,140 L260,140" stroke={colors.neutral.white} strokeWidth="2" strokeOpacity="0.3" />
                        <Path d="M140,160 L260,160" stroke={colors.neutral.white} strokeWidth="2" strokeOpacity="0.3" />
                        <Path d="M140,180 L260,180" stroke={colors.neutral.white} strokeWidth="2" strokeOpacity="0.3" />
                        <Path d="M140,200 L260,200" stroke={colors.neutral.white} strokeWidth="2" strokeOpacity="0.3" />
                        <Path d="M140,220 L260,220" stroke={colors.neutral.white} strokeWidth="2" strokeOpacity="0.3" />
                        <Circle cx="160" cy="130" r="4" fill={colors.neutral.white} fillOpacity="0.5" />
                        <Circle cx="200" cy="130" r="4" fill={colors.neutral.white} fillOpacity="0.5" />
                        <Circle cx="240" cy="130" r="4" fill={colors.neutral.white} fillOpacity="0.5" />
                        <Circle cx="100" cy="100" r="20" stroke={colors.secondary.main} strokeWidth="2" fill="none" />
                        <Circle cx="300" cy="200" r="15" stroke={colors.secondary.main} strokeWidth="2" fill="none" />
                        <Circle cx="80" cy="220" r="25" stroke={colors.secondary.main} strokeWidth="2" fill="none" />
                        <Circle cx="200" cy="150" r="80" stroke={colors.primary.accent} strokeWidth="1" fill="none" />
                        <Circle cx="200" cy="150" r="100" stroke={colors.primary.accent} strokeWidth="1" fill="none" />
                        <Circle cx="200" cy="150" r="120" stroke={colors.primary.accent} strokeWidth="1" fill="none" />
                    </Svg>
                </View>
                <Text style={styles.emptyTitle}>No Bookings Found</Text>
                <Text style={styles.emptyDescription}>
                    You haven't made any bookings yet. Explore our services and book your wellness journey today.
                </Text>
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
            
            <View style={styles.header}>
                <Text style={styles.title}>My Bookings</Text>
                <Text style={styles.subtitle}>Manage your service bookings ({totalBookings} total bookings)</Text>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <Pressable
                            key={tab.key}
                            style={[styles.tab, isActive && styles.activeTab]}
                            onPress={() => setActiveTab(tab.key)}
                        >
                            <View style={styles.tabIconContainer}>
                                <IconComponent 
                                    size={18} 
                                    color={isActive ? colors.primary.main : colors.text.secondary}
                                    style={styles.tabIcon} 
                                />
                            </View>
                            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                                {tab.title}
                            </Text>
                            <Text style={[styles.tabCount, isActive && styles.activeTabCount]}>
                                ({tab.count})
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {/* Tab Content */}
            <View style={styles.content}>
                {renderTabContent()}
            </View>
        </View>
    );
} 