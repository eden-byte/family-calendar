"use client";
import { useState, useEffect, useCallback } from "react";
import type { FamilyMember, Conflict } from "./types";
import { supabase } from "./supabase";

console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30));

export interface AppState {
  members: FamilyMember[];
  conflicts: Conflict[];
}

export function useAppState() {
  const [state, setState] = useState<AppState>({ members: [], conflicts: [] });
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoaded(false);
    const [{ data: members, error: me }, { data: conflicts, error: ce }] = await Promise.all([
      supabase.from("members").select("*").order("created_at"),
      supabase.from("conflicts").select("*").order("start_date"),
    ]);
    if (me || ce) { setError("Could not load data. Check your Supabase config."); setLoaded(true); return; }
    setState({
      members: (members || []).map(dbToMember),
      conflicts: (conflicts || []).map(dbToConflict),
    });
    setLoaded(true);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Real-time subscriptions
  useEffect(() => {
    const ch = supabase.channel("realtime-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "members" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "conflicts" }, fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchAll]);

  const addMember = async (m: FamilyMember) => {
    const { error } = await supabase.from("members").insert(memberToDb(m));
    if (error) setError(error.message);
  };

  const updateMember = async (m: FamilyMember) => {
    const { error } = await supabase.from("members").update(memberToDb(m)).eq("id", m.id);
    if (error) setError(error.message);
  };

  const removeMember = async (id: string) => {
    // conflicts cascade delete via FK, or we delete manually
    await supabase.from("conflicts").delete().eq("member_id", id);
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) setError(error.message);
  };

  const addConflict = async (c: Conflict) => {
    const { error } = await supabase.from("conflicts").insert(conflictToDb(c));
    if (error) setError(error.message);
  };

  const addConflicts = async (cs: Conflict[]) => {
    const { error } = await supabase.from("conflicts").insert(cs.map(conflictToDb));
    if (error) setError(error.message);
  };

  const updateConflict = async (c: Conflict) => {
    const { error } = await supabase.from("conflicts").update(conflictToDb(c)).eq("id", c.id);
    if (error) setError(error.message);
  };

  const removeConflict = async (id: string) => {
    const { error } = await supabase.from("conflicts").delete().eq("id", id);
    if (error) setError(error.message);
  };

  return { state, loaded, error, addMember, updateMember, removeMember, addConflict, addConflicts, updateConflict, removeConflict };
}

// DB <-> app type converters
function dbToMember(r: Record<string, string>): FamilyMember {
  return { id: r.id, name: r.name, color: r.color, emoji: r.emoji };
}
function memberToDb(m: FamilyMember) {
  return { id: m.id, name: m.name, color: m.color, emoji: m.emoji };
}
function dbToConflict(r: Record<string, string>): Conflict {
  return {
    id: r.id, memberId: r.member_id, title: r.title,
    category: r.category as Conflict["category"],
    startDate: r.start_date, endDate: r.end_date,
    allDay: r.all_day === "true" || r.all_day === true as unknown as string,
    startTime: r.start_time || undefined,
    endTime: r.end_time || undefined,
    notes: r.notes || undefined,
  };
}
function conflictToDb(c: Conflict) {
  return {
    id: c.id, member_id: c.memberId, title: c.title,
    category: c.category, start_date: c.startDate, end_date: c.endDate,
    all_day: c.allDay, start_time: c.startTime || null,
    end_time: c.endTime || null, notes: c.notes || null,
  };
}
