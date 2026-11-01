import { StyleSheet, Platform, StatusBar } from 'react-native';
import { useMemo } from 'react';
import { useTheme, ThemeColors, darkColors } from '../../context/ThemeContext';

export const getDriverStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.headerBg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    backgroundColor: colors.headerBg,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? Math.max((StatusBar.currentHeight || 0) + 14, 52) : 14,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 100,
  },
  brandTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
  },
  truckSub: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: '600',
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 7,
    gap: 2,
  },
  logoutText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  sosBanner: {
    backgroundColor: isDark ? '#1E293B' : '#FEF2F2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#334155' : '#FCA5A5',
  },
  sosBannerActive: {
    backgroundColor: '#DC2626',
    borderBottomColor: '#991B1B',
  },
  sosText: {
    color: isDark ? '#F87171' : '#DC2626',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  sosTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'android' ? 124 : 32,
  },
  sectionContainer: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 3,
  },
  kpiLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
  },
  kpiValue: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  statusBadge: {
    backgroundColor: isDark ? '#082F49' : '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accent,
  },
  routeBox: {
    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  routeCity: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  routeArrow: {
    fontSize: 11,
    color: colors.textMuted,
    paddingLeft: 18,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    gap: 8,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  emptySub: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  timeline: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 56,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
    marginRight: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: isDark ? '#475569' : '#CBD5E1',
    marginTop: 4,
  },
  dotCompleted: {
    backgroundColor: '#10B981',
  },
  dotActive: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 16,
  },
  wpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wpName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
  },
  wpStatus: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
  },
  statusCompletedText: {
    color: '#10B981',
  },
  statusActiveText: {
    color: colors.primary,
  },
  wpTime: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  coordsText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginVertical: 4,
  },
  checkinBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  checkinBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  successBox: {
    backgroundColor: isDark ? '#064E3B' : '#DCFCE7',
    borderWidth: 1,
    borderColor: isDark ? '#059669' : '#86EFAC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  successText: {
    color: isDark ? '#A7F3D0' : '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
  historyCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  historyId: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  historyCoords: {
    fontSize: 11,
    color: colors.textMuted,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: colors.text,
  },
  reportBtn: {
    backgroundColor: colors.danger,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  reportBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  signatureBox: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderStyle: 'dashed',
    borderRadius: 14,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureBoxSigned: {
    borderColor: '#10B981',
    backgroundColor: isDark ? '#064E3B' : '#F0FDF4',
    borderStyle: 'solid',
  },
  signatureText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  podBtn: {
    backgroundColor: colors.success,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  podBtnDisabled: {
    backgroundColor: isDark ? '#334155' : '#CBD5E1',
  },
  podBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  bottomNavContainer: {
    minHeight: Platform.OS === 'android' ? 96 : (Platform.OS === 'ios' ? 76 : 58),
    backgroundColor: colors.tabBarBg,
    borderTopWidth: 1,
    borderTopColor: colors.tabBarBorder,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingHorizontal: 2,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 46 : (Platform.OS === 'ios' ? 24 : 8),
    ...Platform.select({
      web: { boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.08)' } as any,
      default: { elevation: 6 },
    }),
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    flex: 1,
    paddingVertical: 2,
  },
  navIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 1,
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: '800',
  },
});

export const useDriverStyles = () => {
  const { colors, isDark } = useTheme();
  return useMemo(() => getDriverStyles(colors, isDark), [colors, isDark]);
};

// Backwards-compatible default instance
export const driverStyles = getDriverStyles(darkColors, true);
