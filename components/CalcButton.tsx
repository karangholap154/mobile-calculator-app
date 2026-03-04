import React from "react";
import { Pressable, Text, StyleSheet, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

export type ButtonVariant = "number" | "operator" | "top" | "equals" | "zero";

interface CalcButtonProps {
  label: string;
  variant: ButtonVariant;
  onPress: () => void;
  colors: {
    buttonNumBg: string;
    buttonNumText: string;
    buttonNumBorder: string;
    buttonOpBg: string;
    buttonOpText: string;
    buttonOpBorder: string;
    buttonTopBg: string;
    buttonTopText: string;
    buttonTopBorder: string;
    buttonEqBg: string;
    buttonEqText: string;
    buttonEqBorder: string;
    buttonZeroBg: string;
    buttonZeroText: string;
  };
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CalcButton({
  label,
  variant,
  onPress,
  colors,
}: CalcButtonProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.88, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  };

  const handlePress = () => {
    if (Platform.OS !== "web") {
      if (variant === "equals") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
    onPress();
  };

  const getBg = () => {
    switch (variant) {
      case "operator":
        return colors.buttonOpBg;
      case "top":
        return colors.buttonTopBg;
      case "equals":
        return colors.buttonEqBg;
      case "zero":
        return colors.buttonZeroBg;
      default:
        return colors.buttonNumBg;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "operator":
        return colors.buttonOpText;
      case "top":
        return colors.buttonTopText;
      case "equals":
        return colors.buttonEqText;
      case "zero":
        return colors.buttonZeroText;
      default:
        return colors.buttonNumText;
    }
  };

  const getBorder = () => {
    switch (variant) {
      case "operator":
        return colors.buttonOpBorder;
      case "top":
        return colors.buttonTopBorder;
      case "equals":
        return colors.buttonEqBorder;
      default:
        return colors.buttonNumBorder;
    }
  };

  const getFontSize = () => {
    if (label.length > 2) return 18;
    return 22;
  };

  return (
    <Animated.View style={[styles.wrapper, animStyle, variant === "zero" && styles.zeroWrapper]}>
      <AnimatedPressable
        style={[
          styles.button,
          variant === "zero" && styles.zeroButton,
          {
            backgroundColor: getBg(),
            borderColor: getBorder(),
          },
          variant === "equals" && styles.equalsButton,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text
          style={[
            styles.label,
            {
              color: getTextColor(),
              fontSize: getFontSize(),
              fontFamily:
                variant === "top" ? "Poppins_500Medium" : "Poppins_600SemiBold",
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {label}
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    margin: 5,
    aspectRatio: 1,
  },
  zeroWrapper: {
    flex: 2,
    aspectRatio: undefined,
  },
  button: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(0,0,0,0.15)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  zeroButton: {
    alignItems: "flex-start",
    paddingLeft: 28,
  },
  equalsButton: {
    shadowColor: "#FF6B6B",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  label: {
    letterSpacing: 0.3,
  },
});
