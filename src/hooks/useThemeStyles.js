import { useTheme } from '../context/ThemeContext'

/**
 * Returns theme-aware style tokens.
 * Use these instead of hardcoded rgba(22,27,34) values in components.
 */
export function useThemeStyles() {
  const { isDark } = useTheme()

  return {
    isDark,

    // Backgrounds
    bgBase:      isDark ? '#0D1117'                    : '#F0F2F5',
    bgCard:      isDark ? 'rgba(22,27,34,0.8)'         : 'rgba(255,255,255,0.95)',
    bgCardDeep:  isDark ? 'rgba(13,17,23,0.6)'         : 'rgba(246,248,250,0.95)',
    bgCardHover: isDark ? 'rgba(33,38,45,0.9)'         : '#FFFFFF',
    bgInput:     isDark ? 'rgba(13,17,23,0.8)'         : '#FFFFFF',
    bgSubtle:    isDark ? 'rgba(255,255,255,0.02)'     : 'rgba(0,0,0,0.02)',
    bgHighlight: isDark ? 'rgba(88,166,255,0.06)'      : 'rgba(88,166,255,0.06)',

    // Borders
    border:       isDark ? '#21262D'  : '#D0D7DE',
    borderLight:  isDark ? '#30363D'  : '#C6CDD4',
    borderSubtle: isDark ? '#1C2128'  : '#E8EBEE',

    // Text
    textPrimary: isDark ? '#E6EDF3' : '#1F2328',
    textMuted:   isDark ? '#8B949E' : '#57606A',
    textFaint:   isDark ? '#484F58' : '#8C959F',
    textBody:    isDark ? '#C9D1D9' : '#374151',

    // Dividers
    divider: isDark ? '1px solid #21262D' : '1px solid #D0D7DE',
  }
}
