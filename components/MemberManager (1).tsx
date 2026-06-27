"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import type { FamilyMember } from "@/lib/types";
import { MEMBER_COLORS, MEMBER_EMOJIS } from "@/lib/types";

interface Props {
  members: FamilyMember[];
  onAdd: (m: FamilyMember) => void;
  onUpdate: (m: FamilyMember) => void;
  onRemove: (id: string) => void;
}

function genId() { return Math.random().toString(36).slice(2); }

export default function MemberManager({ members, onAdd, onUpdate, onRemove }: Props) {
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(MEMBER_COLORS[0]);
  const [emoji, setEmoji] = useState(MEMBER_EMOJIS[0]);

  const usedColors = members.map(m => m.color);
  const nextColor = MEMBER_COLORS.find(c => !usedColors.includes(c)) || MEMBER_COLORS[0];
  const usedEmojis = members.map(m => m.emoji);
  const nextEmoji = MEMBER_EMOJIS.find(e => !usedEmojis.includes(e)) || MEMBER_EMOJIS[0];

  const startAdd = () => { setName(""); setColor(nextColor); setEmoji(nextEmoji); setAdding(true); setEditId(null); };
  const startEdit = (m: FamilyMember) => { setName(m.name); setColor(m.color); setEmoji(m.emoji); setEditId(m.id); setAdding(false); };
  const cancel = () => { setAdding(false); setEditId(null); };

  const submit = () => {
    if (!name.trim()) return;
    if (editId) {
      onUpdate({ id: editId, name: name.trim(), color, emoji });
    } else {
      onAdd({ id: genId(), name: name.trim(), color, emoji });
    }
    cancel();
  };

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Family Members</h2>
        {members.length < 6 && (
          <button onClick={startAdd} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "var(--text)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            <Plus size={15} /> Add Member
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {members.map(m => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--bg)", borderRadius: 10 }}>
            {editId === m.id ? (
              <MemberForm name={name} setName={setName} color={color} setColor={setColor} emoji={emoji} setEmoji={setEmoji} onSubmit={submit} onCancel={cancel} />
            ) : (
              <>
                <span style={{ fontSize: 22 }}>{m.emoji}</span>
                <span style={{ width: 14, height: 14, borderRadius: "50%", background: m.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontWeight: 600 }}>{m.name}</span>
                <button onClick={() => startEdit(m)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}><Pencil size={15} /></button>
                <button onClick={() => onRemove(m.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e64980", padding: 4 }}><Trash2 size={15} /></button>
              </>
            )}
          </div>
        ))}

        {adding && (
          <div style={{ padding: "12px 14px", background: "var(--bg)", borderRadius: 10 }}>
            <MemberForm name={name} setName={setName} color={color} setColor={setColor} emoji={emoji} setEmoji={setEmoji} onSubmit={submit} onCancel={cancel} />
          </div>
        )}

        {members.length === 0 && !adding && (
          <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center", padding: "16px 0" }}>No family members yet — add one to get started.</p>
        )}
      </div>
    </div>
  );
}

function MemberForm({ name, setName, color, setColor, emoji, setEmoji, onSubmit, onCancel }: {
  name: string; setName: (v: string) => void;
  color: string; setColor: (v: string) => void;
  emoji: string; setEmoji: (v: string) => void;
  onSubmit: () => void; onCancel: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, flexWrap: "wrap" }}>
      <select value={emoji} onChange={e => setEmoji(e.target.value)} style={selectStyle}>
        {MEMBER_EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
      </select>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" onKeyDown={e => e.key === "Enter" && onSubmit()} style={{ ...inputStyle, flex: 1 }} autoFocus />
      <div style={{ display: "flex", gap: 6 }}>
        {MEMBER_COLORS.map(c => (
          <button key={c} onClick={() => setColor(c)} style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: color === c ? "3px solid var(--text)" : "2px solid transparent", cursor: "pointer" }} />
        ))}
      </div>
      <button onClick={onSubmit} style={{ background: "var(--text)", color: "#fff", border: "none", borderRadius: 7, padding: "6px 10px", cursor: "pointer" }}><Check size={14} /></button>
      <button onClick={onCancel} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 7, padding: "6px 10px", cursor: "pointer" }}><X size={14} /></button>
    </div>
  );
}

const inputStyle: React.CSSProperties = { padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, background: "var(--surface)", color: "var(--text)", outline: "none" };
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };
