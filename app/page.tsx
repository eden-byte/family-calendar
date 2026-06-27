"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useAppState } from "@/lib/store";
import MemberManager from "@/components/MemberManager";
import CalendarView from "@/components/CalendarView";
import AvailabilityView from "@/components/AvailabilityView";
import ConflictModal from "@/components/ConflictModal";
import type { Conflict } from "@/lib/types";
import { Users, Calendar, LayoutGrid } from "lucide-react";

type Tab = "calendar" | "availability" | "members";

export default function Home() {
  const { state, loaded, error, addMember, updateMember, removeMember, addConflict, addConflicts, updateConflict, removeConflict } = useAppState();
  const [tab, setTab] = useState<Tab>("calendar");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingConflict, setEditingConflict] = useState<Conflict | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | undefined>();

  if (!loaded) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--text-muted)", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 32 }}>🏠</div>
      <p style={{ fontWeight: 600 }}>Loading family calendar…</p>
    </div>
  );

  if (error) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#e64980", flexDirection: "column", gap: 12, padding: 24, textAlign: "center" }}>
      <p style={{ fontWeight: 700, fontSize: 18 }}>⚠️ Connection Error</p>
      <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 400 }}>{error}<br /><br />Make sure your <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> environment variables are set.</p>
    </div>
  );

  const openAdd = (date?: string) => { setEditingConflict(null); setDefaultDate(date); setModalOpen(true); };
  const openEdit = (c: Conflict) => { setEditingConflict(c); setModalOpen(true); };

  const handleSave = async (conflicts: Conflict[]) => {
    if (editingConflict && conflicts.length === 1) {
      await updateConflict(conflicts[0]);
    } else if (conflicts.length === 1) {
      await addConflict(conflicts[0]);
    } else {
      await addConflicts(conflicts);
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await removeConflict(id);
    setModalOpen(false);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "calendar", label: "Calendar", icon: <Calendar size={16} /> },
    { id: "availability", label: "Availability", icon: <LayoutGrid size={16} /> },
    { id: "members", label: "Members", icon: <Users size={16} /> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "0 24px", display: "flex", alignItems: "center", gap: 24, height: 60, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 8 }}>
          <span style={{ fontSize: 22 }}>🏠</span>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em" }}>Family Calendar</span>
        </div>
        <nav style={{ display: "flex", gap: 4 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 8, border: "none", background: tab === t.id ? "var(--text)" : "none", color: tab === t.id ? "#fff" : "var(--text-muted)", cursor: "pointer", fontWeight: 600, fontSize: 14, transition: "all .15s" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </nav>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {state.members.map(m => (
            <span key={m.id} title={m.name} style={{ width: 32, height: 32, borderRadius: "50%", background: m.color + "22", border: `2px solid ${m.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{m.emoji}</span>
          ))}
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        {tab === "calendar" && (
          state.members.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>👨‍👩‍👧‍👦</p>
              <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Start by adding your family members</p>
              <p style={{ fontSize: 14, marginBottom: 24 }}>Go to the Members tab to set up your family.</p>
              <button onClick={() => setTab("members")} style={{ padding: "10px 20px", background: "var(--text)", color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontWeight: 700 }}>Add Members</button>
            </div>
          ) : (
            <CalendarView members={state.members} conflicts={state.conflicts} onAddConflict={openAdd} onEditConflict={openEdit} />
          )
        )}
        {tab === "availability" && <AvailabilityView members={state.members} conflicts={state.conflicts} />}
        {tab === "members" && <MemberManager members={state.members} onAdd={addMember} onUpdate={updateMember} onRemove={removeMember} />}
      </main>

      {modalOpen && state.members.length > 0 && (
        <ConflictModal members={state.members} conflict={editingConflict} defaultDate={defaultDate} onSave={handleSave} onDelete={handleDelete} onClose={() => setModalOpen(false)} />
      )}
      {modalOpen && state.members.length === 0 && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "var(--surface)", borderRadius: 16, padding: 32, textAlign: "center" }}>
            <p style={{ fontWeight: 700, marginBottom: 12 }}>Add family members first!</p>
            <button onClick={() => { setModalOpen(false); setTab("members"); }} style={{ padding: "10px 20px", background: "var(--text)", color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontWeight: 700 }}>Go to Members</button>
          </div>
        </div>
      )}
    </div>
  );
}
