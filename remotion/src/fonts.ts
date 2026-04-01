import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadPlusJakarta } from "@remotion/google-fonts/PlusJakartaSans";

export const { fontFamily: displayFont } = loadSpaceGrotesk("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const { fontFamily: bodyFont } = loadPlusJakarta("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});
