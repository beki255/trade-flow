import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage, Language } from '../context/LanguageContext';

interface LanguageSwitcherProps {
  dark?: boolean;
  variant?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ dark = false, variant }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<View>(null);

  const isDark = dark || variant === 'dark';

  const languages: { code: Language; label: string; subLabel: string; flag: string }[] = [
    { code: 'EN', label: 'English', subLabel: 'English', flag: '🇬🇧' },
    { code: 'AM', label: 'አማርኛ', subLabel: 'Amharic', flag: '🇪🇹' },
    { code: 'OM', label: 'Afaan Oromoo', subLabel: 'Oromoo', flag: '🌳' },
  ];

  const current = languages.find((l) => l.code === language) || languages[0];

  // Outside click listener for Web
  useEffect(() => {
    if (Platform.OS === 'web' && isOpen) {
      const handleGlobalClick = (e: MouseEvent | TouchEvent) => {
        const target = e.target as Node;
        const currentRef = containerRef.current as any;
        const domNode = currentRef?.nodeType ? currentRef : (currentRef?.current || currentRef);
        if (domNode && typeof domNode.contains === 'function') {
          if (!domNode.contains(target)) {
            setIsOpen(false);
          }
        } else {
          setIsOpen(false);
        }
      };

      const timer = setTimeout(() => {
        document.addEventListener('click', handleGlobalClick);
        document.addEventListener('touchstart', handleGlobalClick);
      }, 10);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleGlobalClick);
        document.removeEventListener('touchstart', handleGlobalClick);
      };
    }
  }, [isOpen]);

  return (
    <View
      ref={containerRef}
      style={[styles.container, { zIndex: isOpen ? 99999 : 10 }]}
      collapsable={false}
    >
      <TouchableOpacity
        onPress={() => setIsOpen((prev) => !prev)}
        activeOpacity={0.7}
        style={[styles.triggerBtn, isDark ? styles.triggerDark : styles.triggerLight]}
        accessibilityRole="button"
        accessibilityLabel="Select language"
      >
        <Ionicons
          name="globe-outline"
          size={14}
          color={isDark ? '#38BDF8' : '#0284C7'}
          style={{ marginRight: 4 }}
        />
        <Text style={[styles.triggerText, isDark ? styles.textDark : styles.textLight]}>
          {current.code === 'OM' ? 'ORO' : current.code === 'AM' ? 'አማ' : 'EN'}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={12}
          color={isDark ? '#94A3B8' : '#64748B'}
          style={{ marginLeft: 3 }}
        />
      </TouchableOpacity>

      {isOpen && (
        <>
          {/* Transparent full-screen overlay for native touch dismiss */}
          {Platform.OS !== 'web' && (
            <Pressable
              style={styles.nativeBackdrop}
              onPress={() => setIsOpen(false)}
            />
          )}

          {/* Dropdown Menu anchored right below the button */}
          <View
            style={[
              styles.dropdownCard,
              isDark ? styles.dropdownCardDark : styles.dropdownCardLight,
            ]}
          >
            <View style={{ paddingHorizontal: 10, paddingTop: 4, paddingBottom: 6 }}>
              <Text style={[styles.menuTitle, isDark ? styles.menuTitleDark : styles.menuTitleLight]}>
                LANGUAGE / ቋንቋ
              </Text>
            </View>

            <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />

            <View style={{ gap: 4 }}>
              {languages.map((item) => {
                const isSelected = language === item.code;
                return (
                  <TouchableOpacity
                    key={item.code}
                    onPress={() => {
                      setLanguage(item.code);
                      setIsOpen(false);
                    }}
                    activeOpacity={0.7}
                    style={[
                      styles.langOption,
                      isSelected && (isDark ? styles.langOptionSelectedDark : styles.langOptionSelectedLight),
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 28, height: 20, borderRadius: 5, backgroundColor: isDark ? '#1E293B' : '#E0F2FE', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: isDark ? '#38BDF8' : '#0284C7' }}>{item.code}</Text>
                      </View>
                      <View>
                        <Text
                          style={[
                            styles.langLabel,
                            isDark ? styles.labelDark : styles.labelLight,
                            isSelected && (isDark ? styles.labelActiveDark : styles.labelActiveLight),
                          ]}
                        >
                          {item.label}
                        </Text>
                        <Text style={[styles.langSubLabel, isDark ? styles.subLabelDark : styles.subLabelLight]}>
                          {item.subLabel}
                        </Text>
                      </View>
                    </View>

                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  triggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  triggerLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  triggerDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  triggerText: {
    fontSize: 11,
    fontWeight: '800',
  },
  textLight: {
    color: '#0F172A',
  },
  textDark: {
    color: '#F8FAFC',
  },
  nativeBackdrop: {
    position: 'absolute',
    top: -Dimensions.get('window').height,
    left: -Dimensions.get('window').width,
    width: Dimensions.get('window').width * 2,
    height: Dimensions.get('window').height * 2,
    zIndex: 99998,
    backgroundColor: 'transparent',
  },
  dropdownCard: {
    position: 'absolute',
    top: '100%',
    marginTop: 6,
    right: 0,
    width: 175,
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    zIndex: 99999,
    elevation: 25,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.15)',
      } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
      },
    }),
  },
  dropdownCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  dropdownCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  menuTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuTitleLight: {
    color: '#94A3B8',
  },
  menuTitleDark: {
    color: '#64748B',
  },
  divider: {
    height: 1,
    marginBottom: 6,
  },
  dividerLight: {
    backgroundColor: '#F1F5F9',
  },
  dividerDark: {
    backgroundColor: '#334155',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  langOptionSelectedLight: {
    backgroundColor: '#F0F9FF',
  },
  langOptionSelectedDark: {
    backgroundColor: '#0F172A',
  },
  langLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  labelLight: {
    color: '#1E293B',
  },
  labelDark: {
    color: '#F1F5F9',
  },
  labelActiveLight: {
    color: '#0284C7',
  },
  labelActiveDark: {
    color: '#38BDF8',
  },
  langSubLabel: {
    fontSize: 9.5,
    marginTop: 1,
  },
  subLabelLight: {
    color: '#64748B',
  },
  subLabelDark: {
    color: '#94A3B8',
  },
});
