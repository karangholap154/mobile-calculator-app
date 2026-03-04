import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import Colors from "@/constants/colors";
import CalcButton, { ButtonVariant } from "@/components/CalcButton";
import HistorySheet from "@/components/HistorySheet";
import {
  CalcState,
  initialState,
  handleDigit,
  handleDecimal,
  handleOperator,
  handleEquals,
  handleClear,
  handleToggleSign,
  handlePercent,
} from "@/lib/calculator";
import {
  HistoryEntry,
  loadHistory,
  saveHistoryEntry,
  clearHistory,
} from "@/lib/history";

// ─── Button grid definition ───────────────────────────────────────────────────

type ButtonDef = {
  label: string;
  variant: ButtonVariant;
  action: (state: CalcState) => CalcState;
  isEquals?: boolean;
};

const ROWS: ButtonDef[][] = [
  [
    { label: "AC", variant: "top", action: () => handleClear() },
    { label: "+/-", variant: "top", action: (s) => handleToggleSign(s) },
    { label: "%", variant: "top", action: (s) => handlePercent(s) },
    { label: "÷", variant: "operator", action: (s) => handleOperator(s, "÷") },
  ],
  [
    { label: "7", variant: "number", action: (s) => handleDigit(s, "7") },
    { label: "8", variant: "number", action: (s) => handleDigit(s, "8") },
    { label: "9", variant: "number", action: (s) => handleDigit(s, "9") },
    { label: "×", variant: "operator", action: (s) => handleOperator(s, "×") },
  ],
  [
    { label: "4", variant: "number", action: (s) => handleDigit(s, "4") },
    { label: "5", variant: "number", action: (s) => handleDigit(s, "5") },
    { label: "6", variant: "number", action: (s) => handleDigit(s, "6") },
    { label: "−", variant: "operator", action: (s) => handleOperator(s, "−") },
  ],
  [
    { label: "1", variant: "number", action: (s) => handleDigit(s, "1") },
    { label: "2", variant: "number", action: (s) => handleDigit(s, "2") },
    { label: "3", variant: "number", action: (s) => handleDigit(s, "3") },
    { label: "+", variant: "operator", action: (s) => handleOperator(s, "+") },
  ],
];

const BOTTOM_ROW_EXTRAS: ButtonDef[] = [
  { label: ".", variant: "number", action: (s) => handleDecimal(s) },
  {
    label: "=",
    variant: "equals",
    action: (s) => handleEquals(s),
    isEquals: true,
  },
];

// ─── Display font size helper ─────────────────────────────────────────────────

function getDisplayFontSize(value: string): number {
  const len = value.length;
  if (len <= 6) return 64;
  if (len <= 9) return 48;
  if (len <= 12) return 36;
  return 28;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CalculatorScreen() {
  const [calcState, setCalcState] = useState<CalcState>(initialState);
  const [isDark, setIsDark] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const insets = useSafeAreaInsets();
  const theme = isDark ? Colors.dark : Colors.light;
  const displayScale = useSharedValue(1);

  // Load history on mount
  useEffect(() => {
    loadHistory().then(setHistory);
  }, []);

  const gradients = isDark
    ? [
        Colors.dark.gradientStart,
        Colors.dark.gradientMid,
        Colors.dark.gradientEnd,
      ]
    : [
        Colors.light.gradientStart,
        Colors.light.gradientMid,
        Colors.light.gradientEnd,
      ];

  const displayAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: displayScale.value }],
  }));

  const triggerDisplayFlash = useCallback(() => {
    displayScale.value = withSpring(
      0.96,
      { damping: 20, stiffness: 500 },
      () => {
        displayScale.value = withSpring(1, { damping: 14, stiffness: 300 });
      },
    );
  }, [displayScale]);

  /**
   * Core dispatch: run the action, optionally record history when = completes.
   */
  const dispatch = useCallback(
    (action: (state: CalcState) => CalcState, isEquals = false) => {
      setCalcState((prev) => {
        const next = action(prev);

        // Record to history when = was pressed and we had a full expression
        if (
          isEquals &&
          next.justEvaluated &&
          !next.operator &&
          prev.operator &&
          prev.previous !== "" &&
          next.display !== "Error"
        ) {
          const expression = `${prev.previous} ${prev.operator} ${prev.display}`;
          saveHistoryEntry(expression, next.display).then(setHistory);
        }

        return next;
      });
      triggerDisplayFlash();
    },
    [triggerDisplayFlash],
  );

  const toggleDark = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsDark((d) => !d);
  };

  const openHistory = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setHistoryVisible(true);
  };

  /** When user taps a history result, load it into the display */
  const handleSelectHistory = (result: string) => {
    setCalcState({
      ...initialState,
      display: result,
      justEvaluated: true,
    });
  };

  const handleClearHistory = async () => {
    await clearHistory();
    setHistory([]);
  };

  const previousExpression =
    calcState.operator && calcState.previous
      ? `${calcState.previous} ${calcState.operator}`
      : "";

  return (
    <>
      <LinearGradient
        colors={gradients as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16),
          },
        ]}
      >
        {/* ── Top toolbar ───────────────── */}
        <View
          style={[
            styles.toolbar,
            { top: insets.top + (Platform.OS === "web" ? 67 : 0) },
          ]}
        >
          {/* History button */}
          <TouchableOpacity
            style={[
              styles.toolbarBtn,
              { backgroundColor: theme.glass, borderColor: theme.glassBorder },
            ]}
            onPress={openHistory}
            accessibilityRole="button"
            accessibilityLabel="View history"
          >
            <Feather name="clock" size={18} color={theme.displayText} />
          </TouchableOpacity>

          {/* Dark mode toggle */}
          <TouchableOpacity
            style={[
              styles.toolbarBtn,
              { backgroundColor: theme.glass, borderColor: theme.glassBorder },
            ]}
            onPress={toggleDark}
            accessibilityRole="button"
            accessibilityLabel={
              isDark ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            <Feather
              name={isDark ? "sun" : "moon"}
              size={18}
              color={theme.displayText}
            />
          </TouchableOpacity>
        </View>

        {/* ── Calculator Card ───────────── */}
        <View style={styles.cardWrapper}>
          {Platform.OS === "ios" ? (
            <BlurView
              intensity={isDark ? 25 : 60}
              tint={isDark ? "dark" : "light"}
              style={[styles.card, { borderColor: theme.glassBorder }]}
            >
              <CardContents
                calcState={calcState}
                theme={theme}
                previousExpression={previousExpression}
                displayAnimStyle={displayAnimStyle}
                dispatch={dispatch}
              />
            </BlurView>
          ) : (
            <View
              style={[
                styles.card,
                {
                  borderColor: theme.glassBorder,
                  backgroundColor: theme.glass,
                },
              ]}
            >
              <CardContents
                calcState={calcState}
                theme={theme}
                previousExpression={previousExpression}
                displayAnimStyle={displayAnimStyle}
                dispatch={dispatch}
              />
            </View>
          )}
        </View>
      </View>

      {/* ── History Sheet ─────────────── */}
      <HistorySheet
        visible={historyVisible}
        isDark={isDark}
        history={history}
        onClose={() => setHistoryVisible(false)}
        onSelect={handleSelectHistory}
        onClear={handleClearHistory}
      />
    </>
  );
}

// ─── Card Contents ────────────────────────────────────────────────────────────

interface CardContentsProps {
  calcState: CalcState;
  theme: typeof Colors.light;
  previousExpression: string;
  displayAnimStyle: object;
  dispatch: (
    action: (state: CalcState) => CalcState,
    isEquals?: boolean,
  ) => void;
}

function CardContents({
  calcState,
  theme,
  previousExpression,
  displayAnimStyle,
  dispatch,
}: CardContentsProps) {
  const displayFontSize = getDisplayFontSize(calcState.display);

  return (
    <View style={styles.cardInner}>
      {/* Display */}
      <View style={styles.displayContainer}>
        <Text
          style={[styles.previousExpression, { color: theme.displaySubText }]}
          numberOfLines={1}
        >
          {previousExpression}
        </Text>
        <Animated.Text
          style={[
            styles.displayValue,
            displayAnimStyle,
            { color: theme.displayText, fontSize: displayFontSize },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {calcState.display}
        </Animated.Text>
      </View>

      {/* Button rows */}
      <View style={styles.buttonsContainer}>
        {ROWS.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {row.map((btn) => (
              <CalcButton
                key={btn.label}
                label={btn.label}
                variant={btn.variant}
                colors={theme}
                onPress={() => dispatch(btn.action, !!btn.isEquals)}
              />
            ))}
          </View>
        ))}

        {/* Bottom row: 0 (wide)  .  = */}
        <View style={styles.row}>
          <CalcButton
            label="0"
            variant="zero"
            colors={theme}
            onPress={() => dispatch((s) => handleDigit(s, "0"))}
          />
          {BOTTOM_ROW_EXTRAS.map((btn) => (
            <CalcButton
              key={btn.label}
              label={btn.label}
              variant={btn.variant}
              colors={theme}
              onPress={() => dispatch(btn.action, !!btn.isEquals)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 16,
  },
  toolbar: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    gap: 10,
    zIndex: 10,
  },
  toolbarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardWrapper: {
    borderRadius: 32,
    overflow: "hidden",
    shadowColor: "rgba(80, 60, 180, 0.25)",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 20,
  },
  card: {
    borderRadius: 32,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  cardInner: {
    paddingHorizontal: 10,
    paddingTop: 16,
    paddingBottom: 16,
  },
  displayContainer: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 8,
    alignItems: "flex-end",
    minHeight: 110,
    justifyContent: "flex-end",
  },
  previousExpression: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  displayValue: {
    fontFamily: "Poppins_300Light",
    fontWeight: "300",
    letterSpacing: -1,
  },
  buttonsContainer: {},
  row: {
    flexDirection: "row",
  },
});
