import { useCallback, useEffect, useState } from 'react';

const norm = (s) => String(s || '').trim().toLowerCase();

let cache = null;     // Set of normalized category names that need recipient details
let inflight = null;

function load() {
    if (cache) return Promise.resolve(cache);
    if (!inflight) {
        inflight = fetch(`${process.env.EXPO_PUBLIC_API_URL}/get_categories`)
            .then((res) => (res.ok ? res.json() : []))
            .then((cats) => {
                cache = new Set(
                    cats.filter((c) => c.requiresRecipientDetails).map((c) => norm(c.category))
                );
                return cache;
            })
            .catch(() => {
                inflight = null;
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

    // Case- and whitespace-insensitive
    const isFlower = useCallback((type) => flowerTypes.has(norm(type)), [flowerTypes]);

    return { flowerTypes, isFlower, ready };
}