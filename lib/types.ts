export type ConflictCategory = "work" | "school" | "friend" | "travel";

export interface Conflict {
  id: string;
  memberId: string;
  title: string;
  category: ConflictCategory;
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string;
  allDay: boolean;
  startTime?: string; // HH:MM
  endTime?: string;
  notes?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  color: string; // hex
  emoji: string;
}

export interface AppState {
  members: FamilyMember[];
  conflicts: Conflict[];
}

export const CATEGORY_CONFIG: Record<ConflictCategory, { label: string; color: string; bg: string }> = {
  work:   { label: "Work",   color: "#3b5bdb", bg: "#dbe4ff" },
  school: { label: "School", color: "#e67700", bg: "#fff3bf" },
  friend: { label: "Friend", color: "#2f9e44", bg: "#d3f9d8" },
  travel: { label: "Travel", color: "#c2255c", bg: "#fce4ec" },
};

export const MEMBER_COLORS = [
  "#e64980", "#3b5bdb", "#2f9e44", "#f59f00", "#7048e8", "#1098ad",
];

export const MEMBER_EMOJIS = ["👩", "👨", "👧", "👦", "👵", "👴"];
