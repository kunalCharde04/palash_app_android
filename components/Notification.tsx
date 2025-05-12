import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react-native';

const PopupNotification = ({ 
  type = 'info', 
  message = 'This is a notification', 
  duration = 3000, 
  onClose = () => {},
  visible = false 
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  
  const notificationColors = {
    success: '#4CAF50',
    error: '#F44336',
    info: '#2196F3',
    warning: '#FF9800'
  };

  const notificationIcons = {
    success: <CheckCircle size={24} color="#fff" />,
    error: <AlertCircle size={24} color="#fff" />,
    info: <Info size={24} color="#fff" />,
    warning: <AlertTriangle size={24} color="#fff" />
  };

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();

      // Auto-dismiss after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClose = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (onClose) {
        onClose();
      }
    });
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          transform: [{ translateY }],
          opacity,
          backgroundColor: notificationColors[type as keyof typeof notificationColors] || notificationColors.info,
        }
      ]}
    >
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          {notificationIcons[type as keyof typeof notificationIcons] || notificationIcons.info}
        </View>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    marginRight: 12,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  closeButton: {
    marginLeft: 10,
  }
});

export default PopupNotification;