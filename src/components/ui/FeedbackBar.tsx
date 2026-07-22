"use client";

import { useState } from "react";
import { C, FONT } from "@/lib/tokens";
import { getBrowserClient } from "@/lib/supabase/client";

type Rating = "up" | "down";

const REASONS: Record<Rating, string[]> = {
  up: ["Genau richtig", "Spart mir Zeit", "Besser als erwartet"],
  down: ["Zu allgemein", "Falsche Annahmen", "Format passt nicht", "Zu langsam"],
};

/**
 * Zwei Klicks, kein Formular: Der erste Klick auf Daumen hoch/runter speichert
 * bereits eine Zeile. Grund und Kommentar aktualisieren sie danach nur noch —
 * so geht auch abgebrochenes Feedback nicht verloren.
 */
export function FeedbackBar({ module, label }: { module: string; label: string }) {
  const [rating, setRating] = useState<Rating | null>(null);
  const [rowId, setRowId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [showComment, setShowComment] = useState(false);
  const [commentSent, setCommentSent] = useState(false);
  const [err, setErr] = useState("");

  async function rate(value: Rating) {
    if (rating) return;
    setRating(value); setErr("");
    try {
      const supabase = getBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("feedback")
        .insert({ user_id: user.id, module, rating: value })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      if (data) setRowId(data.id as number);
    } catch {
      setErr("Konnte nicht gespeichert werden.");
    }
  }

  async function patch(fields: { reason?: string; comment?: string }) {
    if (!rowId) return;
    try {
      const { error } = await getBrowserClient().from("feedback").update(fields).eq("id", rowId);
      if (error) throw new Error(error.message);
    } catch {
      setErr("Konnte nicht gespeichert werden.");
    }
  }

  async function pickReason(r: string) {
    const next = reason === r ? "" : r;
    setReason(next);
    await patch({ reason: next || undefined });
  }

  async function sendComment() {
    if (!comment.trim()) return;
    await patch({ comment: comment.trim() });
    setCommentSent(true);
  }

  const wrap: React.CSSProperties = {
    marginTop: 32, paddingTop: 18, borderTop: `1px solid ${C.line}`,
    fontFamily: FONT, color: C.ink,
  };
  const thumb = (value: Rating, glyph: string, aria: string) => {
    const active = rating === value;
    return (
      <button
        key={value}
        onClick={() => rate(value)}
        disabled={!!rating}
        aria-label={aria}
        style={{
          background: active ? C.accentSoft : "transparent",
          border: `1px solid ${active ? C.accent : C.line}`,
          color: active ? C.accent : C.inkSoft,
          borderRadius: 9, padding: "6px 13px", fontSize: 15,
          cursor: rating ? "default" : "pointer", fontFamily: FONT, lineHeight: 1.2,
        }}>
        {glyph}
      </button>
    );
  };
  const chip = (r: string) => (
    <button
      key={r}
      onClick={() => pickReason(r)}
      style={{
        background: reason === r ? C.accentSoft : C.card,
        border: `1px solid ${reason === r ? C.accent : C.line}`,
        color: reason === r ? C.accent : C.inkSoft,
        borderRadius: 999, padding: "6px 12px", fontSize: 12.5,
        fontWeight: 600, cursor: "pointer", fontFamily: FONT,
      }}>
      {r}
    </button>
  );

  return (
    <div style={wrap}>
      {!rating ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: C.inkSoft }}>War {label} hilfreich?</span>
          {thumb("up", "👍", "Ja, war hilfreich")}
          {thumb("down", "👎", "Nein, war nicht hilfreich")}
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 10 }}>
            Danke. {rating === "up" ? "Was hat gepasst?" : "Was hat gefehlt?"} <span style={{ color: C.faint }}>(optional)</span>
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>
            {REASONS[rating].map(chip)}
          </div>

          {!showComment && !commentSent && (
            <button
              onClick={() => setShowComment(true)}
              style={{ background: "transparent", border: "none", color: C.accent, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: FONT }}>
              Mehr dazu sagen →
            </button>
          )}

          {showComment && !commentSent && (
            <div style={{ marginTop: 4 }}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Was genau war gut oder störend?"
                style={{
                  width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10,
                  border: `1px solid ${C.line}`, fontSize: 13.5, fontFamily: FONT, resize: "vertical", marginBottom: 8,
                }}
              />
              <button
                onClick={sendComment}
                disabled={!comment.trim()}
                className={comment.trim() ? "tom-btnP" : undefined}
                style={{
                  background: comment.trim() ? C.accent : C.surface2,
                  color: comment.trim() ? "#fff" : C.faint,
                  border: "none", padding: "8px 15px", borderRadius: 9, fontSize: 13,
                  fontWeight: 600, cursor: comment.trim() ? "pointer" : "default", fontFamily: FONT,
                }}>
                Senden
              </button>
            </div>
          )}

          {commentSent && (
            <div style={{ fontSize: 12.5, color: C.faktFg, fontWeight: 600 }}>✓ Angekommen — danke.</div>
          )}

          {err && <div style={{ fontSize: 12.5, color: C.signalFg, marginTop: 8 }}>{err}</div>}
        </div>
      )}
    </div>
  );
}
