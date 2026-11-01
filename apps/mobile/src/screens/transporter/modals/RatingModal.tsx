import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BidItem, UserProfile } from '../types';
import { useTheme, ThemeColors } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { apiFetch } from '../../../utils/api';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  selectedBid: BidItem | null;
  currentUser?: UserProfile;
  onRatingSubmitted?: () => void;
}

const SHIPPER_TAGS = [
  'Prompt Payment',
  'Accurate Cargo Specs',
  'Quick Loading at Hub',
  'Clear Waybills',
  'Professional Partner',
];

const DRIVER_TAGS = [
  'Safe Driving',
  'Punctual Arrival',
  'Cargo Intact',
  'Eco-Friendly Fuel Use',
  'Great Communication',
];

export const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
  selectedBid,
  currentUser,
  onRatingSubmitted,
}) => {
  const isWeb = Platform.OS === 'web';
  const { colors, isDark } = useTheme();
  const { t, language } = useLanguage();
  const styles = useMemo(() => getRatingModalStyles(colors, isDark), [colors, isDark]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  const [targetRole, setTargetRole] = useState<'SHIPPER' | 'DRIVER'>('SHIPPER');
  const [stars, setStars] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isShipperAlreadyRated = Boolean(selectedBid?.hasRatedShipper);
  const isDriverAlreadyRated = Boolean(selectedBid?.hasRatedDriver);
  const isCurrentTargetRated = targetRole === 'SHIPPER' ? isShipperAlreadyRated : isDriverAlreadyRated;
  const currentTargetScore = targetRole === 'SHIPPER' ? selectedBid?.shipperRatingScore : selectedBid?.driverRatingScore;

  useEffect(() => {
    if (visible) {
      if (selectedBid?.hasRatedShipper && !selectedBid?.hasRatedDriver) {
        setTargetRole('DRIVER');
      } else {
        setTargetRole('SHIPPER');
      }
      setStars(5);
      setComment('');
      setSelectedTags([]);
      setIsSubmitting(false);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: !isWeb,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 45,
          useNativeDriver: !isWeb,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.92);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: !isWeb,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.94,
        duration: 160,
        useNativeDriver: !isWeb,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBid) return;

    if (isCurrentTargetRated) {
      Alert.alert(
        'Rating Already Recorded',
        'A rating for this partner on this consignment has already been submitted. Corridor ratings are immutable audit records and cannot be repeated or modified.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const combinedReview = [
        selectedTags.length > 0 ? `[Highlights: ${selectedTags.join(', ')}]` : '',
        comment.trim(),
      ]
        .filter(Boolean)
        .join(' ') || (targetRole === 'SHIPPER'
          ? 'Completed trip delivery with verified digital e-POD handover.'
          : 'Professional driving and safe cargo transport along corridor.');

      const targetUserId = targetRole === 'SHIPPER'
        ? (selectedBid.shipperId || undefined)
        : (selectedBid.driverUserId || undefined);

      const bodyData = {
        fromUserId: currentUser?.id,
        toUserId: targetUserId,
        targetRole,
        shipmentId: selectedBid.shipmentId || selectedBid.rawLoadId,
        loadId: selectedBid.rawLoadId,
        scoreStars: stars,
        reviewText: combinedReview,
      };

      const res = await apiFetch('/api/portal/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const resData = await res.json().catch(() => ({}));

      if (!res.ok) {
        Alert.alert('Rating Submission', resData.error || 'Could not submit rating. Please try again.');
        return;
      }

      const partnerTitle = targetRole === 'SHIPPER'
        ? (selectedBid.shipperCompany || selectedBid.shipperName || 'the shipper')
        : (selectedBid.dispatchedDriver || 'the driver');

      Alert.alert(
        'Verified Rating Recorded',
        `Thank you! Your official ${stars}-star rating for ${partnerTitle} has been saved permanently to the corridor audit ledger.`
      );

      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
      handleClose();
    } catch (e: any) {
      console.warn('Error submitting rating:', e);
      Alert.alert('Network Error', 'Could not reach server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStarLabel = (s: number) => {
    switch (s) {
      case 5:
        return '5 Stars • Excellent Partner';
      case 4:
        return '4 Stars • Very Good';
      case 3:
        return '3 Stars • Satisfactory';
      case 2:
        return '2 Stars • Needs Improvement';
      case 1:
        return '1 Star • Poor Experience';
      default:
        return '';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlayContainer}>
        {/* Backdrop */}
        <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose}>
          <Animated.View style={[styles.backdropDimmer, { opacity: fadeAnim }]} />
        </Pressable>

        {/* Centered Modal Card */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerIconBadge}>
              <Ionicons name="star" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {targetRole === 'SHIPPER' ? 'Rate Shipper Partner' : 'Rate Fleet Driver'}
              </Text>
              <Text style={styles.headerSubTitle} numberOfLines={1}>
                {selectedBid?.loadId} • Post-Delivery Mutual Review
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Delivery Success Banner */}
            <View style={styles.deliveredCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="shield-checkmark" size={16} color="#16A34A" />
                <Text style={styles.deliveredTag}>CONSIGNMENT DELIVERED</Text>
              </View>
              <Text style={styles.partnerName}>
                {selectedBid?.shipperCompany || selectedBid?.shipperName || 'Verified Corridor Consignment'}
              </Text>
              <Text style={styles.routeText}>{selectedBid?.route}</Text>
            </View>

            {/* Recipient Segmented Selector: Rate Shipper vs Rate Driver */}
            <View style={{ gap: 6 }}>
              <Text style={styles.sectionHeading}>Who are you rating?</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: targetRole === 'SHIPPER' ? '#0284C7' : '#E2E8F0',
                    backgroundColor: targetRole === 'SHIPPER' ? '#F0F9FF' : '#FFFFFF',
                    alignItems: 'center',
                    gap: 3,
                  }}
                  onPress={() => setTargetRole('SHIPPER')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="business"
                    size={18}
                    color={targetRole === 'SHIPPER' ? '#0284C7' : '#64748B'}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '800',
                      color: targetRole === 'SHIPPER' ? '#0369A1' : '#475569',
                    }}
                  >
                    Shipper
                  </Text>
                  <Text style={{ fontSize: 10, color: '#94A3B8' }} numberOfLines={1}>
                    {selectedBid?.shipperCompany || selectedBid?.shipperName || 'Cargo Owner'}
                  </Text>
                  {isShipperAlreadyRated && (
                    <View style={{ marginTop: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: '#DCFCE7' }}>
                      <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#15803D' }}>
                        Rated ★ {selectedBid?.shipperRatingScore || '5.0'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {Boolean(selectedBid?.dispatchedDriver) && (
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: targetRole === 'DRIVER' ? '#0284C7' : '#E2E8F0',
                      backgroundColor: targetRole === 'DRIVER' ? '#F0F9FF' : '#FFFFFF',
                      alignItems: 'center',
                      gap: 3,
                    }}
                    onPress={() => setTargetRole('DRIVER')}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="person"
                      size={18}
                      color={targetRole === 'DRIVER' ? '#0284C7' : '#64748B'}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '800',
                        color: targetRole === 'DRIVER' ? '#0369A1' : '#475569',
                      }}
                    >
                      Driver
                    </Text>
                    <Text style={{ fontSize: 10, color: '#94A3B8' }} numberOfLines={1}>
                      {selectedBid?.dispatchedDriver}
                    </Text>
                    {isDriverAlreadyRated && (
                      <View style={{ marginTop: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: '#DCFCE7' }}>
                        <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#15803D' }}>
                          Rated ★ {selectedBid?.driverRatingScore || '5.0'}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* If Already Rated: Show Immutable Locked Banner */}
            {isCurrentTargetRated ? (
              <View
                style={{
                  backgroundColor: '#ECFDF5',
                  borderColor: '#A7F3D0',
                  borderWidth: 1.5,
                  borderRadius: 16,
                  padding: 16,
                  alignItems: 'center',
                  gap: 8,
                  marginVertical: 4,
                }}
              >
                <Ionicons name="lock-closed" size={24} color="#059669" />
                <Text style={{ fontSize: 14, fontWeight: '900', color: '#065F46' }}>
                  {targetRole === 'SHIPPER' ? 'Shipper' : 'Driver'} Rating Recorded ({currentTargetScore ? `${currentTargetScore}.0 Stars` : 'Submitted'})
                </Text>
                <Text style={{ fontSize: 11.5, color: '#047857', textAlign: 'center', lineHeight: 16 }}>
                  This verified post-trip rating is permanently sealed in the corridor ledger. It cannot be edited or resubmitted to ensure marketplace integrity and trust score consistency.
                </Text>
              </View>
            ) : (
              <>
                {/* Star Rating Section */}
                <View style={styles.sectionBox}>
                  <Text style={styles.sectionHeading}>
                    Rate {targetRole === 'SHIPPER' ? 'Shipper Experience' : 'Driver Performance'} *
                  </Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <TouchableOpacity
                        key={s}
                        activeOpacity={0.7}
                        onPress={() => setStars(s)}
                        style={styles.starTouch}
                      >
                        <Ionicons
                          name={s <= stars ? 'star' : 'star-outline'}
                          size={32}
                          color={s <= stars ? '#F59E0B' : '#CBD5E1'}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.starLabelText}>{getStarLabel(stars)}</Text>
                </View>

                {/* Quick Feedback Tags */}
                <View style={styles.sectionBox}>
                  <Text style={styles.sectionHeading}>Performance Highlights</Text>
                  <View style={styles.tagsWrapper}>
                    {(targetRole === 'SHIPPER' ? SHIPPER_TAGS : DRIVER_TAGS).map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <TouchableOpacity
                          key={tag}
                          activeOpacity={0.7}
                          onPress={() => toggleTag(tag)}
                          style={[styles.tagPill, isSelected && styles.tagPillSelected]}
                        >
                          <Ionicons
                            name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                            size={14}
                            color={isSelected ? '#0284C7' : '#64748B'}
                          />
                          <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                            {tag}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Written Review */}
                <View style={styles.sectionBox}>
                  <Text style={styles.sectionHeading}>Delivery Feedback & Comments (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={
                      targetRole === 'SHIPPER'
                        ? 'Share details about waybill readiness, loading speed, and communication...'
                        : 'Share details about route safety, cargo condition, and driving professionalism...'
                    }
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={3}
                    value={comment}
                    onChangeText={setComment}
                  />
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer Submit */}
          <View style={styles.footerContainer}>
            {!isCurrentTargetRated && (
              <TouchableOpacity
                style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-circle" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.submitBtnText}>
                  {isSubmitting ? 'Recording on Ledger...' : `Submit ${stars}-Star Rating`}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={isCurrentTargetRated ? styles.submitBtn : styles.cancelBtn}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={isCurrentTargetRated ? styles.submitBtnText : styles.cancelBtnText}>
                {isCurrentTargetRated ? 'Close' : 'Maybe Later'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export const getRatingModalStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  backdropDimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 24,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  headerIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
  },
  headerSubTitle: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
  },
  deliveredCard: {
    backgroundColor: isDark ? '#064E3B' : '#F0FDF4',
    borderWidth: 1,
    borderColor: isDark ? '#059669' : '#BBF7D0',
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  deliveredTag: {
    fontSize: 10,
    fontWeight: '800',
    color: isDark ? '#6EE7B7' : '#16A34A',
    letterSpacing: 0.5,
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
  },
  routeText: {
    fontSize: 11.5,
    color: colors.textMuted,
  },
  sectionBox: {
    gap: 8,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  starTouch: {
    padding: 4,
  },
  starLabelText: {
    textAlign: 'center',
    fontSize: 12.5,
    fontWeight: '800',
    color: '#D97706',
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tagPillSelected: {
    backgroundColor: isDark ? '#0C4A6E' : '#E0F2FE',
    borderColor: isDark ? '#0284C7' : '#7DD3FC',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  tagTextSelected: {
    color: isDark ? '#38BDF8' : '#0369A1',
  },
  textInput: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    padding: 12,
    fontSize: 12,
    color: colors.text,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    gap: 8,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
});
