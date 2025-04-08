import { useEffect, useState } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { usePrefersDarkMode } from './useMediaQuery';

type ThemeType = 'light' | 'dark' | 'system';
type ThemeSettingsType = {
  primaryColor: string;
  customColors?: Record<string, string>;
  darkMode?: boolean;
  systemPreference?: boolean;
  tenant?: string;
};

/**
 * Enhanced theme hook that combines next-themes with custom theme handling
 */
export function useTheme() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useNextTheme();
  const prefersDarkMode = usePrefersDarkMode();
  const [themeSettings, setThemeSettings] = useState<ThemeSettingsType>({
    primaryColor: '#2563eb', // Default primary color (blue-600)
  });
  const [isReady, setIsReady] = useState(false);

  // Determine if dark mode is active
  const isDarkMode = resolvedTheme === 'dark';
  
  // Get effective theme considering system preference
  const effectiveTheme = resolvedTheme || (prefersDarkMode ? 'dark' : 'light');

  // Apply CSS variables for the current theme
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Wait for theme to be available
    if (!isReady && !resolvedTheme) return;
    setIsReady(true);

    const root = document.documentElement;
    
    // Helper function to apply color to CSS variables
    const applyColorVariables = (color: string, prefix: string) => {
      // Convert hex to HSL for better manipulation
      let r = 0, g = 0, b = 0;
      
      // Parse hex color
      if (color.startsWith('#')) {
        const hex = color.slice(1);
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      } 
      // Parse rgb/rgba color
      else if (color.startsWith('rgb')) {
        const rgb = color.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
          r = parseInt(rgb[0], 10);
          g = parseInt(rgb[1], 10);
          b = parseInt(rgb[2], 10);
        }
      }
      
      r /= 255;
      g /= 255;
      b /= 255;
      
      // Calculate HSL
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        
        h /= 6;
      }
      
      // Convert to degrees
      h = Math.round(h * 360);
      s = Math.round(s * 100);
      l = Math.round(l * 100);
      
      // Apply HSL values to CSS variables
      root.style.setProperty(`--color-${prefix}-hue`, h.toString());
      root.style.setProperty(`--color-${prefix}-saturation`, `${s}%`);
      
      // Create the spectrum of shades
      const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
      shades.forEach(shade => {
        // Adjust lightness based on shade
        let shadeLightness = l;
        
        // Map shade to lightness (simplified approach)
        if (shade <= 50) shadeLightness = 97;
        else if (shade <= 100) shadeLightness = 94;
        else if (shade <= 200) shadeLightness = 88;
        else if (shade <= 300) shadeLightness = 75;
        else if (shade <= 400) shadeLightness = 60;
        else if (shade <= 500) shadeLightness = 50;
        else if (shade <= 600) shadeLightness = 40;
        else if (shade <= 700) shadeLightness = 30;
        else if (shade <= 800) shadeLightness = 20;
        else if (shade <= 900) shadeLightness = 15;
        else shadeLightness = 10;
        
        // Create HSL color
        const hslColor = `hsl(var(--color-${prefix}-hue), var(--color-${prefix}-saturation), ${shadeLightness}%)`;
        
        // Set the CSS variable
        root.style.setProperty(`--color-${prefix}-${shade}`, hslColor);
      });
    };
    
    // Apply primary color
    applyColorVariables(themeSettings.primaryColor, 'primary');
    
    // Apply secondary color if provided
    const secondaryColor = themeSettings.customColors?.secondary || '#475569'; // Default to slate-600
    applyColorVariables(secondaryColor, 'secondary');
    
    // Apply custom colors if provided
    if (themeSettings.customColors) {
      Object.entries(themeSettings.customColors).forEach(([name, color]) => {
        if (name !== 'primary' && name !== 'secondary') {
          applyColorVariables(color, name);
        }
      });
    }
    
    // Apply dark mode preference
    if (themeSettings.darkMode !== undefined) {
      setTheme(themeSettings.darkMode ? 'dark' : 'light');
    } else if (themeSettings.systemPreference) {
      setTheme('system');
    }
    
  }, [themeSettings, resolvedTheme, setTheme, isReady]);

  /**
   * Update theme settings
   */
  const updateThemeSettings = (settings: Partial<ThemeSettingsType>) => {
    setThemeSettings(prev => ({
      ...prev,
      ...settings,
    }));
  };

  /**
   * Set theme (light, dark, system)
   */
  const setThemePreference = (newTheme: ThemeType) => {
    setTheme(newTheme);
    
    // Update settings accordingly
    setThemeSettings(prev => ({
      ...prev,
      darkMode: newTheme === 'dark' ? true : newTheme === 'light' ? false : undefined,
      systemPreference: newTheme === 'system',
    }));
  };

  /**
   * Toggle dark/light mode
   */
  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setThemePreference(newTheme);
  };

  /**
   * Set primary color
   */
  const setPrimaryColor = (color: string) => {
    updateThemeSettings({ primaryColor: color });
  };

  /**
   * Set custom color
   */
  const setCustomColor = (name: string, color: string) => {
    updateThemeSettings({
      customColors: {
        ...themeSettings.customColors,
        [name]: color,
      },
    });
  };

  /**
   * Load tenant theme
   */
  const loadTenantTheme = async (tenantId: string) => {
    try {
      // Fetch tenant theme from API
      const response = await fetch(`/api/tenants/${tenantId}/theme`);
      if (!response.ok) throw new Error('Failed to fetch tenant theme');
      
      const tenantTheme = await response.json();
      
      updateThemeSettings({
        primaryColor: tenantTheme.primaryColor || themeSettings.primaryColor,
        customColors: tenantTheme.customColors || themeSettings.customColors,
        darkMode: tenantTheme.darkMode,
        tenant: tenantId,
      });
    } catch (error) {
      console.error('Failed to load tenant theme:', error);
    }
  };

  return {
    theme,
    resolvedTheme,
    effectiveTheme,
    isDarkMode,
    isLightMode: !isDarkMode,
    systemTheme,
    themeSettings,
    setTheme: setThemePreference,
    toggleTheme,
    setPrimaryColor,
    setCustomColor,
    updateThemeSettings,
    loadTenantTheme,
    isReady,
  };
}

export default useTheme;
