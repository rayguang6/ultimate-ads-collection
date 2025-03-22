export const TAG_COLORS = {
  default: { bg: '#F1F0EE', name: 'Default' },
  gray: { bg: '#E4E3DF', name: 'Gray' },
  brown: { bg: '#D7C9C2', name: 'Brown' },
  orange: { bg: '#F3D8C5', name: 'Orange' },
  yellow: { bg: '#F2E59C', name: 'Yellow' },
  green: { bg: '#D9EAD7', name: 'Green' },
  blue: { bg: '#D5E3F1', name: 'Blue' },
  purple: { bg: '#E5D8EF', name: 'Purple' },
  pink: { bg: '#F4DAEA', name: 'Pink' },
  red: { bg: '#F7D9D4', name: 'Red' }

} as const;

export type TagColorKey = keyof typeof TAG_COLORS;