import { DefaultTheme } from "react-native-paper";

export const Colors = {
  primary: '#3F1DCB',
  error: '#C60055',
  onError: '#FFFFFF',
  warning: '#FABA30',
  onWarning: '#FFFFFF',
  edit: '#C67C00',
  divider: '#CCCCCC',
};

export const Spacing = {
  gutterVertical: 20,
  gutterHorizontal: 10,
  marginSmall: 5,
  buttonMarginVertical: 30,
  formFieldGutter: 20,
  footerHeight: 50,
  listItemHeight: 110,
};

export const Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...Colors,
  },
};
