import type { Colors } from "../types/colors";

export const COLORS = {
  primary: '#0046FF',
  secondary: '#99ADFF',
  hover: '#336BFF',
  click: '#0038CC',
  card_background: '#E6EDFF',
  blue_black: '#374151',
  blue_white: '#F9FAFB',
  blue_light_gray: '#D1D5DB',
  blue_gray: '#6B7280',
} as const satisfies Colors;