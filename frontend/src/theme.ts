import 'styled-components'

export const theme = {
  white: '#fff',
  whiteRgb: '255,255,255',
  black: '#000',
  borderGray: '#bababa',
  dividerGray: '#b9b9b9',
  inactiveGray: '#adadad',
  scaleGray: '#e8e8e8',
  disabledGray: '#ccc',
  placeholderRgba: '0, 0, 0, 0.2',
  primary: '#53bd9a',
  primaryRgb: '83,189,154',
  darkGreen: '#31565d',
  background: '#fcfaf8',
  blue: '#00bbe4',
  yellow: '#F4EB15',
  errorText: '#ee0e00',
  errorBg: '#bd5353',
} as const

type Theme = typeof theme
declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
}
