import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
  cssVarPrefix: "ck",
};

const theme = extendTheme({ config });

export default theme;
