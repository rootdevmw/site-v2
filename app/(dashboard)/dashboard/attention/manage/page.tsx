"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { showError, showSuccess } from "@/lib/toast";
import { useAllUsers } from "@/app/modules/users/hooks/useUsers";

/* ───────────────────────────── */
/* TYPES (defensive) */
/* ───────────────────────────── */

type PrayerWarrior = {
  userId: string;
  user?: {
    id: string;
    email?: string;
    member?: {
      firstName?: string;
      lastName?: string;
    } | null;
  } | null;
};

type UserOption = {
  id: string;
  email?: string;
  member?: {
    firstName?: string;
    lastName?: string;
  } | null;
};

export default function PrayerWarriorsPage() {
  const [warriors, setWarriors] = useState<PrayerWarrior[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  const { data: usersData } = useAllUsers({});
  const users: UserOption[] = usersData?.data ?? [];

  /* ───────────────────────────── */
  /* FETCH WARRIORS */
  /* ───────────────────────────── */

  async function fetchWarriors() {
    try {
      const res = await api.get("/attention/prayer-warriors");

      const safeData: PrayerWarrior[] = Array.isArray(res?.data?.data)
        ? res.data.data.filter((w: any) => w?.userId)
        : [];

      setWarriors(safeData);
    } catch {
      showError("Failed to load prayer warriors");
    }
  }

  useEffect(() => {
    fetchWarriors();
  }, []);

  /* ───────────────────────────── */
  /* ADD WARRIOR */
  /* ───────────────────────────── */

  async function addWarrior() {
    if (!selectedUserId) return;

    try {
      await api.post("/attention/prayer-warriors", {
        userId: selectedUserId,
      });

      showSuccess("Prayer warrior added");
      setSelectedUserId("");

      // optimistic-safe update (no flicker crash)
      const user = users.find((u) => u.id === selectedUserId);

      setWarriors((prev) => [
        ...prev,
        {
          userId: selectedUserId,
          user: user ?? null,
        },
      ]);
    } catch {
      showError("Failed to add warrior");
    }
  }

  /* ───────────────────────────── */
  /* REMOVE WARRIOR */
  /* ───────────────────────────── */

  async function removeWarrior(userId: string) {
    try {
      await api.delete(`/attention/prayer-warriors/${userId}`);

      showSuccess("Prayer warrior removed");

      setWarriors((prev) => prev.filter((w) => w.userId !== userId));
    } catch {
      showError("Failed to remove warrior");
    }
  }

  /* ───────────────────────────── */
  /* SAFE HELPERS */
  /* ───────────────────────────── */

  const getEmail = (w: PrayerWarrior) => w.user?.email ?? "Unknown";

  const getMemberName = (w: PrayerWarrior) => {
    const m = w.user?.member;
    if (!m?.firstName && !m?.lastName) return "No member linked";
    return `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim();
  };

  return (
    <div className="space-y-6">
      {/* ───────────────────────────── */}
      {/* ADD WARRIOR */}
      {/* ───────────────────────────── */}

      <div className="flex items-end gap-3">
        <div className="flex flex-col w-full max-w-md">
          <label className="text-xs text-[var(--text-secondary)] mb-1">
            Select User
          </label>

          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[var(--card-elevated)] border border-[var(--border-soft)] text-sm"
          >
            <option value="">Select a user</option>

            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email ?? "Unknown"}
                {u.member
                  ? ` (${u.member.firstName ?? ""} ${u.member.lastName ?? ""})`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={addWarrior}
          className="px-4 py-2 rounded-lg bg-[var(--main-gold)] text-black text-sm font-medium"
        >
          Add Warrior
        </button>
      </div>

      {/* ───────────────────────────── */}
      {/* TABLE */}
      {/* ───────────────────────────── */}

      <div className="rounded-xl border border-[var(--border-soft)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--card-elevated)] text-left">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Member</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {warriors.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="p-4 text-center text-[var(--text-secondary)]"
                >
                  No prayer warriors assigned
                </td>
              </tr>
            ) : (
              warriors.map((w) => (
                <tr
                  key={w.userId}
                  className="border-t border-[var(--border-soft)]"
                >
                  <td className="p-3">{getEmail(w)}</td>

                  <td className="p-3">{getMemberName(w)}</td>

                  <td className="p-3 text-right">
                    <button
                      onClick={() => removeWarrior(w.userId)}
                      className="px-3 py-1 text-xs rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
