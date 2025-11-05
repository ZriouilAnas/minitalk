// Ultra Modern Design System - Ocean Palette
export const colors = {
  // Federal Blue - Deep ocean depth
  federal_blue: {
    DEFAULT: '#03045e',
    50: '#f0f0ff',
    100: '#e0e1ff', 
    200: '#c4c6ff',
    300: '#9ea1ff',
    400: '#7175ff',
    500: '#4549ff',
    600: '#2d2fff',
    700: '#1b1ee3',
    800: '#1519b6',
    900: '#181a8f',
    950: '#03045e'
  },
  
  // Honolulu Blue - Professional trust
  honolulu_blue: {
    DEFAULT: '#0077b6',
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bee8ff',
    300: '#7cd1ff',
    400: '#3bbaff',
    500: '#00a2f9',
    600: '#0077b6',
    700: '#005f93',
    800: '#00486e',
    900: '#003049',
    950: '#001825'
  },
  
  // Pacific Cyan - Electric energy
  pacific_cyan: {
    DEFAULT: '#00b4d8',
    50: '#f0fdff',
    100: '#c4f5ff',
    200: '#89ebff',
    300: '#4ee1ff',
    400: '#12d8ff',
    500: '#00b4d8',
    600: '#008fab',
    700: '#006b81',
    800: '#004756',
    900: '#00242b',
    950: '#001419'
  },
  
  // Non Photo Blue - Gentle flow
  non_photo_blue: {
    DEFAULT: '#90e0ef',
    50: '#f0feff',
    100: '#e9f9fc',
    200: '#d2f3f9',
    300: '#bcedf5',
    400: '#a6e7f2',
    500: '#90e0ef',
    600: '#4ccfe6',
    700: '#1dafc9',
    800: '#137586',
    900: '#0a3a43',
    950: '#062529'
  },
  
  // Light Cyan - Ethereal lightness
  light_cyan: {
    DEFAULT: '#caf0f8',
    50: '#fdffff',
    100: '#f4fcfe',
    200: '#e9f9fc',
    300: '#dff6fb',
    400: '#d4f3f9',
    500: '#caf0f8',
    600: '#79daee',
    700: '#2ac4e3',
    800: '#15889f',
    900: '#0a444f',
    950: '#062c33'
  }
};

// Gradient combinations for ultra-modern effects
export const gradients = {
  ocean: 'linear-gradient(135deg, #03045e 0%, #0077b6 50%, #00b4d8 100%)',
  wave: 'linear-gradient(45deg, #00b4d8 0%, #90e0ef 50%, #caf0f8 100%)',
  depth: 'linear-gradient(180deg, #03045e 0%, #0077b6 100%)',
  flow: 'linear-gradient(90deg, #90e0ef 0%, #caf0f8 100%)',
  energy: 'linear-gradient(135deg, #0077b6 0%, #00b4d8 50%, #90e0ef 100%)',
  ethereal: 'linear-gradient(45deg, #caf0f8 0%, #90e0ef 50%, #00b4d8 100%)'
};

// Animation configurations
export const animations = {
  // Smooth transitions
  transition: {
    fast: '150ms ease-out',
    normal: '250ms ease-out',
    slow: '350ms ease-out',
    smooth: '400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  },
  
  // Bounce effects
  bounce: {
    light: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    medium: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    strong: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'
  },
  
  // Spring animations
  spring: {
    gentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    energetic: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  }
};

// Shadow system for depth
export const shadows = {
  glow: {
    blue: '0 0 20px rgba(0, 119, 182, 0.3)',
    cyan: '0 0 20px rgba(0, 180, 216, 0.3)',
    light: '0 0 15px rgba(202, 240, 248, 0.4)'
  },
  
  elevation: {
    sm: '0 1px 3px rgba(3, 4, 94, 0.1)',
    md: '0 4px 6px rgba(3, 4, 94, 0.1), 0 2px 4px rgba(3, 4, 94, 0.06)',
    lg: '0 10px 15px rgba(3, 4, 94, 0.1), 0 4px 6px rgba(3, 4, 94, 0.05)',
    xl: '0 20px 25px rgba(3, 4, 94, 0.1), 0 10px 10px rgba(3, 4, 94, 0.04)',
    floating: '0 25px 50px rgba(3, 4, 94, 0.15)'
  }
};

// Glass morphism effects
export const glass = {
  light: 'backdrop-blur(10px) bg-white/10 border border-white/20',
  medium: 'backdrop-blur(15px) bg-white/5 border border-white/10',
  strong: 'backdrop-blur(20px) bg-white/5 border border-white/5'
};

export default { colors, gradients, animations, shadows, glass };