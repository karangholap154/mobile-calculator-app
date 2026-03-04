/**
 * HistorySheet — slide-up modal showing past calculations.
 * Uses a React Native Modal for simplicity so state stays in the parent.
 */
import React, { useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Pressable,
  Linking,
} from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { HistoryEntry, formatTimestamp } from "@/lib/history";

interface HistorySheetProps {
  visible: boolean;
  isDark: boolean;
  history: HistoryEntry[];
  onClose: () => void;
  onSelect: (result: string) => void;
  onClear: () => void;
}

const AnimatedView = Animated.createAnimatedComponent(View);

function HistoryItem({
  entry,
  theme,
  onSelect,
}: {
  entry: HistoryEntry;
  theme: typeof Colors.light;
  onSelect: (result: string) => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 20, stiffness: 400 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };
  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelect(entry.result);
  };

  return (
    <Animated.View style={[styles.itemWrapper, animStyle]}>
      <Pressable
        style={[styles.item, { borderColor: theme.glassBorder }]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Use result ${entry.result}`}
      >
        <View style={styles.itemLeft}>
          <Text
            style={[styles.itemExpression, { color: theme.displaySubText }]}
            numberOfLines={1}
          >
            {entry.expression}
          </Text>
          <Text
            style={[styles.itemResult, { color: theme.displayText }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {entry.result}
          </Text>
        </View>
        <Text style={[styles.itemTime, { color: theme.displaySubText }]}>
          {formatTimestamp(entry.timestamp)}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function HistorySheet({
  visible,
  isDark,
  history,
  onClose,
  onSelect,
  onClear,
}: HistorySheetProps) {
  const insets = useSafeAreaInsets();
  const theme = isDark ? Colors.dark : Colors.light;

  const handleClear = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    onClear();
  };

  const handleOpenWebsite = () => {
    Linking.openURL("https://karangholap.com");
  };

  const SheetContent = (
    <View
      style={[
        styles.sheet,
        {
          paddingBottom: insets.bottom + 16,
          borderColor: theme.glassBorder,
          backgroundColor: isDark
            ? "rgba(15, 10, 35, 0.92)"
            : "rgba(240, 235, 255, 0.88)",
        },
      ]}
    >
      {/* Handle bar */}
      <View
        style={[styles.handle, { backgroundColor: theme.displaySubText }]}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.displayText }]}>
          History
        </Text>
        <View style={styles.headerActions}>
          {history.length > 0 && (
            <TouchableOpacity
              onPress={handleClear}
              style={styles.clearBtn}
              accessibilityRole="button"
              accessibilityLabel="Clear history"
            >
              <Text style={[styles.clearText, { color: "#FF6B6B" }]}>
                Clear
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.closeBtn,
              {
                backgroundColor: theme.buttonTopBg,
                borderColor: theme.glassBorder,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Close history"
          >
            <Feather name="x" size={16} color={theme.displayText} />
          </TouchableOpacity>
        </View>
      </View>

      {/* List / Empty state */}
      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="clock" size={40} color={theme.displaySubText} />
          <Text style={[styles.emptyTitle, { color: theme.displayText }]}>
            No calculations yet
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.displaySubText }]}>
            Results will appear here after you press =
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          style={styles.list}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HistoryItem
              entry={item}
              theme={theme}
              onSelect={(result) => {
                onSelect(result);
                onClose();
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => (
            <View
              style={[styles.separator, { backgroundColor: theme.glassBorder }]}
            />
          )}
        />
      )}

      <TouchableOpacity
        onPress={handleOpenWebsite}
        style={styles.footerLinkContainer}
        accessibilityRole="link"
        accessibilityLabel="Open karangholap.com"
      >
        <Text style={[styles.footerLinkText, { color: theme.displaySubText }]}>
          karangholap.com
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={StyleSheet.absoluteFill} />
      </Pressable>

      <View style={styles.sheetContainer} pointerEvents="box-none">
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={isDark ? 30 : 55}
            tint={isDark ? "dark" : "light"}
            style={[
              styles.blurSheet,
              {
                borderColor: theme.glassBorder,
                paddingBottom: insets.bottom + 16,
              },
            ]}
          >
            {/* Handle bar */}
            <View
              style={[styles.handle, { backgroundColor: theme.displaySubText }]}
            />
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: theme.displayText }]}>
                History
              </Text>
              <View style={styles.headerActions}>
                {history.length > 0 && (
                  <TouchableOpacity
                    onPress={handleClear}
                    style={styles.clearBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Clear history"
                  >
                    <Text style={[styles.clearText, { color: "#FF6B6B" }]}>
                      Clear
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={onClose}
                  style={[
                    styles.closeBtn,
                    {
                      backgroundColor: theme.buttonTopBg,
                      borderColor: theme.glassBorder,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Close history"
                >
                  <Feather name="x" size={16} color={theme.displayText} />
                </TouchableOpacity>
              </View>
            </View>

            {history.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="clock" size={40} color={theme.displaySubText} />
                <Text style={[styles.emptyTitle, { color: theme.displayText }]}>
                  No calculations yet
                </Text>
                <Text
                  style={[styles.emptySubtext, { color: theme.displaySubText }]}
                >
                  Results will appear here after you press =
                </Text>
              </View>
            ) : (
              <FlatList
                data={history}
                style={styles.list}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <HistoryItem
                    entry={item}
                    theme={theme}
                    onSelect={(result) => {
                      onSelect(result);
                      onClose();
                    }}
                  />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => (
                  <View
                    style={[
                      styles.separator,
                      { backgroundColor: theme.glassBorder },
                    ]}
                  />
                )}
              />
            )}

            <TouchableOpacity
              onPress={handleOpenWebsite}
              style={styles.footerLinkContainer}
              accessibilityRole="link"
              accessibilityLabel="Open karangholap.com"
            >
              <Text
                style={[styles.footerLinkText, { color: theme.displaySubText }]}
              >
                karangholap.com
              </Text>
            </TouchableOpacity>
          </BlurView>
        ) : (
          SheetContent
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "72%",
  },
  blurSheet: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    overflow: "hidden",
  },
  sheet: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    overflow: "hidden",
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 4,
    opacity: 0.4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
    letterSpacing: 0.2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 8,
  },
  itemWrapper: {
    marginVertical: 2,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 0,
  },
  itemLeft: {
    flex: 1,
    marginRight: 12,
  },
  itemExpression: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    marginBottom: 2,
  },
  itemResult: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 24,
    letterSpacing: -0.5,
  },
  itemTime: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingBottom: 40,
  },
  emptyTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    marginTop: 8,
  },
  emptySubtext: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  footerLinkContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  footerLinkText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
  },
});
