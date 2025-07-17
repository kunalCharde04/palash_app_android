import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Dimensions, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent, Modal, Platform, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/buttons/Buttons';
import { useTheme } from '@/theme/theme-provider';
import { Star, Clock, Users, MapPin, Video, Calendar, Info, Award, Shield, ArrowLeft, User, X } from 'lucide-react-native';
import { fetchServiceById, Service, TimeSlot } from '@/api/services';
import { getServiceAvailability } from '@/api/fetchAvailablity';
import PopupNotification from '@/components/Notification';
import { LinearGradient } from 'expo-linear-gradient';
import { typography } from '@/theme/typography';
import { BlurView } from 'expo-blur';
import { getReviews, updateReview, deleteReview } from '@/api/review';
import { BookingModal } from '@/components/BookingModal';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { createOrder, verifyPayment } from '@/api/payment';
import Constants from 'expo-constants';
import { WebView } from 'react-native-webview';
import { createBooking } from '@/api/booking';
import { createBookingStart, createBookingSuccess, createBookingFailure, updateReviewStart, updateReviewSuccess, updateReviewFailure } from '@/features/bookings/booking-slice';
import { useDispatch } from 'react-redux';

const { width } = Dimensions.get('window');

// --- Review Form Component ---
function ReviewForm({ review, onSubmit, onCancel }: {
    review: any,
    onSubmit: (values: { rating: number; comment: string }) => void,
    onCancel: () => void,
}) {
    const { colors, spacing } = useTheme();
    const [rating, setRating] = useState(review ? review.rating : 0);
    const [comment, setComment] = useState(review ? review.comment : '');
    const [submitting, setSubmitting] = useState(false);
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
    return (
        <View>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.text.primary, marginBottom: spacing.sm }}>
                {review ? 'Edit Review' : 'Write a Review'}
            </Text>
            <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
                {[...Array(5)].map((_, i) => (
                    <TouchableOpacity key={i} onPress={() => setRating(i + 1)}>
                        <Star
                            size={28}
                            color={i < rating ? colors.feedback.warning.main : colors.neutral.light}
                            fill={i < rating ? colors.feedback.warning.main : 'none'}
                            style={{ marginRight: 4 }}
                        />
                    </TouchableOpacity>
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

export default function ServiceDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { colors, spacing, borderRadius } = useTheme();
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const { user } = useSelector((state: RootState) => state.authReducer);
  const { reviews: bookingReviews } = useSelector((state: RootState) => state.bookingReducer);
  const [availability, setAvailability] = useState<any[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    visible: boolean;
  }>({
    type: 'info',
    message: 'This is a notification',
    visible: false,
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const { width: windowWidth } = useWindowDimensions();
  const [showPaymentWebView, setShowPaymentWebView] = useState(false);
  const [razorpayHtml, setRazorpayHtml] = useState('');
  const [bookingDetails, setBookingDetails] = useState<{
    date: string;
    timeSlot: string;
    email: string;
  }>({
    date: '',
    timeSlot: '',
    email: ''
  });
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewEditMode, setReviewEditMode] = useState(false);

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ type, message, visible: true });
  };

  const hideNotification = () => {
    setNotification({ ...notification, visible: false });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.neutral.lightest,
    },
    header: {
      position: 'relative',
      height: 400,
      borderBottomLeftRadius: borderRadius.primary,
      borderBottomRightRadius: borderRadius.primary,
      overflow: 'hidden',
    },
    headerImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    headerOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    backButton: {
      position: 'absolute',
      top: spacing.xl,
      left: spacing.lg,
      zIndex: 1,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerContent: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: spacing.lg,
    },
    headerGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '100%',
    },
    title: {
      color: colors.neutral.white,
      fontSize: 32,
      fontFamily: typography.fontFamily.serif.Hero,
      marginBottom: spacing.xs,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: -1, height: 1 },
      textShadowRadius: 10,
    },
    category: {
      color: colors.neutral.white,
      fontSize: 16,
      opacity: 0.9,
      marginBottom: spacing.sm,
    },
    content: {
      flex: 1,
      padding: spacing.lg,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: spacing.lg,
    },
    price: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary.main,
    },
    originalPrice: {
      fontSize: 18,
      color: colors.text.secondary,
      textDecorationLine: 'line-through',
      marginLeft: spacing.sm,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    rating: {
      flexDirection: 'row',
      marginRight: spacing.sm,
    },
    ratingText: {
      fontSize: 14,
      color: colors.text.secondary,
      marginLeft: spacing.xs,
    },
    infoSection: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    description: {
      fontSize: 16,
      color: colors.text.primary,
      lineHeight: 24,
      marginBottom: spacing.lg,
    },
    detailsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: spacing.lg,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '50%',
      marginBottom: spacing.md,
    },
    detailIcon: {
      marginRight: spacing.sm,
    },
    detailText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    benefitsContainer: {
      marginBottom: spacing.xl,
    },
    benefitItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    benefitText: {
      fontSize: 14,
      color: colors.text.primary,
      marginLeft: spacing.sm,
    },
    instructorSection: {
      backgroundColor: colors.neutral.white,
      borderRadius: borderRadius.primary,
      padding: spacing.lg,
      marginBottom: spacing.xl,
      shadowColor: colors.neutral.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    instructorName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    instructorBio: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 20,
    },
    bookingButtonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: spacing.lg,
      paddingVertical: spacing.xl,
      borderTopLeftRadius: borderRadius.primary,
      borderTopRightRadius: borderRadius.primary,
      overflow: 'hidden',
      zIndex: 100,
      borderTopWidth: 2,
      borderTopColor: colors.neutral.lightest,
    },
    bookingButtonBlur: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    errorText: {
      fontSize: 16,
      color: colors.feedback.error.main,
      textAlign: 'center',
    },
    contentContainer: {
      paddingBottom: 180,
    },
    paginationContainer: {
      position: 'absolute',
      bottom: spacing.lg,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      marginHorizontal: 4,
    },
    paginationDotActive: {
      backgroundColor: colors.neutral.white,
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    reviewSection: {
      marginBottom: 150,
      backgroundColor: colors.neutral.white,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.primary,
    },
    reviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
      paddingHorizontal: spacing.md,
    },
    reviewTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginLeft: spacing.sm,
    },
    reviewList: {
      gap: spacing.lg,
    },
    reviewCard: {
      backgroundColor: colors.neutral.lightest,
      borderRadius: borderRadius.primary,
      padding: spacing.md,
      marginHorizontal: spacing.md,
    },
    reviewUserInfo: {
      flex: 1,
      marginLeft: spacing.sm,
    },
    reviewUserName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
    },
    reviewDate: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 2,
    },
    reviewRating: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    reviewComment: {
      fontSize: 14,
      color: colors.text.primary,
      lineHeight: 20,
    },
    noReviews: {
      textAlign: 'center',
      color: colors.text.secondary,
      padding: spacing.xl,
    },
  });
  const loadService = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetchServiceById(id as string);
        setService(response.service);
      } catch (err) {
        showNotification('error', 'Failed to load service details. Please try again later.');
        setError('Failed to load service details. Please try again later.');
        console.error('Error loading service:', err);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    loadService();
  }, [id]);


  useEffect(() => {
    const loadAvailability = async () => {
      try {
        const availability = await getServiceAvailability(id as string);
        console.log(availability);
        setAvailability(availability);
      } catch (err) {
        showNotification('error', 'Failed to load availability. Please try again later.');
        console.error('Error loading availability:', err);
      }
    };

    loadAvailability();
  }, [id]); 

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await getReviews(id as string);
        setReviews(response.data.reviews);
      } catch (err) {
        showNotification('error', 'Failed to load reviews. Please try again later.');
        console.error('Error loading reviews:', err);
      }
    };

    loadReviews();
  }, [bookingReviews]);

  // Auto scroll effect
  useEffect(() => {
    const autoScroll = setInterval(() => {
      if (scrollViewRef.current) {
        const nextIndex = (currentImageIndex + 1) % (service?.media.length || 1);
        setCurrentImageIndex(nextIndex);
        scrollViewRef.current.scrollTo({
          x: nextIndex * windowWidth,
          animated: true
        });
      }
    }, 6000); // Auto scroll every 10 seconds

    return () => clearInterval(autoScroll);
  }, [currentImageIndex, service?.media.length, windowWidth]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / windowWidth);
    setCurrentImageIndex(index);
  };

   const handlePayment = async () => {
    try {
      if(!user?.id || !service?.id) {
        showNotification('error', 'User ID or Service ID is missing');
        return;
      }


      // Create order on your backend
      const orderResponse = await createOrder({
        userId: user?.id,
        serviceId: service?.id,
      });

      console.log("orderResponse: ", orderResponse);

      if (!orderResponse || !orderResponse.id) {
        showNotification('error', 'Failed to create order');
        return;
      }

      console.log("Constants.expoConfig?.extra?.EXPO_PUBLIC_RAZORPAY_KEY_ID: ", Constants.expoConfig?.extra?.EXPO_PUBLIC_RAZORPAY_KEY_ID);

      // Prepare Razorpay options
      const options = {
        key: Constants.expoConfig?.extra?.EXPO_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: 'Palash App',
        description: orderResponse.notes?.description || `Payment for ${service?.name}`,
        order_id: orderResponse.id,
        prefill: {
          name: user?.name || '',
          email: user?.phone_or_email || '',
          contact: user?.phone_or_email || '',
        },
        theme: {
          color: '#082B12'
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
      console.error('Payment error:', error);
      showNotification('error', 'Payment initialization failed. Please try again.');
      return false;
    }
  };

  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'payment_success') {
        setShowPaymentWebView(false);
        
        if (!user?.id || !service?.id || !user?.phone_or_email) {
          showNotification('error', 'User information is missing');
          return false;
        }

        setIsPaymentProcessing(true);

        // Verify payment on your backend
        const verificationResponse = await verifyPayment({
          orderId: data.orderId,
          paymentId: data.paymentId,
          signature: data.signature,
          userId: user.id,
          serviceId: service.id,
          date: new Date(bookingDetails.date).toISOString(),
          timeSlot: bookingDetails.timeSlot,
          email: user.phone_or_email
        });

        const bookingData: any = {
              userId: user.id,
              serviceId: service.id,
              date: new Date(bookingDetails.date).toISOString(),
              timeSlot: bookingDetails.timeSlot,
              paymentId: data.paymentId,
              email: user.phone_or_email,
            };

        await createBooking(bookingData);
        dispatch(createBookingSuccess(bookingData));
        setIsPaymentProcessing(false);
        showNotification('success', 'Booking created successfully!');
        return true;
      } else if (data.type === 'payment_error') {
        setShowPaymentWebView(false);
        setIsPaymentProcessing(false);
        dispatch(createBookingFailure('Payment failed. If you have already paid, please wait for the admin to confirm your booking.'));
        showNotification('error', 'Payment failed. If you have already paid, please wait for the admin to confirm your booking.');
        return false;
      }
    } catch (error) {
      dispatch(createBookingFailure('Payment verification failed'));
      console.error('Payment verification error:', error);
      setIsPaymentProcessing(false);
      showNotification('error', 'Payment verification failed');
      return false;
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleBooking = (date: string, timeSlot: TimeSlot, email: string) => {
    setBookingDetails({
      date: date,
      timeSlot: formatTime(timeSlot.startTime),
      email: email
    });
    dispatch(createBookingStart());
    handlePayment().then(() => {
    }).catch((error) => {
      showNotification('error', 'Booking failed. Please try again later.');
      setIsPaymentProcessing(false);
    });
  };

  if (isLoading || isPaymentProcessing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: 'bold', marginTop: spacing.xl }}>
          {isPaymentProcessing ? 'Processing your payment...' : 'Loading service details...'}
        </Text>
      </View>
    );
  }

  if (error || !service) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Service not found'}</Text>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <PopupNotification
        type={notification.type}
        message={notification.message}
        visible={notification.visible}
        onClose={hideNotification}
        duration={4000}
      />
      
      <ScrollView style={styles.contentContainer}>
        <View style={styles.header}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {service?.media.map((image, index) => (
              <View key={index} style={{ width: windowWidth }}>
                <Image 
                  source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/api/v1${image}` }} 
                  style={styles.headerImage} 
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.headerOverlay} />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.primary.main} />
          </TouchableOpacity>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <Text style={styles.title}>{service?.name}</Text>
              <Text style={styles.category}>{service?.category}</Text>
            </View>
          </LinearGradient>
          <View style={styles.paginationContainer}>
            {service?.media.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentImageIndex && styles.paginationDotActive
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{parseFloat(service.price).toFixed(2)}<Text style={{fontSize: 12, color: colors.text.secondary}}> (GST Included)</Text></Text>
            {service.discountPrice && (
              <Text style={styles.originalPrice}>₹{parseFloat(service.discountPrice).toFixed(2)}</Text>
            )}
          </View>

          <View style={styles.ratingContainer}>
            {service.average_rating && service.total_reviews ? (
              <>
                <View style={styles.rating}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < Math.floor(service.average_rating || 0) ? colors.feedback.warning.main : 'transparent'}
                      color={colors.feedback.warning.main}
                    />
                  ))}
                </View>
                <Text style={styles.ratingText}>
                  {service.average_rating.toFixed(1)} ({service.total_reviews} reviews)
                </Text>
              </>
            ) : (
              <Text style={styles.ratingText}>No reviews yet</Text>
            )}
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Clock size={20} color={colors.primary.main} style={styles.detailIcon} />
              <Text style={styles.detailText}>{service.duration} hours</Text>
            </View>
            <View style={styles.detailItem}>
              <Users size={20} color={colors.primary.main} style={styles.detailIcon} />
              <Text style={styles.detailText}>{service.sessionType}</Text>
            </View>
            {service.isOnline ? (
              <View style={styles.detailItem}>
                <Video size={20} color={colors.primary.main} style={styles.detailIcon} />
                <Text style={styles.detailText}>Online Session</Text>
              </View>
            ) : (
              <View style={styles.detailItem}>
                <MapPin size={20} color={colors.primary.main} style={styles.detailIcon} />
                <Text style={styles.detailText}>{service.location?.city || 'Location'}</Text>
              </View>
            )}
            <View style={styles.detailItem}>
              <Award size={20} color={colors.primary.main} style={styles.detailIcon} />
              <Text style={styles.detailText}>{service.difficultyLevel || 'All Levels'}</Text>
            </View>
          </View>


          <View style={{marginBottom: spacing['2xl']}}>
            <Button
              title="Book Now"
              onPress={() => setIsBookingModalVisible(true)}
              variant="primary"
              size="large"
            />
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>About this service</Text>
            <Text style={styles.description}>{service.description}</Text>
          </View>

          {service.benefitsAndOutcomes && service.benefitsAndOutcomes.length > 0 && (
            <View style={styles.benefitsContainer}>
              <Text style={styles.sectionTitle}>Benefits & Outcomes</Text>
              {service.benefitsAndOutcomes.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Award size={16} color={colors.primary.main} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          )}

          {service.instructorName && (
            <View style={styles.instructorSection}>
              <Text style={styles.sectionTitle}>About the Instructor</Text>
              <Text style={styles.instructorName}>{service.instructorName}</Text>
              <Text style={styles.instructorBio}>{service.instructorBio}</Text>
            </View>
          )}

          {service.cancellationPolicy && (
            <View style={{marginBottom: spacing.lg, backgroundColor: colors.neutral.white, paddingVertical: spacing.lg, paddingHorizontal: spacing.md, borderRadius: borderRadius.primary, paddingLeft: spacing.xl}}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md}}>
                <Shield size={20} color={colors.feedback.error.main} style={{marginRight: spacing.sm}} />
                <Text style={[styles.sectionTitle, {color: colors.feedback.error.main, marginBottom: 0}]}>Cancellation Policy</Text>
              </View>
              <View style={[styles.detailItem, {width: '90%'}]}>
                <Text style={[styles.detailText]}>{service.cancellationPolicy}</Text>
              </View>
            </View>
          )}

          {/* Reviews Section */}
          <View style={styles.reviewSection}>
            <View style={styles.reviewHeader}>
              <Star size={24} color={colors.primary.main} />
              <Text style={styles.reviewTitle}>Customer Reviews</Text>
            </View>
            
            {reviews.length > 0 ? (
              <View style={styles.reviewList}>
                {reviews.map((review) => (
                  <TouchableOpacity
                    key={review.id}
                    style={styles.reviewCard}
                    onPress={() => {
                      setSelectedReview(review);
                      setReviewEditMode(false);
                      setReviewModalVisible(true);
                    }}
                  >
                    <View style={styles.reviewHeader}>
                      <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary.main, justifyContent: 'center', alignItems: 'center'}}>
                        <User size={24} color={colors.neutral.white} />
                      </View>
                      <View style={styles.reviewUserInfo}>
                        <Text style={styles.reviewUserName}>{review.user.name || 'Anonymous User'}</Text>
                        <Text style={styles.reviewDate}>
                          {new Date(review.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.reviewRating}>
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          size={16}
                          fill={index < review.rating ? colors.feedback.warning.main : colors.neutral.light}
                          color={index < review.rating ? colors.feedback.warning.main : colors.neutral.light}
                        />
                      ))}
                    </View>
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                    {/* Show edit/delete if user is author */}
                    {user && review.user.id === user.id && (
                      <View style={{ flexDirection: 'row', marginTop: 8 }}>
                        <Button
                          title="Edit"
                          onPress={() => {
                            setSelectedReview(review);
                            setReviewEditMode(true);
                            setReviewModalVisible(true);
                          }}
                          variant="secondary"
                          size="small"
                          style={{ marginRight: 8 }}
                        />
                        <Button
                          title="Delete"
                          onPress={async () => {
                            await deleteReview(review.id);
                            setReviews(reviews.filter(r => r.id !== review.id));
                            showNotification('success', 'Review deleted');
                          }}
                          variant="secondary"
                          size="small"
                          textStyle={{ color: colors.feedback.error.main }}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.noReviews}>No reviews yet. Be the first to review this service!</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* <View style={styles.bookingButtonContainer}>
        <BlurView
          intensity={100}
          tint="light"
          style={styles.bookingButtonBlur}
        />
      </View> */}

      <BookingModal
        isVisible={isBookingModalVisible}
        onClose={() => setIsBookingModalVisible(false)}
        onConfirm={handleBooking}
        serviceId={id as string}
        user={user}
        serviceName={service?.name || ''}
        servicePrice={service?.price || '0'}
        serviceDuration={service?.duration || '0'}
        serviceSessionType={service?.sessionType || ''}
        serviceLocation={service?.location?.city || ''}
        serviceDifficultyLevel={service?.difficultyLevel || ''}
        serviceIsOnline={service?.isOnline || false}
        availability={availability}
      />

      {showPaymentWebView && (
        <Modal
          visible={showPaymentWebView}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowPaymentWebView(false)}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: colors.primary.main }}>
              <Text style={{ color: 'white', fontSize: 18 }}>Complete Payment</Text>
              <TouchableOpacity onPress={() => setShowPaymentWebView(false)}>
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>
            <WebView
              originWhitelist={['*']}
              source={{ html: razorpayHtml }}
              onMessage={handleWebViewMessage}
            />
          </View>
        </Modal>
      )}

      {/* Review Modal */}
      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(11, 57, 22, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: colors.background.default, borderRadius: borderRadius.primary, padding: spacing.lg, width: '90%', maxWidth: 400 }}>
            {selectedReview && !reviewEditMode ? (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.text.primary }}>Review by {selectedReview.user.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        color={i < selectedReview.rating ? colors.feedback.warning.main : colors.neutral.light}
                        fill={i < selectedReview.rating ? colors.feedback.warning.main : 'none'}
                        style={{ marginRight: 2 }}
                      />
                    ))}
                  </View>
                </View>
                <Text style={{ fontSize: 15, color: colors.text.secondary, marginBottom: spacing.md }}>{selectedReview.comment}</Text>
                <Text style={{ fontSize: 12, color: colors.text.disabled, marginBottom: spacing.md }}>{new Date(selectedReview.created_at).toLocaleString()}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: spacing.md }}>
                  {user && selectedReview.user.id === user.id && (
                    <>
                      <Button
                        title="Edit"
                        onPress={() => setReviewEditMode(true)}
                        variant="secondary"
                        size="small"
                        style={{ marginRight: spacing.sm }}
                      />
                      <Button
                        title="Delete"
                        onPress={async () => {
                          await deleteReview(selectedReview.id);
                          loadService();
                          setReviews(reviews.filter(r => r.id !== selectedReview.id));
                          setReviewModalVisible(false);
                          showNotification('success', 'Review deleted');
                        }}
                        variant="secondary"
                        size="small"
                        textStyle={{ color: colors.feedback.error.main }}
                      />
                    </>
                  )}
                  <Button
                    title="Close"
                    onPress={() => setReviewModalVisible(false)}
                    variant="ghost"
                    size="small"
                  />
                </View>
              </>
            ) : (
              // Edit Mode
              <ReviewForm
                review={selectedReview}
                onSubmit={async (values) => {
                  try {
                    dispatch(updateReviewStart());
                    const updated = await updateReview(selectedReview.id, {
                      rating: values.rating,
                      comment: values.comment,
                    });
                    loadService();
                    dispatch(updateReviewSuccess(updated));
                    showNotification('success', 'Review updated');
                  } catch (error) {
                    dispatch(updateReviewFailure(error as string));
                    showNotification('error', 'Review update failed');
                  }
                }}
                onCancel={() => setReviewModalVisible(false)}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
} 