/**
 * Professional Color Palette
 * Warm Earth Tones - Elegant and Sophisticated
 */

export const colors = {
  // Primary - Deep Burgundy #452829 (Elegant, Sophisticated)
  primary: {
    50: '#FDF8F8',
    100: '#F9EBEB',
    200: '#F5D9D9',
    300: '#F1C7C7',
    400: '#EDB5B5',
    500: '#E8D1C5',   // Warm Beige accent
    600: '#C9A8A8',
    700: '#AA7F7F',
    800: '#8B5656',
    900: '#452829',   // Deep Burgundy
  },

  // Secondary - Charcoal #57595B (Professional, Strong)
  secondary: {
    50: '#FAFAFA',
    100: '#F3F3F3',
    200: '#E7E7E7',
    300: '#DBDBDB',
    400: '#CFCFCF',
    500: '#A3A5A7',
    600: '#77797B',
    700: '#57595B',   // Charcoal
    800: '#37393B',
    900: '#17191B',
  },

  // Background - Pure White
  background: {
    default: '#FFFFFF',
    paper: '#FFFFFF',
    elevated: '#F3E8DF',
  },

  // Accent - Warm Beige #E8D1C5
  accent: {
    50: '#FDF8F6',
    100: '#F9EBE4',
    200: '#F5D9CE',
    300: '#F1C7B8',
    400: '#EDB5A2',
    500: '#E8D1C5',   // Warm Beige
    600: '#C9A89A',
    700: '#AA7F6F',
    800: '#8B5644',
    900: '#6C2D19',
  },

  // Status Colors
  success: {
    light: '#dcfce7',
    main: '#16a34a',
    dark: '#166534',
  },

  warning: {
    light: '#dbeafe',  // Changed to blue
    main: '#2563eb',
    dark: '#1e40af',
  },

  error: {
    light: '#fee2e2',
    main: '#dc2626',
    dark: '#991b1b',
  },

  info: {
    light: '#dbeafe',
    main: '#2563eb',
    dark: '#1e40af',
  },

  // Neutral Grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Background Colors
  background: {
    default: '#f8fafc',
    paper: '#ffffff',
    elevated: '#f1f5f9',
  },

  // Text Colors
  text: {
    primary: '#1e293b',
    secondary: '#475569',
    muted: '#94a3b8',
    disabled: '#cbd5e1',
  },

  // Border Colors
  border: {
    light: '#e2e8f0',
    main: '#cbd5e1',
    dark: '#94a3b8',
  },
};

// Tailwind CSS class mappings
export const tailwindColors = {
  primary: 'bg-[#452829] hover:bg-[#6C2D19] text-white',
  secondary: 'bg-[#57595B] hover:bg-[#37393B] text-white',
  accent: 'bg-[#E8D1C5] hover:bg-[#C9A89A] text-[#452829]',

  success: 'bg-green-500 hover:bg-green-600 text-white',
  warning: 'bg-blue-500 hover:bg-blue-600 text-white',
  error: 'bg-red-500 hover:bg-red-600 text-white',
  info: 'bg-blue-500 hover:bg-blue-600 text-white',

  // Status badges
  statusActive: 'bg-green-100 text-green-800 border-green-200',
  statusPending: 'bg-blue-100 text-blue-800 border-blue-200',
  statusRejected: 'bg-red-100 text-red-800 border-red-200',
  statusSuspended: 'bg-blue-100 text-blue-800 border-blue-200',

  // Cards and surfaces
  card: 'bg-white border-[#E8D1C5] shadow-sm',
  cardHover: 'hover:border-[#C9A89A] hover:shadow-md',

  // Buttons
  buttonPrimary: 'bg-[#452829] hover:bg-[#6C2D19] text-white font-medium',
  buttonSecondary: 'bg-[#57595B] hover:bg-[#37393B] text-white font-medium',
  buttonAccent: 'bg-[#E8D1C5] hover:bg-[#C9A89A] text-[#452829] font-medium',
  buttonDanger: 'bg-red-500 hover:bg-red-600 text-white font-medium',

  // Input fields
  input: 'border-[#E8D1C5] focus:border-[#C9A89A] focus:ring-[#E8D1C5]',

  // Navigation
  navActive: 'bg-[#E8D1C5] text-[#452829]',
  navInactive: 'text-[#57595B] hover:bg-white hover:text-[#452829]',
};

// Component-specific color schemes
export const componentColors = {
  // Admin Dashboard
  admin: {
    header: 'bg-[#452829] text-white',
    sidebar: 'bg-[#57595B] text-white',
    activeTab: 'bg-[#E8D1C5] text-[#452829] border-[#E8D1C5]',
    inactiveTab: 'text-[#57595B] hover:bg-white',
  },

  // Organization Cards
  organization: {
    card: 'bg-white border-[#E8D1C5]',
    header: 'bg-[#E8D1C5] border-[#E8D1C5]',
    ownerBadge: 'bg-[#E8D1C5] text-[#452829]',
  },

  // Auth Pages
  auth: {
    background: 'bg-white',
    card: 'bg-white border-[#E8D1C5] shadow-lg',
    primaryButton: 'bg-[#452829] hover:bg-[#6C2D19] text-white',
    link: 'text-[#57595B] hover:text-[#452829]',
  },

  // Notifications
  notification: {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-blue-50 border-blue-200 text-blue-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  },
};

// Export as CSS custom properties for global use
export const cssVariables = `
:root {
  /* Primary - Warm Beige #E8D1C5 */
  --color-primary-50: ${colors.primary[50]};
  --color-primary-100: ${colors.primary[100]};
  --color-primary-200: ${colors.primary[200]};
  --color-primary-300: ${colors.primary[300]};
  --color-primary-400: ${colors.primary[400]};
  --color-primary-500: ${colors.primary[500]};
  --color-primary-600: ${colors.primary[600]};
  --color-primary-700: ${colors.primary[700]};
  --color-primary-800: ${colors.primary[800]};
  --color-primary-900: ${colors.primary[900]};
  
  /* Secondary - Gray */
  --color-secondary-50: ${colors.secondary[50]};
  --color-secondary-100: ${colors.secondary[100]};
  --color-secondary-200: ${colors.secondary[200]};
  --color-secondary-300: ${colors.secondary[300]};
  --color-secondary-400: ${colors.secondary[400]};
  --color-secondary-500: ${colors.secondary[500]};
  --color-secondary-600: ${colors.secondary[600]};
  --color-secondary-700: ${colors.secondary[700]};
  --color-secondary-800: ${colors.secondary[800]};
  --color-secondary-900: ${colors.secondary[900]};
  
  /* Accent - Teal */
  --color-accent-50: ${colors.accent[50]};
  --color-accent-100: ${colors.accent[100]};
  --color-accent-200: ${colors.accent[200]};
  --color-accent-300: ${colors.accent[300]};
  --color-accent-400: ${colors.accent[400]};
  --color-accent-500: ${colors.accent[500]};
  --color-accent-600: ${colors.accent[600]};
  --color-accent-700: ${colors.accent[700]};
  --color-accent-800: ${colors.accent[800]};
  --color-accent-900: ${colors.accent[900]};
  
  /* Status Colors */
  --color-success-light: ${colors.success.light};
  --color-success-main: ${colors.success.main};
  --color-success-dark: ${colors.success.dark};
  
  --color-warning-light: ${colors.warning.light};
  --color-warning-main: ${colors.warning.main};
  --color-warning-dark: ${colors.warning.dark};
  
  --color-error-light: ${colors.error.light};
  --color-error-main: ${colors.error.main};
  --color-error-dark: ${colors.error.dark};
  
  --color-info-light: ${colors.info.light};
  --color-info-main: ${colors.info.main};
  --color-info-dark: ${colors.info.dark};
  
  /* Background */
  --bg-default: ${colors.background.default};
  --bg-paper: ${colors.background.paper};
  --bg-elevated: ${colors.background.elevated};
  
  /* Text */
  --text-primary: ${colors.text.primary};
  --text-secondary: ${colors.text.secondary};
  --text-muted: ${colors.text.muted};
  --text-disabled: ${colors.text.disabled};
  
  /* Border */
  --border-light: ${colors.border.light};
  --border-main: ${colors.border.main};
  --border-dark: ${colors.border.dark};
}
`;

export default colors;
