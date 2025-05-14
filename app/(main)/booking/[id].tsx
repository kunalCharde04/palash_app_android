import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Modal, TextInput } from 'react-native';
import { useTheme } from '@/theme/theme-provider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Badge } from '@/components/Badge';
import { Calendar, Clock, MapPin, User, CreditCard, ArrowLeft, Phone, Mail, Star } from 'lucide-react-native';
import { Button } from '@/components/ui/buttons/Buttons';
import PopupNotification from '@/components/Notification';
import { getBookingById } from '@/api/booking';
import { useDispatch, useSelector } from 'react-redux';
import { addReviewStart, addReviewSuccess, addReviewFailure } from '@/features/bookings/booking-slice';
import { createReview as apiCreateReview, getReviewsByUser } from '@/api/review';


interface Service {
    id: string;
    name: string;
    description: string;
    media: string[];
    instructorName: string;
    instructorBio: string;
    location?: {
        address: string;
        city: string;
    };
}

interface Booking {
    id: string;
    date: string;
    time_slot: string;
    status: string;
    payment_status: string;
    total_amount: string;
    service: Service;
}

interface Review {
    id: string;
    serviceId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}


export default function BookingDetailsScreen() {
    const { colors, spacing, borderRadius } = useTheme();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({
        type: 'success',
        message: '',
        visible: false
    });
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [reviewEditMode, setReviewEditMode] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        const loadBooking = async () => {
            try {
                const data = await getBookingById(id as string);
                if (data) {
                    setBooking(data);
                    showNotification('success', 'Booking details loaded successfully');
                } else {
                    throw new Error('Invalid booking data');
                }
            } catch (error) {
                console.error(error);
                showNotification('error', 'Failed to load booking details');
            } finally {
                setLoading(false);
            }
        };
        loadBooking();
    }, [id]);

    const createReview = async (serviceId: string, review: { rating: number; comment: string, bookingId: string }): Promise<any> => {
        // Compose payload as per API
        try {
            dispatch(addReviewStart());
            const payload = {
                serviceId,
                rating: review.rating,
                comment: review.comment,
                bookingId: review.bookingId,
            };
            const created = await apiCreateReview(payload);
            dispatch(addReviewSuccess(created));
            return created;
        } catch (error) {
            dispatch(addReviewFailure(error as string));
            console.error(error);
            showNotification('error', 'Failed to create review');
        }
    };

    // useEffect(() => {
    //     const fetchReviewByUser = async () => {
    //         try {
    //             const data = await getReviewsByUser();
    //             console.log("======== data", data);
    //             // setReviews(data);
    //         }
    //         catch(error) {
    //             console.error(error);
    //             showNotification('error', 'Failed to fetch review');
    //         }
    //     }
    //     fetchReviewByUser();
    // }, [id])
   


    // useEffect(() => {
    //     if (!booking) return;
    //     const loadReviews = async () => {
    //         setReviewsLoading(true);
    //         try {
    //             const data = await getReviewsByServiceId(booking.service.name); // Use service.id if available
    //             setReviews(data);
    //         } catch (e) {
    //             showNotification('error', 'Failed to load reviews');
    //         } finally {
    //             setReviewsLoading(false);
    //         }
    //     };
    //     loadReviews();
    // }, [booking]);

    const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
        setNotification({ type, message, visible: true });
    };

    const hideNotification = () => {
        setNotification({ ...notification, visible: false });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
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

    const handleCancelBooking = () => {
        // TODO: Implement cancel booking functionality
        showNotification('info', 'Cancel booking functionality coming soon');
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background.default,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.lg,
            borderBottomWidth: 1,
            paddingTop: spacing['4xl'],
            borderBottomColor: colors.neutral.light,
            backgroundColor: colors.neutral.lightest,
        },
        backButton: {
            marginRight: spacing.md,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text.primary,
        },
        content: {
            padding: spacing.lg,
        },
        image: {
            width: '100%',
            height: 250,
            resizeMode: 'cover',
            borderRadius: borderRadius.primary,
            marginBottom: spacing.lg,
        },
        section: {
            backgroundColor: colors.neutral.lightest,
            borderRadius: borderRadius.primary,
            padding: spacing.lg,
            marginBottom: spacing.xl,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text.primary,
            marginBottom: spacing.md,
            maxWidth: '60%',
        },
        detailRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.md,
        },
        detailIcon: {
            marginRight: spacing.sm,
            color: colors.text.secondary,
        },
        detailText: {
            fontSize: 14,
            color: colors.text.secondary,
            flex: 1,
        },
        statusContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.md,
        },
        price: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.primary.main,
        },
        description: {
            fontSize: 14,
            color: colors.text.secondary,
            lineHeight: 20,
            marginBottom: spacing.md,
        },
        buttonContainer: {
            marginBottom: spacing['3xl'],
        },
        emptyState: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.xl,
        },
        emptyStateText: {
            fontSize: 16,
            color: colors.text.secondary,
            textAlign: 'center',
            marginTop: spacing.md,
        },
        bioContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.md,
        },
        bioText: {
            fontSize: 14,
            color: colors.text.secondary,
            lineHeight: 20,
            marginBottom: spacing.md,
        },
    });

    // --- Review Card & Modal Styles ---
    const reviewCardStyles = StyleSheet.create({
        card: {
            backgroundColor: colors.background.paper,
            borderRadius: borderRadius.input,
            padding: spacing.md,
            marginBottom: spacing.md,
            shadowColor: colors.neutral.dark,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            borderWidth: 1,
            borderColor: colors.neutral.light,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.xs,
        },
        userName: {
            fontWeight: 'bold',
            color: colors.text.primary,
            fontSize: 15,
        },
        ratingRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        comment: {
            color: colors.text.secondary,
            fontSize: 14,
            marginBottom: spacing.xs,
        },
        date: {
            color: colors.text.disabled,
            fontSize: 12,
            alignSelf: 'flex-end',
        },
    });
    const modalStyles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(11, 57, 22, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modal: {
            backgroundColor: colors.background.default,
            borderRadius: borderRadius.primary,
            padding: spacing.lg,
            width: '90%',
            maxWidth: 400,
            shadowColor: colors.neutral.dark,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.md,
        },
        title: {
            fontWeight: 'bold',
            fontSize: 18,
            color: colors.text.primary,
        },
        comment: {
            fontSize: 15,
            color: colors.text.secondary,
            marginBottom: spacing.md,
        },
        date: {
            fontSize: 12,
            color: colors.text.disabled,
            marginBottom: spacing.md,
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginTop: spacing.md,
        },
    });

    // --- Review Form Component ---
    function ReviewForm({ review, onSubmit, onCancel }: {
        review: Review | null,
        onSubmit: (values: { rating: number; comment: string }) => void,
        onCancel: () => void,
    }) {
        const { colors, spacing } = useTheme();
        const [rating, setRating] = useState(review ? review.rating : 0);
        const [comment, setComment] = useState(review ? review.comment : '');
        const [submitting, setSubmitting] = useState(false);
        return (
            <View>
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.text.primary, marginBottom: spacing.sm }}>
                    {review ? 'Edit Review' : 'Write a Review'}
                </Text>
                <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
                    {[...Array(5)].map((_, i) => (
                        <Pressable key={i} onPress={() => setRating(i + 1)}>
                            <Star
                                size={28}
                                color={i < rating ? colors.feedback.warning.main : colors.neutral.light}
                                fill={i < rating ? colors.feedback.warning.main : 'none'}
                                style={{ marginRight: 4 }}
                            />
                        </Pressable>
                    ))}
                </View>
                <TextInput
                    value={comment}
                    onChangeText={setComment}
                    placeholder="Write your review..."
                    multiline
                    style={{ minHeight: 80, marginBottom: spacing.md }}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <Button
                        title="Cancel"
                        onPress={onCancel}
                        variant="ghost"
                        size="small"
                        style={{ marginRight: spacing.sm }}
                    />
                    <Button
                        title={review ? 'Update' : 'Submit'}
                        onPress={async () => {
                            setSubmitting(true);
                            await onSubmit({ rating, comment });
                            setSubmitting(false);
                        }}
                        variant="primary"
                        size="small"
                        disabled={submitting || rating === 0 || comment.trim() === ''}
                    />
                </View>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={[styles.container, styles.emptyState]}>
                <Text style={styles.emptyStateText}>Loading booking details...</Text>
            </View>
        );
    }

    if (!booking) {
        return (
            <View style={[styles.container, styles.emptyState]}>
                <Text style={styles.emptyStateText}>Booking not found</Text>
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
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text.primary} />
                </Pressable>
                <Text style={styles.headerTitle}>Booking Details</Text>
            </View>
            <ScrollView style={styles.content}>
                <Image
                    source={{ uri: encodeURI(`${process.env.EXPO_PUBLIC_API_URL}${booking.service.media[0]}`) }}
                    style={styles.image}
                />
                <View style={styles.section}>
                    <View style={styles.statusContainer}>
                        <Text style={styles.sectionTitle}>{booking.service.name}</Text>
                        <Badge
                            text={booking.status}
                            variant={getStatusColor(booking.status)}
                            size="small"
                        />
                    </View>
                    <Text style={styles.description}>{booking.service.description}</Text>
                    <View style={styles.detailRow}>
                        <Calendar size={16} style={styles.detailIcon} />
                        <Text style={styles.detailText}>{formatDate(booking.date)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Clock size={16} style={styles.detailIcon} />
                        <Text style={styles.detailText}>{booking.time_slot}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <User size={16} style={styles.detailIcon} />
                        <Text style={styles.detailText}>{booking.service.instructorName}</Text>
                    </View>
                    {booking.service.location && (
                        <View style={styles.detailRow}>
                            <MapPin size={16} style={styles.detailIcon} />
                            <Text style={styles.detailText}>
                                {booking.service.location.address}, {booking.service.location.city}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Instructor Details</Text>
                    <View style={styles.detailRow}>
                        <User size={16} style={styles.detailIcon} />
                        <Text style={styles.detailText}>{booking.service.instructorName || 'No instructor name available'}</Text>
                    </View>
                    <View style={styles.bioContainer} >
                        <Text style={styles.bioText}>{booking.service.instructorBio || 'No bio available'}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Details</Text>
                    <View style={styles.detailRow}>
                        <CreditCard size={16} style={styles.detailIcon} />
                        <Text style={styles.detailText}>Payment Status: {booking.payment_status}</Text>
                    </View>
                    <Text style={styles.price}>₹{booking.total_amount}</Text>
                </View>

                <View style={styles.buttonContainer}>
                    {booking.status === 'CONFIRMED' && (
                        <Button
                            title="Cancel Booking"
                            onPress={handleCancelBooking}
                            variant="secondary"
                            size="large"
                            disabled={true}
                            style={{ marginBottom: spacing.md}}
                        />
                    )}
                </View>


                {/* --- Reviews Section --- */}
                <View style={[styles.section, {marginBottom: 180}]}> 
                    <Text style={styles.sectionTitle}>Write a Review</Text>
                    <View style={{ marginTop: spacing.md }}>
                        <Button
                            title="Write a Review"
                            onPress={() => {
                                setSelectedReview(null);
                                setReviewEditMode(true);
                                setReviewModalVisible(true);
                            }}
                            variant="primary"
                            size="medium"
                        />
                    </View>
                </View>

                {/* --- Review Modal --- */}
                <Modal
                    visible={reviewModalVisible}
                    animationType="slide"
                    transparent
                    onRequestClose={() => setReviewModalVisible(false)}
                >
                    <View style={modalStyles.overlay}>
                        <View style={modalStyles.modal}>
                            <ReviewForm
                                review={null}
                                onSubmit={async (values) => {
                                    if (booking) {
                                        // Create
                                        const created = await createReview(booking.service.id, {
                                            rating: values.rating,
                                            comment: values.comment,
                                            bookingId: id as string,
                                        });
                                        showNotification('success', 'Review added');
                                    }
                                    setReviewModalVisible(false);
                                }}
                                onCancel={() => setReviewModalVisible(false)}
                            />
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </View>
    );
} 