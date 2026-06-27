"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Conflict, FamilyMember } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/types";

interface Props {
  members: FamilyMember[];
  conflicts: Conflict[];
}

function toISO(d: Date) { return d.toISOString().slice(0, 10); }
function isoToDate(s: string) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

const DOW_SHORT = ["S","M","T","W","T","F","S"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AvailabilityView({ members, conflicts }: Props) {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0,0,0,0);
    return d;
  });

  const days = Array.from({ length: 14 }, (_, i) => addDays(weekStart, i));
  const todayISO = toISO(new Date());

  const getBusyConflicts = (memberId: string, day: Date) => {
    const iso = toISO(day);
    return conflicts.filter(c => {
      if (c.memberId !== memberId) return false;
      const s = isoToDate(c.startDate), e = isoToDate(c.endDate);
      return day >= s && day <= e;
    });
  };

  const allFreeOnDay = (day: Date) => members.length > 0 && members.every(m => getBusyConflicts(m.id, day).length === 0);

  const prevWeek = () => setWeekStart(d => addDays(d, -7));
  const nextWeek = () => setWeekStart(d => addDays(d, 7));
  const goToday = () => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); setWeekStart(d); };

  if (members.length === 0) return (
    <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
      <p style={{ fontSize: 16 }}>Add family members to see the availability grid.</p>
    </div>
  );

  // Group days by month label
  const monthLabel = () => {
    const start = days[0], end = days[days.length - 1];
    if (start.getMonth() === end.getMonth()) return `${MONTH_NAMES[start.getMonth()]} ${start.getFullYear()}`;
    return `${MONTH_NAMES[start.getMonth()]} – ${MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`;
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={prevWeek} style={navBtn}><ChevronLeft size={18} /></button>
        <h2 style={{ fontSize: 20, fontWeight: 800, minWidth: 220 }}>{monthLabel()}</h2>
        <button onClick={nextWeek} style={navBtn}><ChevronRight size={18} /></button>
        <button onClick={goToday} style={{ padding: "6px 12px", border: "1px solid var(--border)", borderRadius: 7, background: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Today</button>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>2-week view</span>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead>
            <tr>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "var(--text-muted)", borderBottom: "1px solid var(--border)", width: 120 }}>Member</th>
              {days.map((d, i) => {
                const iso = toISO(d);
                const isToday = iso === todayISO;
                const allFree = allFreeOnDay(d);
                return (
                  <th key={i} style={{ padding: "10px 6px", textAlign: "center", borderBottom: "1px solid var(--border)", background: allFree ? "#f0fdf4" : isToday ? "#f5f5ff" : "none", minWidth: 52 }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{DOW_SHORT[d.getDay()]}</div>
                    <div style={{ fontSize: 14, fontWeight: isToday ? 800 : 600, width: 28, height: 28, borderRadius: "50%", background: isToday ? "var(--text)" : "none", color: isToday ? "#fff" : "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", margin: "2px auto 0" }}>{d.getDate()}</div>
                    {allFree && <div style={{ fontSize: 9, color: "#2f9e44", fontWeight: 700, marginTop: 2 }}>FREE</div>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {members.map((member, mi) => (
              <tr key={member.id} style={{ borderBottom: mi < members.length - 1 ? "1px solid var(--border)" : "none" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{member.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{member.name}</div>
                      <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                        {/* conflict count this fortnight */}
                        {(() => {
                          const cnt = days.filter(d => getBusyConflicts(member.id, d).length > 0).length;
                          return <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{cnt} busy day{cnt !== 1 ? "s" : ""}</span>;
                        })()}
                      </div>
                    </div>
                  </div>
                </td>
                {days.map((d, di) => {
                  const busy = getBusyConflicts(member.id, d);
                  const isFree = busy.length === 0;
                  return (
                    <td key={di} style={{ padding: 4, textAlign: "center", background: allFreeOnDay(d) ? "#f0fdf4" : toISO(d) === todayISO ? "#f5f5ff" : "none" }}>
                      {isFree ? (
                        <div title="Free" style={{ width: 28, height: 28, borderRadius: 7, background: member.color + "22", border: `1.5px solid ${member.color}44`, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 10, color: member.color, fontWeight: 700 }}>✓</span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
                          {busy.slice(0, 2).map(c => {
                            const cfg = CATEGORY_CONFIG[c.category];
                            return (
                              <div key={c.id} title={`${c.title} (${cfg.label})`} style={{ width: 28, height: 14, borderRadius: 4, background: cfg.bg, border: `1.5px solid ${cfg.color}88`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontSize: 8, color: cfg.color, fontWeight: 700 }}>{cfg.label[0]}</span>
                              </div>
                            );
                          })}
                          {busy.length > 2 && <span style={{ fontSize: 9, color: "var(--text-muted)" }}>+{busy.length - 2}</span>}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
        <LegendItem color="#2f9e44" bg="#f0fdf4" label="All family free" />
        {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <LegendItem key={k} color={v.color} bg={v.bg} label={v.label} />)}
        <LegendItem color="#888" bg="#f5f5f5" label="Free (✓)" />
      </div>
    </div>
  );
}

function LegendItem({ color, bg, label }: { color: string; bg: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
      <span style={{ width: 14, height: 14, borderRadius: 4, background: bg, border: `1.5px solid ${color}`, display: "inline-block" }} />
      {label}
    </div>
  );
}

const navBtn: React.CSSProperties = { background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center" };
