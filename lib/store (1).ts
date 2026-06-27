"use client";
import { useState, useEffect } from "react";
import type { AppState, FamilyMember, Conflict } from "./types";

const STORAGE_KEY = "family-calendar-v1";

const DEFAULT_STATE: AppState = {
  members: [],
  conflicts: [],
};

export function useAppState() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  const save = (next: AppState) => {
    setState(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const addMember = (m: FamilyMember) => save({ ...state, members: [...state.members, m] });
  const updateMember = (m: FamilyMember) => save({ ...state, members: state.members.map(x => x.id === m.id ? m : x) });
  const removeMember = (id: string) => save({ ...state, members: state.members.filter(x => x.id !== id), conflicts: state.conflicts.filter(c => c.memberId !== id) });

  const addConflict = (c: Conflict) => save({ ...state, conflicts: [...state.conflicts, c] });
  const updateConflict = (c: Conflict) => save({ ...state, conflicts: state.conflicts.map(x => x.id === c.id ? c : x) });
  const removeConflict = (id: string) => save({ ...state, conflicts: state.conflicts.filter(x => x.id !== id) });

  return { state, loaded, addMember, updateMember, removeMember, addConflict, updateConflict, removeConflict };
}
