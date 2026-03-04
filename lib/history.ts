/**
 * History management — persists calculator results to AsyncStorage.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "calc_history_v1";
const MAX_ENTRIES = 100;

export interface HistoryEntry {
  id: string;
  expression: string; // e.g. "5 + 3"
  result: string;     // e.g. "8"
  timestamp: number;
}

export async function loadHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export async function saveHistoryEntry(
  expression: string,
  result: string
): Promise<HistoryEntry[]> {
  try {
    const existing = await loadHistory();
    const entry: HistoryEntry = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      expression,
      result,
      timestamp: Date.now(),
    };
    const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // silent
  }
}

/** Format a timestamp into a short relative label */
export function formatTimestamp(ts: number): string {
  const diff = Date.now() - ts;
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "Just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  const date = new Date(ts);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
