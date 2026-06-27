"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Conflict, FamilyMember } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/types";

interface Props {
  members: FamilyMember[];
  conflicts: Conflict[];
  onAddConflict: (date: string) => void;
  onEditConflict: (c: Conflict) => void;
}

function daysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function firstDayOfMonth(year: number, month: number) { return new Date(year, month, 1).getDay(); }
function toISO(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function isoToDate(s: string) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function CalendarView({ members, conflicts, onAddConflict, onEditConflict }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [filterMember, setFilterMember] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string | null>(null);

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const days = daysInMonth(year, month);
  const startDow = firstDayOfMonth(year, month);

  const getConflictsForDay = (day: number) => {
    const iso = toISO(year, month, day);
    const date = isoToDate(iso);
    return conflicts.filter(c => {
      const start = isoToDate(c.startDate);
      const end = isoToDate(c.endDate);
      if (date < start || date > end) return false;
      if (filterMember && c.memberId !== filterMember) return false;
      if (filterCat && c.category !== filterCat) return false;
      return true;
    });
  };

  const todayISO = toISO(now.getFullYear(), now.getMonth(), now.getDate());

  // Availability summary: days where at least one member has NO conflicts
  const getMemberMap = (day: number) => {
    const iso = toISO(year, month, day);
    const date = isoToDate(iso);
    const busy = new Set(conflicts.filter(c => {
      const s = isoToDate(c.startDate), e = isoToDate(c.endDate);
      return date >= s && date <= e;
    }).map(c => c.memberId));
    return { busy, free: members.filter(m => !busy.has(m.id)) };
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={prev} style={navBtn}><ChevronLeft size={18} /></button>
          <h2 style={{ fontSize: 22, fontWeight: 800, minWidth: 200 }}>{MONTHS[month]} {year}</h2>
          <button onClick={next} style={navBtn}><ChevronRight size={18} /></button>
          <button onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()); }} style={{ padding: "6px 12px", border: "1px solid var(--border)", borderRadius: 7, background: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Today</button>
        </div>
        <button onClick={() => onAddConflict(todayISO)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "var(--text)", color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
          <Plus size={15} /> Add Conflict
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {members.map(m => (
          <button key={m.id} onClick={() => setFilterMember(filterMember === m.id ? null : m.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, border: `2px solid ${filterMember === m.id ? m.color : "var(--border)"}`, background: filterMember === m.id ? m.color + "18" : "var(--surface)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            {m.emoji} {m.name}
          </button>
        ))}
        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
          <button key={key} onClick={() => setFilterCat(filterCat === key ? null : key)} style={{ padding: "6px 12px", borderRadius: 20, border: `2px solid ${filterCat === key ? cfg.color : "var(--border)"}`, background: filterCat === key ? cfg.bg : "var(--surface)", color: filterCat === key ? cfg.color : "var(--text-muted)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        {/* Day of week headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--border)" }}>
          {DOW.map(d => (
            <div key={d} style={{ textAlign: "center", padding: "10px 0", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em" }}>{d}</div>
          ))}
        </div>

        {/* Cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {/* Empty cells */}
          {Array.from({ length: startDow }).map((_, i) => (
            <div key={`e${i}`} style={{ minHeight: 100, borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "#fafaf8" }} />
          ))}

          {/* Day cells */}
          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1;
            const iso = toISO(year, month, day);
            const isToday = iso === todayISO;
            const dayConflicts = getConflictsForDay(day);
            const { free } = getMemberMap(day);
            const allFree = members.length > 0 && free.length === members.length;

            return (
              <div key={day} onClick={() => onAddConflict(iso)} style={{ minHeight: 100, borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: 8, cursor: "pointer", background: allFree ? "#f0fdf4" : "var(--surface)", transition: "background .15s", position: "relative" }}
                onMouseEnter={e => (e.currentTarget.style.background = allFree ? "#dcfce7" : "var(--bg)")}
                onMouseLeave={e => (e.currentTarget.style.background = allFree ? "#f0fdf4" : "var(--surface)")}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: isToday ? 800 : 500, fontSize: 13, background: isToday ? "var(--text)" : "none", color: isToday ? "#fff" : "var(--text)" }}>{day}</span>
                  {allFree && members.length > 0 && <span style={{ fontSize: 10, color: "#2f9e44", fontWeight: 700 }}>ALL FREE</span>}
                </div>

                {/* Conflict pills */}
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {dayConflicts.slice(0, 3).map(c => {
                    const cfg = CATEGORY_CONFIG[c.category];
                    const member = members.find(m => m.id === c.memberId);
                    return (
                      <div key={c.id} onClick={e => { e.stopPropagation(); onEditConflict(c); }} style={{ padding: "2px 6px", borderRadius: 5, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: member?.color || cfg.color, flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</span>
                      </div>
                    );
                  })}
                  {dayConflicts.length > 3 && <span style={{ fontSize: 11, color: "var(--text-muted)", paddingLeft: 2 }}>+{dayConflicts.length - 3} more</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const navBtn: React.CSSProperties = { background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center" };
