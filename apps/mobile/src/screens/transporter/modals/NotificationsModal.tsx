import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { apiFetch } from '../../../utils/api';

export interface MobileNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  read: boolean;
  createdAt: string;
  actionTab?: string;
}

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTab?: (tab: any) => void;
  onUnreadChange?: (count: number) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  onClose,
  onSelectTab,
  onUnreadChange,
}) => {
  const { t, language } = useLanguage();
  const { isDark, colors } = useTheme();

  const [notifications, setNotifications] = useState<MobileNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/notifications?role=TRANSPORTER');
      const data = await res.json();
      setLoading(false);

      if (res.ok && Array.isArray(data.data)) {
        setNotifications(data.data);
        if (onUnreadChange) {
          onUnreadChange(data.unreadCount || 0);
        }
      }
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchNotifications();
    }
  }, [visible]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      if (onUnreadChange) {
        const remaining = notifications.filter((n) => n.id !== id && !n.read).length;
        onUnreadChange(remaining);
      }
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await apiFetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'TRANSPORTER' }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      if (onUnreadChange) {
        onUnreadChange(0);
      }
    } catch (err) {}
  };

  const handleItemPress = (item: MobileNotification) => {
    if (!item.read) {
      handleMarkAsRead(item.id);
    }
    if (item.actionTab && onSelectTab) {
      let mappedTab: any = 'overview';
      if (item.actionTab === 'earnings') mappedTab = 'earnings';
      else if (item.actionTab === 'bidding' || item.actionTab === 'bids') mappedTab = 'bidding';
      else if (item.actionTab === 'fleet') mappedTab = 'fleet';
      else if (item.actionTab === 'loads' || item.actionTab === 'dispatches') mappedTab = 'loads';

      onSelectTab(mappedTab);
      onClose();
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getIconName = (type: string): any => {
    switch (type) {
      case 'VERIFICATION':
        return 'checkmark-circle';
      case 'BID':
        return 'hammer';
      case 'SHIPMENT':
        return 'cube';
      case 'PAYMENT':
        return 'card';
      case 'CUSTOMS':
        return 'shield-checkmark';
      case 'SECURITY':
        return 'warning';
      default:
        return 'notifications';
    }
  };

  const getIconColor = (type: string): string => {
    switch (type) {
      case 'VERIFICATION':
        return '#10B981';
      case 'BID':
        return '#0284C7';
      case 'SHIPMENT':
        return '#10B981';
      case 'PAYMENT':
        return '#F59E0B';
      case 'SECURITY':
        return '#EF4444';
      default:
        return '#38BDF8';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.modalCard, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF', borderColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
          
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[styles.headerIconBox, { backgroundColor: isDark ? '#1E293B' : '#E0F2FE' }]}>
                <Ionicons name="notifications" size={18} color="#0284C7" />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  {language === 'AM' ? 'ማሳወቂያዎች' : 'Notifications'}
                </Text>
                <Text style={[styles.headerSub, { color: colors.textMuted }]}>
                  {unreadCount > 0 ? `${unreadCount} ${language === 'AM' ? 'አዲስ ያልተነበቡ' : 'unread live alerts'}` : language === 'AM' ? 'ሁሉም ተነበዋል' : 'All caught up'}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
              <Ionicons name="close" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Quick Filter & Mark All Read */}
          <View style={[styles.filterBar, { borderBottomColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => setFilter('all')}
                style={[
                  styles.filterPill,
                  filter === 'all'
                    ? { backgroundColor: '#0284C7' }
                    : { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
                ]}
              >
                <Text style={[styles.filterPillText, { color: filter === 'all' ? '#FFFFFF' : colors.textMuted }]}>
                  {language === 'AM' ? 'ሁሉም' : 'All'} ({notifications.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFilter('unread')}
                style={[
                  styles.filterPill,
                  filter === 'unread'
                    ? { backgroundColor: '#0284C7' }
                    : { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
                ]}
              >
                <Text style={[styles.filterPillText, { color: filter === 'unread' ? '#FFFFFF' : colors.textMuted }]}>
                  {language === 'AM' ? 'ያልተነበቡ' : 'Unread'} {unreadCount > 0 ? `(${unreadCount})` : ''}
                </Text>
              </TouchableOpacity>
            </View>

            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllRead}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#0284C7' }}>
                  {language === 'AM' ? 'ሁሉንም አንብብ' : 'Mark all read'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Body */}
          {loading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#0284C7" />
            </View>
          ) : filtered.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center', gap: 8 }}>
              <Ionicons name="notifications-off-outline" size={36} color={colors.textMuted} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
                {language === 'AM' ? 'ምንም ማሳወቂያ የለም' : 'No notifications'}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>
                {language === 'AM'
                  ? 'አዳዲስ የጨረታ እና የጭነት ዝመናዎች እዚህ ይደርሳሉ።'
                  : 'Live updates on bids, dispatches, and telebirr payouts will appear here.'}
              </Text>
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {filtered.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleItemPress(item)}
                  style={[
                    styles.notifItem,
                    {
                      backgroundColor: item.read
                        ? 'transparent'
                        : isDark ? '#1E293B40' : '#F0F9FF',
                      borderBottomColor: isDark ? '#1E293B' : '#F1F5F9',
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={[styles.typeIconBox, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                    <Ionicons name={getIconName(item.type)} size={16} color={getIconColor(item.type)} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text
                        style={[
                          styles.notifTitle,
                          {
                            color: colors.text,
                            fontWeight: item.read ? '600' : '800',
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      {!item.read && <View style={styles.unreadDot} />}
                    </View>

                    <Text style={[styles.notifMessage, { color: colors.textMuted }]} numberOfLines={2}>
                      {item.message}
                    </Text>

                    {item.actionTab && (
                      <Text style={{ fontSize: 10, fontWeight: '800', color: '#0284C7', marginTop: 4 }}>
                        {language === 'AM' ? 'ይመልከቱ ➔' : 'Tap to view ➔'}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Footer */}
          <View style={[styles.modalFooter, { borderTopColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={styles.livePulseDot} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMuted }}>
                Live Corridor Stream Active
              </Text>
            </View>
            <TouchableOpacity onPress={fetchNotifications} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="refresh" size={15} color="#0284C7" />
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' } as any,
      default: { elevation: 10 },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  headerSub: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  typeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  notifTitle: {
    fontSize: 12,
    flex: 1,
    marginRight: 6,
  },
  notifMessage: {
    fontSize: 11,
    lineHeight: 15,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0284C7',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
});
