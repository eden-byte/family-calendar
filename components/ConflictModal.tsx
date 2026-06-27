"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Conflict, FamilyMember, ConflictCategory } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/types";

interface Props {
  members: FamilyMember[];
  conflict?: Conflict | null;
  defaultDate?: string;
  onSave: (conflicts: Conflict[]) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

function genId() { return Math.random().toString(36).slice(2); }
function today() { return new Date().toISOString().slice(0, 10); }
function toISO(d: Date) { return d.toISOString().slice(0, 10); }

// Get all Mon-Fri dates between two ISO dates
function getWeekdayDates(startISO: string, endISO: string): string[] {
  const dates: string[] = [];
  const cur = new Date(startISO + "T12:00:00");
  const end = new Date(endISO + "T12:00:00");
  while (cur <= end) {
    const dow = cur.getDay();
    if (dow >= 1 && dow <= 5) dates.push(toISO(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

// Next Monday from today
function nextMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 1 : day === 1 ? 0 : 8 - day;
  d.setDate(d.getDate() + diff);
  return toISO(d);
}

// Next Friday from a given monday ISO
function nextFriday(mondayISO: string) {
  const d = new Date(mondayISO + "T12:00:00");
  d.setDate(d.getDate() + 4);
  return toISO(d);
}

type RecurMode = "single" | "weekdays";

export default function ConflictModal({ members, conflict, defaultDate, onSave, onDelete, onClose }: Props) {
  const [memberId, setMemberId] = useState(conflict?.memberId || members[0]?.id || "");
  const [title, setTitle] = useState(conflict?.title || "");
  const [category, setCategory] = useState<ConflictCategory>(conflict?.category || "work");
  const [recurMode, setRecurMode] = useState<RecurMode>("single");
  const [startDate, setStartDate] = useState(conflict?.startDate || defaultDate || today());
  const [endDate, setEndDate] = useState(conflict?.endDate || defaultDate || today());
  // Weekday recur range
  const [weekdayStart, setWeekdayStart] = useState(nextMonday());
  const [weekdayEnd, setWeekdayEnd] = useState(() => nextFriday(nextMonday()));
  const [allDay, setAllDay] = useState(conflict?.allDay ?? true);
  const [startTime, setStartTime] = useState(conflict?.startTime || "09:00");
  const [endTime, setEndTime] = useState(conflict?.endTime || "17:00");
  const [notes, setNotes] = useState(conflict?.notes || "");
  const [error, setError] = useState("");

  useEffect(() => { if (endDate < startDate) setEndDate(startDate); }, [startDate]);
  useEffect(() => { if (weekdayEnd < weekdayStart) setWeekdayEnd(nextFriday(weekdayStart)); }, [weekdayStart]);

  // When category changes, auto-suggest title if blank
  useEffect(() => {
    if (!title) setTitle(CATEGORY_CONFIG[category].label);
  }, [category]);

  const weekdayCount = recurMode === "weekdays" ? getWeekdayDates(weekdayStart, weekdayEnd).length : 0;

  const submit = () => {
    if (!title.trim()) { setError("Please enter a title."); return; }
    if (!memberId) { setError("Please select a family member."); return; }

    if (recurMode === "weekdays") {
      const dates = getWeekdayDates(weekdayStart, weekdayEnd);
      if (dates.length === 0) { setError("No weekdays found in that range."); return; }
      const conflicts: Conflict[] = dates.map(d => ({
        id: genId(), memberId, title: title.trim(), category,
        startDate: d, endDate: d, allDay,
        startTime: allDay ? undefined : startTime,
        endTime: allDay ? undefined : endTime,
        notes: notes.trim() || undefined,
      }));
      onSave(conflicts);
    } else {
      onSave([{ id: conflict?.id || genId(), memberId, title: title.trim(), category, startDate, endDate, allDay, startTime: allDay ? undefined : startTime, endTime: allDay ? undefined : endTime, notes: notes.trim() || undefined }]);
    }
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16, overflowY: "auto" }}>
      <div style={{ background: "var(--surface)", borderRadius: 18, width: "100%", maxWidth: 500, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden", margin: "auto" }}>
        <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{conflict ? "Edit Conflict" : "Add Conflict"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}><X size={20} /></button>
        </div>

        <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Member */}
          <Field label="Family Member">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {members.map(m => (
                <button key={m.id} onClick={() => setMemberId(m.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8, border: `2px solid ${memberId === m.id ? m.color : "var(--border)"}`, background: memberId === m.id ? m.color + "18" : "var(--bg)", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
                  <span>{m.emoji}</span> {m.name}
                </button>
              ))}
            </div>
          </Field>

          {/* Title */}
          <Field label="Title">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Work, School, Soccer practice…" style={inputStyle} onKeyDown={e => e.key === "Enter" && submit()} autoFocus />
          </Field>

          {/* Category */}
          <Field label="Category">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(Object.keys(CATEGORY_CONFIG) as ConflictCategory[]).map(cat => {
                const cfg = CATEGORY_CONFIG[cat];
                const active = category === cat;
                return (
                  <button key={cat} onClick={() => setCategory(cat)} style={{ padding: "7px 14px", borderRadius: 8, border: `2px solid ${active ? cfg.color : "var(--border)"}`, background: active ? cfg.bg : "var(--bg)", color: active ? cfg.color : "var(--text-muted)", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Recur mode — only show when not editing existing */}
          {!conflict && (
            <Field label="Schedule Type">
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setRecurMode("single")} style={{ flex: 1, padding: "9px 14px", borderRadius: 9, border: `2px solid ${recurMode === "single" ? "var(--text)" : "var(--border)"}`, background: recurMode === "single" ? "var(--text)" : "var(--bg)", color: recurMode === "single" ? "#fff" : "var(--text-muted)", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                  Single / date range
                </button>
                <button onClick={() => setRecurMode("weekdays")} style={{ flex: 1, padding: "9px 14px", borderRadius: 9, border: `2px solid ${recurMode === "weekdays" ? "#3b5bdb" : "var(--border)"}`, background: recurMode === "weekdays" ? "#dbe4ff" : "var(--bg)", color: recurMode === "weekdays" ? "#3b5bdb" : "var(--text-muted)", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                  Mon–Fri (weekdays)
                </button>
              </div>
            </Field>
          )}

          {/* Date inputs */}
          {recurMode === "single" ? (
            <div style={{ display: "flex", gap: 12 }}>
              <Field label="Start Date" style={{ flex: 1 }}>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
              </Field>
              <Field label="End Date" style={{ flex: 1 }}>
                <input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
              </Field>
            </div>
          ) : (
            <div style={{ background: "#dbe4ff22", border: "1.5px solid #3b5bdb44", borderRadius: 10, padding: 14 }}>
              <p style={{ fontSize: 13, color: "#3b5bdb", fontWeight: 600, marginBottom: 12 }}>
                Add every Mon–Fri in this range {weekdayCount > 0 && <span style={{ opacity: 0.7 }}>({weekdayCount} days)</span>}
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                <Field label="From" style={{ flex: 1 }}>
                  <input type="date" value={weekdayStart} onChange={e => setWeekdayStart(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="To" style={{ flex: 1 }}>
                  <input type="date" value={weekdayEnd} min={weekdayStart} onChange={e => setWeekdayEnd(e.target.value)} style={inputStyle} />
                </Field>
              </div>
            </div>
          )}

          {/* All day toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
            <div onClick={() => setAllDay(!allDay)} style={{ width: 40, height: 22, borderRadius: 11, background: allDay ? "var(--text)" : "var(--border)", position: "relative", transition: "background .2s", cursor: "pointer", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 3, left: allDay ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 500 }}>All day</span>
          </label>

          {!allDay && (
            <div style={{ display: "flex", gap: 12 }}>
              <Field label="Start Time" style={{ flex: 1 }}>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={inputStyle} />
              </Field>
              <Field label="End Time" style={{ flex: 1 }}>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={inputStyle} />
              </Field>
            </div>
          )}

          {/* Notes */}
          <Field label="Notes (optional)">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any extra details…" rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </Field>

          {error && <p style={{ color: "#e64980", fontSize: 13 }}>{error}</p>}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            {conflict && (
              <button onClick={() => { if (confirm("Delete this conflict?")) onDelete(conflict.id); }} style={{ padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e64980", background: "none", color: "#e64980", cursor: "pointer", fontWeight: 600, fontSize: 15 }}>Delete</button>
            )}
            <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1px solid var(--border)", background: "none", cursor: "pointer", fontWeight: 600, fontSize: 15 }}>Cancel</button>
            <button onClick={submit} style={{ flex: 2, padding: "11px", borderRadius: 10, border: "none", background: "var(--text)", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 15 }}>
              {recurMode === "weekdays" && weekdayCount > 0 ? `Save ${weekdayCount} days` : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 7 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid var(--border)", borderRadius: 9, fontSize: 14, background: "var(--bg)", color: "var(--text)", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
