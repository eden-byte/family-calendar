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

  const startAdd = () => { setName(""); setColor(nextColor); setEmoji(MEMBER_EMOJIS[0]); setAdding(true); setEditId(null); };
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
          <div key={m.id} style={{ display: "flex", flexDirection: "column", background: "var(--bg)", borderRadius: 10, overflow: "hidden" }}>
            {editId === m.id ? (
              <div style={{ padding: "14px" }}>
                <MemberForm name={name} setName={setName} color={color} setColor={setColor} emoji={emoji} setEmoji={setEmoji} onSubmit={submit} onCancel={cancel} />
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
                <span style={{ fontSize: 22 }}>{m.emoji}</span>
                <span style={{ width: 14, height: 14, borderRadius: "50%", background: m.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontWeight: 600 }}>{m.name}</span>
                <button onClick={() => startEdit(m)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}><Pencil size={15} /></button>
                <button onClick={() => onRemove(m.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e64980", padding: 4 }}><Trash2 size={15} /></button>
              </div>
            )}
          </div>
        ))}

        {adding && (
          <div style={{ padding: "14px", background: "var(--bg)", borderRadius: 10 }}>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Name */}
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" onKeyDown={e => e.key === "Enter" && onSubmit()} style={inputStyle} autoFocus />

      {/* Emoji grid */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Pick an emoji</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxHeight: 140, overflowY: "auto", padding: 4, background: "var(--surface)", borderRadius: 8, border: "1px solid var(--border)" }}>
          {MEMBER_EMOJIS.map(e => (
            <button key={e} onClick={() => setEmoji(e)} style={{ width: 36, height: 36, borderRadius: 7, border: `2px solid ${emoji === e ? "var(--text)" : "transparent"}`, background: emoji === e ? "var(--bg)" : "none", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Color + actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Color</div>
        <div style={{ display: "flex", gap: 6, flex: 1 }}>
          {MEMBER_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} style={{ width: 24, height: 24, borderRadius: "50%", background: c, border: color === c ? "3px solid var(--text)" : "2px solid transparent", cursor: "pointer" }} />
          ))}
        </div>
        <button onClick={onSubmit} style={{ background: "var(--text)", color: "#fff", border: "none", borderRadius: 7, padding: "7px 12px", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
          <Check size={14} />
        </button>
        <button onClick={onCancel} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 7, padding: "7px 12px", cursor: "pointer" }}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, background: "var(--surface)", color: "var(--text)", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
