import { useEffect, useState } from "react";
import { listProperties, type Property } from "@/services/properties";

export function useActiveProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listProperties()
      .then((data) => {
        if (cancelled) return;
        setProperties(
          (data || [])
            .filter((p) => p.status === "ACTIVE")
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        setError(null);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load properties");
          setProperties([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { properties, loading, error };
}
