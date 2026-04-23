import { api } from "@/lib/api/client";
import { useEffect, useState } from "react";

export function useAttentionNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    prayers: 0,
    visitors: 0,
  });

  const [prayers, setPrayers] = useState<any[]>([]);
  const [visitors, setVisitors] = useState<any[]>([]);

  async function fetchNotifications() {
    const res = await api.get("/attention/manage");

    const { prayers, visitors, counts } = res.data.data;

    setCounts(counts);
    setPrayers(prayers);
    setVisitors(visitors);

    const merged = [
      ...prayers.map((p: any) => ({
        id: p.id,
        type: "prayer",
        name: p.name || "Anonymous",
        createdAt: p.createdAt,
      })),
      ...visitors.map((v: any) => ({
        id: v.id,
        type: "visitor",
        name: v.name,
        createdAt: v.createdAt,
      })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    setNotifications(merged.slice(0, 5));
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    prayers,
    visitors,
    counts,
  };
}
