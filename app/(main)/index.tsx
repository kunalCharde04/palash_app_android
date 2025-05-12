import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Text, Image, Pressable, Dimensions, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent, TouchableOpacity, Modal } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/buttons/Buttons';
import { useTheme } from '@/theme/theme-provider';
import { logout } from '@/features/auth/auth-slice';
import { clearAuthData } from '@/utils/token';
import { RootState } from '@/store';
import { LogOut, PinIcon, Star, ArrowUp, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react-native';
import { ServiceCard, type ServiceCardProps } from '@/components/ui/ServiceCard';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchServices, type Service } from '@/api/services';
import PopupNotification from '@/components/Notification';
import { Badge as BadgeComponent } from '@/components/Badge';
import { typography } from '@/theme/typography';
import { TextInput } from '@/components/ui/Inputs/input';
import { Svg, Defs, RadialGradient, Stop, Circle, Path } from 'react-native-svg';
import { Video, ResizeMode } from 'expo-av';
import { PlayIcon } from 'lucide-react-native';
const { width } = Dimensions.get("window")

interface VideoItem {
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    videoUrl: string;
}

export default function MainIndex() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { colors, spacing, borderRadius } = useTheme();
    const { user } = useSelector((state: RootState) => state.authReducer);
    const [allServices, setAllServices] = useState<ServiceCardProps[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{
        type: 'success' | 'error' | 'info' | 'warning';
        message: string;
        visible: boolean;
    }>({
        type: 'info',
        message: 'This is a notification',
        visible: false,
    });
    const { width: windowWidth } = useWindowDimensions();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const mainScrollViewRef = useRef<ScrollView>(null);
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
    const [videos] = useState<VideoItem[]>([
        {
            id: '1',
            title: 'Beautiful Nature Scenes',
            thumbnail: require('@/assets/thumbnails/t1.png'),
            duration: '2:30',
            videoUrl: require('@/assets/v1.mp4')
        },
        {
            id: '2',
            title: 'City Life Timelapse',
            thumbnail: require('@/assets/thumbnails/t2.png'),
            duration: '1:45',
            videoUrl: require('@/assets/v2.mp4')
        },
        {
            id: '3',
            title: 'Ocean Waves',
            thumbnail: require('@/assets/thumbnails/t3.png'),
            duration: '3:15',
            videoUrl: require('@/assets/v3.mp4')
        },
        {
            id: '4',
            title: 'Mountain Sunset',
            thumbnail: require('@/assets/thumbnails/t4.png'),
            duration: '2:00',
            videoUrl: require('@/assets/v4.mp4')
        }
    ]);

    const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
        setNotification({ type, message, visible: true });
    };

    const hideNotification = () => {
        setNotification({ ...notification, visible: false });
    };

    // Derive categories from available services
    const categories = React.useMemo(() => {
        const uniqueCategories = new Set(allServices.map(service => service.category));
        return Array.from(uniqueCategories);
    }, [allServices]);

    // Filter services based on selected category
    const filteredServices = React.useMemo(() => {
        if (!selectedCategory) return allServices;
        return allServices.filter(service => service.category === selectedCategory);
    }, [allServices, selectedCategory]);

    // Get featured services
    const featuredServices = React.useMemo(() => {
        return allServices.filter(service => service.featured);
    }, [allServices]);

    useEffect(() => {
        const loadServices = async () => {
            try {
                setLoading(true);
                const data = await fetchServices({ page: 1, limit: 10 });
                showNotification('success', 'Services loaded successfully');
                setAllServices(data.createResponse.services);
            } catch (err) {
                showNotification('error', 'Failed to load services');
                console.error('Error loading services:', err);
            } finally {
                setLoading(false);
            }
        };

        loadServices();
    }, []); // Only load once on mount

    useEffect(() => {
        const autoScroll = setInterval(() => {
            if (scrollViewRef.current) {
                const nextIndex = (currentIndex + 1) % allServices.filter(service => !service.featured).length;
                setCurrentIndex(nextIndex);
                scrollViewRef.current.scrollTo({
                    x: nextIndex * windowWidth,
                    animated: true
                });
            }
        }, 10000); // Auto scroll every 3 seconds

        return () => clearInterval(autoScroll);
    }, [currentIndex, windowWidth, allServices]);

    const handleMainScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowBackToTop(offsetY > 200);
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / windowWidth);
        setCurrentIndex(index);
    };

    const scrollToTop = () => {
        mainScrollViewRef.current?.scrollTo({ y: 0, animated: true });
    };

  

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        gradient: {
            flex: 1,
        },
        content: {
            flex: 1,
        },
        featuredSection: {
            height: 300,
            position: 'relative',
            marginBottom: spacing.lg,
        },
        featuredImage: {
            width: '100%',
            height: '100%',
            position: 'absolute',
        },
        featuredOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        featuredTitle: {
            color: colors.neutral.white,
            fontSize: 32,
            fontWeight: 'bold',
            marginBottom: spacing.md,
        },
        exploreButton: {
            backgroundColor: colors.primary.main,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderRadius: spacing.sm,
        },
        exploreButtonText: {
            color: colors.neutral.white,
            fontSize: 16,
            fontWeight: '600',
        },
        categorySection: {
            paddingHorizontal: spacing.md,
            marginTop: spacing['2xl'],
        },
        categoryScroll: {
            flexDirection: 'row',
            paddingVertical: spacing.sm,
        },
        categoryButton: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            marginRight: spacing.sm,
            borderRadius: spacing.sm,
            borderWidth: 1,
            borderColor: colors.primary.main,
        },
        categoryButtonActive: {
            backgroundColor: colors.primary.main,
        },
        categoryText: {
            color: colors.primary.main,
            fontSize: 14,
            fontWeight: '600',
        },
        categoryTextActive: {
            color: colors.neutral.white,
        },
        servicesSection: {
            padding: spacing.md,
            marginBottom: 140,
        },

        sectionTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text.primary,
            marginBottom: spacing.md,
        },
        errorText: {
            color: colors.feedback.error.main,
            textAlign: 'center',
            marginTop: spacing.xl,
        },
        loadingText: {
            color: colors.text.secondary,
            textAlign: 'center',
            marginTop: spacing.xl,
        },
        logoContainer: {
            width: '100%',
            height: 450,
            marginBottom: spacing.lg,
            backgroundColor: colors.primary.main,
            borderBottomLeftRadius: borderRadius.primary,
            borderBottomRightRadius: borderRadius.primary,
            overflow: 'hidden',
            position: 'relative'
        },
        logo: {
            width: '100%',
            height: '100%'
        },
        dont: {
            width: 160,
            height: 100,
            marginLeft: width / 2 - (160 / 2),
            marginTop: 160
        },
        servicesContainer: {
            maxHeight: 500,
        },
        servicesScrollView: {
            flexGrow: 0,
        },
        paginationContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 10,
        },
        paginationDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#ccc',
            marginHorizontal: 4,
        },
        paginationDotActive: {
            backgroundColor: '#000',
            width: 12,
            height: 12,
            borderRadius: 6,
        },
        serviceGradient: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60%',
            justifyContent: 'flex-end',
            padding: spacing.lg,
        },
        serviceContent: {
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
        },
        serviceTitle: {
            color: colors.neutral.white,
            fontFamily: typography.fontFamily.serif.Hero,
            textAlign: 'center',
            marginBottom: spacing.sm,
            fontSize: 40,
            textShadowColor: 'rgba(0, 0, 0, 0.75)',
            textShadowOffset: { width: -1, height: 1 },
            textShadowRadius: 10
        },
        serviceDescription: {
            color: colors.neutral.white,
            fontSize: 16,
            textAlign: 'center',
            marginBottom: spacing.lg,
            opacity: 0.9,
            textShadowColor: 'rgba(0, 0, 0, 0.75)',
            textShadowOffset: { width: -1, height: 1 },
            textShadowRadius: 10
        },
        ctaButtonHeader: {
            marginTop: spacing['md'],
            marginBottom: spacing['xl'],
            paddingHorizontal: spacing['xl'],
            paddingVertical: spacing.md,
            backgroundColor: colors.primary.accent,
        },
        ctaButtonText: {
            color: colors.neutral.white,
            fontSize: 16,
            fontWeight: 'bold',
        },
        categoryTag: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            marginBottom: spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
        },
        categoryTagText: {
            color: colors.neutral.white,
            fontSize: 12,
            fontWeight: '600',
            textTransform: 'uppercase',
        },
        reviewContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.sm,
        },
        reviewText: {
            color: colors.neutral.white,
            fontSize: 14,
            marginLeft: spacing.xs,
            opacity: 0.9,
        },
        priceContainer: {
            flexDirection: 'row',
            alignItems: 'baseline',
            marginBottom: spacing.md,
        },
        priceText: {
            color: colors.neutral.white,
            fontSize: 24,
            fontWeight: 'bold',
        },
        priceUnit: {
            color: colors.neutral.white,
            fontSize: 14,
            opacity: 0.8,
            marginLeft: spacing.xs,
        },
        featuredServiceText: {
            fontSize: 12,
            opacity: 0.8,
            marginLeft: spacing.xs,
            textAlign: 'center',
        },
        footer: {
            backgroundColor: colors.neutral.white,
            padding: spacing.xl,
            marginTop: spacing.xl,
            borderTopLeftRadius: borderRadius.primary,
            borderTopRightRadius: borderRadius.primary,
            shadowColor: colors.neutral.dark,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
        },
        footerTop: {
            alignItems: 'center',
            marginBottom: spacing.xl,
        },
        footerLogo: {
            width: 120,
            height: 40,
            marginBottom: spacing.md,
        },
        footerTagline: {
            color: colors.text.secondary,
            fontSize: 16,
            textAlign: 'center',
        },
        footerLinks: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            marginBottom: spacing.xl,
        },
        footerLinkColumn: {
            flex: 1,
            minWidth: 150,
            marginBottom: spacing.lg,
        },
        footerLinkTitle: {
            color: colors.text.primary,
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: spacing.md,
        },
        footerLink: {
            color: colors.text.secondary,
            fontSize: 14,
            marginBottom: spacing.sm,
        },
        contactItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.sm,
        },
        contactText: {
            color: colors.text.secondary,
            fontSize: 14,
            marginLeft: spacing.sm,
        },
        socialLinks: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: spacing.xl,
        },
        socialIcon: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.neutral.lightest,
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: spacing.sm,
        },
        footerBottom: {
            borderTopWidth: 1,
            borderTopColor: colors.neutral.lightest,
            paddingTop: spacing.lg,
            alignItems: 'center',
        },
        copyright: {
            color: colors.text.secondary,
            fontSize: 14,
            marginBottom: spacing.md,
        },
        footerBottomLinks: {
            flexDirection: 'row',
            justifyContent: 'center',
        },
        footerBottomLink: {
            color: colors.text.secondary,
            fontSize: 14,
            marginHorizontal: spacing.md,
        },
        backToTop: {
            position: 'absolute',
            bottom: 120,
            right: spacing.xl,
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: colors.primary.main,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: colors.neutral.dark,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
        },
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: spacing.xl,
            backgroundColor: colors.background.default,
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
        videosContainer: {
            // marginVertical: spacing.xl,
            // paddingHorizontal: spacing.md,
            marginTop: spacing['2xl'],
            marginBottom: spacing['2xl'],
            paddingHorizontal: spacing.md
        },
        videoScrollView: {
            marginTop: spacing.md,
        },
        videoCard: {
            position: 'relative',
            width: width * 0.7,
            height: 200,
            marginRight: spacing.md,
            borderRadius: borderRadius.primary,
            overflow: 'hidden',
            backgroundColor: colors.neutral.lightest,
        },
        videoThumbnail: {
            width: '100%',
            height: '100%',
            resizeMode: 'cover',
        },
        videoOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'flex-end',
            padding: spacing.md,
        },
        videoTitle: {
            color: colors.neutral.white,
            fontSize: 16,
            fontWeight: '600',
            marginBottom: spacing.xs,
        },
        videoDuration: {
            color: colors.neutral.white,
            fontSize: 12,
            opacity: 0.8,
        },
        modalContainer: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.9)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContent: {
            width: '90%',
            aspectRatio: 16/9,
            backgroundColor: colors.neutral.dark,
            borderRadius: borderRadius.primary,
            overflow: 'hidden',
        },
        modalVideo: {
            width: '100%',
            height: '100%',
        },
        modalCloseButton: {
            position: 'absolute',
            top: spacing.xl,
            right: spacing.xl,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        viewAllButton: {
            color: colors.primary.main,
            fontSize: 14,
            fontWeight: '600',
        },
    });


    if(allServices.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <View style={styles.illustrationContainer}>
                    <Svg width="100%" height="100%" viewBox="0 0 400 300">
                        <Defs>
                            <RadialGradient id="gradientCircle" cx="200" cy="150" r="150" gradientUnits="userSpaceOnUse">
                                <Stop offset="0" stopColor={colors.primary.accent} stopOpacity="0.1" />
                                <Stop offset="1" stopColor={colors.primary.accent} stopOpacity="0" />
                            </RadialGradient>
                        </Defs>
                        <Circle cx="200" cy="150" r="150" fill="url(#gradientCircle)" />
                        <Circle cx="200" cy="100" r="30" fill={colors.primary.main} />
                        <Path d="M200,130 L200,180" stroke={colors.primary.main} strokeWidth="8" strokeLinecap="round" />
                        <Path d="M160,180 C160,220 240,220 240,180" stroke={colors.primary.main} strokeWidth="8" fill="none" />
                        <Path d="M150,140 L250,140" stroke={colors.primary.main} strokeWidth="8" strokeLinecap="round" />
                        <Path d="M180,220 C150,240 150,260 180,270" stroke={colors.secondary.main} strokeWidth="2" fill="none" />
                        <Path d="M220,220 C250,240 250,260 220,270" stroke={colors.secondary.main} strokeWidth="2" fill="none" />
                        <Path d="M160,230 C130,230 130,260 160,260" stroke={colors.secondary.main} strokeWidth="2" fill="none" />
                        <Path d="M240,230 C270,230 270,260 240,260" stroke={colors.secondary.main} strokeWidth="2" fill="none" />
                        <Circle cx="200" cy="150" r="80" stroke={colors.primary.accent} strokeWidth="1" fill="none" />
                        <Circle cx="200" cy="150" r="100" stroke={colors.primary.accent} strokeWidth="1" fill="none" />
                        <Circle cx="200" cy="150" r="120" stroke={colors.primary.accent} strokeWidth="1" fill="none" />
                    </Svg>
                </View>
                <Text style={styles.emptyTitle}>No Services Found</Text>
                <Text style={styles.emptyDescription}>
                    We couldn't find any services at the moment. Please check back later or try adjusting your filters.
                </Text>
            </View>
        )
    }


    return (
        <SafeAreaView style={styles.container}>
            <PopupNotification
                type={notification.type}
                message={notification.message}
                visible={notification.visible}
                onClose={hideNotification}
                duration={4000}
            />
            <LinearGradient
                colors={[colors.neutral.white, colors.neutral.lighter]}
                style={styles.gradient}
            >
                <ScrollView
                    style={styles.content}
                    ref={mainScrollViewRef}
                    onScroll={handleMainScroll}
                    scrollEventThrottle={16}
                >
                    <View style={styles.servicesContainer}>
                        <ScrollView
                            ref={scrollViewRef}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                            style={styles.servicesScrollView}
                        >
                            {
                                allServices
                                    .filter(service => service.featured)
                                    .map((service) => (
                                        <View key={service.id} style={[styles.logoContainer, { width }]}>
                                            <Image
                                                source={{ uri: `${process.env.EXPO_PUBLIC_API_URL?.replace('/api/v1', '')}${service?.media[0]}` }}
                                                style={styles.featuredImage}
                                            />
                                            <LinearGradient
                                                colors={['transparent', 'rgba(1, 43, 43, 0.5)', 'rgba(1, 43, 43, 0.8)', 'rgba(1, 43, 43, 1)']}
                                                style={styles.serviceGradient}
                                            >
                                                <View style={styles.serviceContent}>
                                                    {/* <View style={styles.categoryTag}>

                                                        <BadgeComponent text={"Featured"} variant="warning" size="medium" rounded />
                                                    </View> */}
                                                    <Text style={styles.serviceTitle}>{service.name}</Text>
                                                    <View style={styles.reviewContainer}>
                                                        <Star size={16} color={"gold"} fill={"gold"} />
                                                        <Text style={styles.reviewText}>
                                                            {service.average_rating || '4.5'} ({service.total_reviews || '120'} reviews)
                                                        </Text>
                                                    </View>
                                                    {/* <Text style={styles.serviceDescription} numberOfLines={2}>
                                                        {service.description}
                                                    </Text> */}
                                                    <View style={styles.priceContainer}>
                                                        <Text style={styles.priceText}>₹{service.price || '999'}</Text>
                                                        <Text style={styles.priceUnit}>/service</Text>
                                                    </View>
                                                    <Button title={"Book Now"} textStyle={{ color: colors.primary.main }} style={styles.ctaButtonHeader} variant="primary" size="medium" onPress={() => router.push(`/service/${service.id}`)} />
                                                    <Text style={styles.featuredServiceText}><PinIcon size={20} color={"gold"} /></Text>

                                                </View>
                                            </LinearGradient>
                                        </View>
                                    ))
                            }
                        </ScrollView>
                        <View style={styles.paginationContainer}>
                            {allServices.filter(service => service.featured).map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.paginationDot,
                                        index === currentIndex && styles.paginationDotActive
                                    ]}
                                />
                            ))}
                        </View>
                    </View>

 {/* Category Filter */}
                    <View style={styles.categorySection}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                            <Pressable
                                style={[styles.categoryButton, !selectedCategory && styles.categoryButtonActive]}
                                onPress={() => setSelectedCategory(null)}
                            >
                                <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}>
                                    All
                                </Text>
                            </Pressable>
                            {categories.map((category) => (
                                <Pressable
                                    key={category}
                                    style={[
                                        styles.categoryButton,
                                        selectedCategory === category && styles.categoryButtonActive,
                                    ]}
                                    onPress={() => setSelectedCategory(category)}
                                >
                                    <Text
                                        style={[
                                            styles.categoryText,
                                            selectedCategory === category && styles.categoryTextActive,
                                        ]}
                                    >
                                        {category}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>


                    <View style={styles.videosContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Featured Videos</Text>
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.videoScrollView}
                        >
                            {videos.map((video) => (
                                <TouchableOpacity
                                    key={video.id}
                                    style={styles.videoCard}
                                    onPress={() => setSelectedVideo(video)}
                                >
                                    <Image
                                        source={video.thumbnail}
                                        style={styles.videoThumbnail}
                                    />

                                    <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}>
                                        <PlayIcon size={32} color={colors.neutral.lightest} />
                                    </View>
                                    <View style={styles.videoOverlay}>
                                        <Text style={styles.videoTitle}>{video.title}</Text>
                                        <Text style={styles.videoDuration}>{video.duration}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                   

                    {/* Services Listing */}
                    <View style={styles.servicesSection}>
                        <Text style={styles.sectionTitle}>{selectedCategory || 'All Services'}</Text>
                        {loading ? (
                            <Text style={styles.loadingText}>Loading services...</Text>
                        ) : error ? (
                            <Text style={styles.errorText}>{error}</Text>
                        ) : (
                            filteredServices.map((service) => (
                                <ServiceCard key={service.id} {...service} />
                            ))
                        )}
                    </View>
                </ScrollView>

                {showBackToTop && (
                    <TouchableOpacity
                        style={styles.backToTop}
                        onPress={scrollToTop}
                    >
                        <ArrowUp size={24} color={colors.neutral.white} />
                    </TouchableOpacity>
                )}
            </LinearGradient>

            <Modal
                visible={!!selectedVideo}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedVideo(null)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={() => setSelectedVideo(null)}
                    >
                        <Text style={{ color: colors.neutral.white, fontSize: 24 }}>×</Text>
                    </TouchableOpacity>
                    <View style={styles.modalContent}>
                        {selectedVideo && (
                            <Video
                                source={selectedVideo.videoUrl}
                                style={styles.modalVideo}
                                useNativeControls
                                resizeMode={ResizeMode.COVER}
                                isLooping
                                shouldPlay
                            />
                        )}
                        <Text style={[styles.videoTitle, { marginTop: spacing.md, textAlign: 'center' }]}>
                            {selectedVideo?.title}
                        </Text>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}