import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/theme-provider';
import { ArrowRight, Badge, Star, User } from 'lucide-react-native';
import { Badge as BadgeComponent } from '@/components/Badge';

export interface ServiceCardProps {
  // Basic info
  id: string;
  name: string;
  description: string[]; // Array of description points
  shortDescription?: string; // Brief summary for cards/listings
  average_rating?: number;
  total_reviews?: number;
  
  // Media
  media: string[]; 
  
  // Categorization
  category: string; // Main category (e.g., "Yoga", "Meditation", "Breathing")
  tags?: string[]; // Additional tags for searchability
  
  // Pricing
  price: string; // Base price
  currency?: string; // USD, EUR, etc.
  discountPrice?: string; // Optional sale price
  
  // Scheduling
  duration: number; // Length in minutes
  
  // Instructor/provider info
  instructorId?: string;
  instructorName?: string;
  instructorBio?: string;
  
  cancellationPolicy?: string;
  
  // Flags
  featured: boolean;
  isActive: boolean;
  isOnline: boolean; // Virtual vs in-person
  isRecurring?: boolean; // One-time vs recurring
  
  // Location (for in-person services)
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Virtual meeting details (for online services)
  virtualMeetingDetails?: {
    platform: string; // Zoom, Google Meet, etc.
    joinLink?: string;
    password?: string;
  };
  
  // Administrative
  created_at?: Date;
  updated_at?: Date;
}


export const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
 name,
 description,
 category,
 average_rating,
 total_reviews,
 price,
 media,
 tags,
 instructorName,
 instructorBio,
 instructorId,
 cancellationPolicy,
 currency = 'INR',
 featured,
 isActive,
 isOnline,
 isRecurring,
 location,
}) => {
  const router = useRouter();
  const { colors, spacing, borderRadius } = useTheme();

  const handlePress = () => {
    router.push({
      pathname: "/(main)/service/[id]",
      params: { id }
    });
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.neutral.lightest,
      borderRadius: borderRadius.primary,
      overflow: 'hidden',
      marginBottom: spacing.lg,
      elevation: 2,
      shadowColor: colors.neutral.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: colors.neutral.light,
    },
    image: {
      width: '100%',
      height: 200,
      resizeMode: 'cover',
    },
    content: {
      padding: spacing.md,
    },
    category: {
      position: 'absolute',
      top: spacing.md,
      right: spacing.md,
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.input,
    },
    categoryText: {
      color: colors.neutral.lightest,
      fontSize: 12,
      fontWeight: '600',
    },
    name: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    price: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rating: {
      flexDirection: 'row',
      marginRight: spacing.xs,
      alignItems: 'center',
    },
    arrow: {
      backgroundColor: colors.primary.main,
      padding: spacing.xs,
      borderRadius: borderRadius.full,
    },
    ratingText: {
      color: 'gray',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: spacing.xs,
      marginRight: spacing.sm,
    },
    description: {
      color: colors.text.secondary,
      fontSize: 14,
      marginBottom: spacing.md,
    },
    tags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: spacing.md,
    },
    tag: {
      backgroundColor: colors.neutral.lightest,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.input,
      marginRight: spacing.xs,
    },
    instructorName: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    instructorNameText: {
      fontSize: 12,
      fontWeight: '400',
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
  });

  const renderCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€'; 
      case 'INR':
        return '₹';
      case 'GBP':
        return '£';
      case 'AUD':
        return 'A$';
      case 'CAD':
        return 'C$';  
      case 'NZD':
        return 'NZ$';
      case 'SGD':
        return 'S$';
      case 'HKD':
        return 'HK$';
      case 'JPY':
        return '¥';
      case 'CHF':
        return 'CHF';
      case 'RUB':
        return '₽';
      default:
        return currency;
    }
  };
  

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <Image source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/api/v1${media[0]}` }} style={styles.image} />
      <View style={styles.category}>
        <Text style={styles.categoryText}>{category}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.instructorName}><User size={12} color={colors.text.primary} /> <Text style={styles.instructorNameText}>{instructorName}</Text> </Text>
        {
          tags && tags.length > 0 && (
            <View style={styles.tags}>
              {tags.map((tag, index) => (
                <BadgeComponent key={index} text={tag} variant="secondary" size="small" rounded />
              ))}
            </View>
          )
        }
        <Text style={styles.description}>
          {description.length > 0 
            ? (description.join(' ').length > 100 
                ? description.join(' ').slice(0, 100) + '...' 
                : description.join(' '))
            : 'No description available'
          }
        </Text>   
        <View style={styles.priceRow}>
          <Text style={styles.price}>{renderCurrencySymbol(currency)} {parseFloat(price).toFixed(2)}</Text>
          <View style={styles.ratingContainer}>
            {
              average_rating && total_reviews ? (
                <View style={styles.rating}>
                  {[...Array(average_rating)].map((_, i) => (
                    <Star key={i} size={14} fill={colors.feedback.warning.main} color={colors.feedback.warning.main} />
                  ))}
                  <Text style={styles.ratingText}>{total_reviews}+</Text>
                </View>
              ) : (
                <View style={styles.rating}>
                  <Text style={styles.ratingText}>No reviews yet</Text>
                </View>
              )
            }
            <View style={styles.arrow}>
              <ArrowRight size={16} color={colors.neutral.lightest} />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}; 