import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export interface SystemSettings {
  system_name: string;
  location: string;
  google_map: string;
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
}

export function useSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiFetch("/landingpage/1", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return { settings, loading };
}
