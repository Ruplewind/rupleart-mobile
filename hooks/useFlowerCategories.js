import { useEffect, useState } from 'react';

let cache = null; // Set of category names that need recipient details
let inflight = null;

function load() {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch(`${process.env.EXPO_PUBLIC_API_URL}/get_categories`)
      .then((res) => (res.ok ? res.json() : []))
      .then((cats) => {
        cache = new Set(cats.filter((c) => c.requiresRecipientDetails).map((c) => c.category));
        return cache;
      })
      .catch(() => {
        inflight = null; // allow a retry on next mount
        return new Set();
      });
  }
  return inflight;
}

export default function useFlowerCategories() {
  const [flowerTypes, setFlowerTypes] = useState(cache || new Set());
  const [ready, setReady] = useState(Boolean(cache));

  useEffect(() => {
    let alive = true;
    load().then((set) => {
      if (!alive) return;
      setFlowerTypes(set);
      setReady(true);
    });
    return () => { alive = false; };
  }, []);

  return { flowerTypes, ready };
}