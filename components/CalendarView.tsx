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
const DOW_DESKTOP = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DOW_MOBILE = ["S","M","T","W","T","F","S"];

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={prev} style={navBtn}><ChevronLeft size={16} /></button>
          <h2 style={{ fontSize: "clamp(15px, 4vw, 22px)", fontWeight: 800, minWidth: 0, whiteSpace: "nowrap" }}>{MONTHS[month]} {year}</h2>
          <button onClick={next} style={navBtn}><ChevronRight size={16} /></button>
          <button onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()); }} style={{ padding: "5px 8px", border: "1px solid var(--border)", borderRadius: 7, background: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Today</button>
        </div>
        <button onClick={() => onAddConflict(todayISO)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", background: "var(--text)", color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Filters — horizontally scrollable on mobile */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
        {members.map(m => (
          <button key={m.id} onClick={() => setFilterMember(filterMember === m.id ? null : m.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 20, border: `2px solid ${filterMember === m.id ? m.color : "var(--border)"}`, background: filterMember === m.id ? m.color + "18" : "var(--surface)", cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
            {m.emoji} {m.name}
          </button>
        ))}
        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
          <button key={key} onClick={() => setFilterCat(filterCat === key ? null : key)} style={{ padding: "5px 10px", borderRadius: 20, border: `2px solid ${filterCat === key ? cfg.color : "var(--border)"}`, background: filterCat === key ? cfg.bg : "var(--surface)", color: filterCat === key ? cfg.color : "var(--text-muted)", cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {/* Day of week headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--border)" }}>
          {DOW_DESKTOP.map((d, i) => (
            <div key={d} style={{ textAlign: "center", padding: "8px 0", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.04em" }}>
              <span className="desktop-only">{DOW_DESKTOP[i]}</span>
              <span className="mobile-only">{DOW_MOBILE[i]}</span>
            </div>
          ))}
        </div>

        {/* Cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {Array.from({ length: startDow }).map((_, i) => (
            <div key={`e${i}`} style={{ minHeight: "clamp(48px, 12vw, 100px)", borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "#fafaf8" }} />
          ))}

          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1;
            const iso = toISO(year, month, day);
            const isToday = iso === todayISO;
            const dayConflicts = getConflictsForDay(day);
            const { free } = getMemberMap(day);
            const allFree = members.length > 0 && free.length === members.length;

            return (
              <div key={day} onClick={() => onAddConflict(iso)}
                style={{ minHeight: "clamp(48px, 12vw, 100px)", borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "4px", cursor: "pointer", background: allFree ? "#f0fdf4" : "var(--surface)", position: "relative" }}
                onMouseEnter={e => (e.currentTarget.style.background = allFree ? "#dcfce7" : "var(--bg)")}
                onMouseLeave={e => (e.currentTarget.style.background = allFree ? "#f0fdf4" : "var(--surface)")}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ width: "clamp(18px, 5vw, 26px)", height: "clamp(18px, 5vw, 26px)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: isToday ? 800 : 500, fontSize: "clamp(10px, 3vw, 13px)", background: isToday ? "var(--text)" : "none", color: isToday ? "#fff" : "var(--text)" }}>{day}</span>
                  {allFree && members.length > 0 && <span style={{ fontSize: 8, color: "#2f9e44", fontWeight: 700 }} className="desktop-only">FREE</span>}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {dayConflicts.slice(0, 2).map(c => {
                    const cfg = CATEGORY_CONFIG[c.category];
                    const member = members.find(m => m.id === c.memberId);
                    return (
                      <div key={c.id} onClick={e => { e.stopPropagation(); onEditConflict(c); }}
                        style={{ padding: "1px 4px", borderRadius: 4, background: cfg.bg, color: cfg.color, fontSize: "clamp(8px, 2.5vw, 11px)", fontWeight: 600, display: "flex", alignItems: "center", gap: 3, cursor: "pointer", overflow: "hidden" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: member?.color || cfg.color, flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="desktop-only">{c.title}</span>
                        <span className="mobile-only">{cfg.label[0]}</span>
                      </div>
                    );
                  })}
                  {dayConflicts.length > 2 && <span style={{ fontSize: "clamp(7px, 2vw, 11px)", color: "var(--text-muted)", paddingLeft: 2 }}>+{dayConflicts.length - 2}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const navBtn: React.CSSProperties = { background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 7px", cursor: "pointer", display: "flex", alignItems: "center" };
