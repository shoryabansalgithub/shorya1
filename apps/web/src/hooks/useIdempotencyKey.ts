import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface UseIdempotencyKeyReturn {
  key: string | null;
  clearKey: () => void;
  regenerateKey: () => void;
}

export function useIdempotencyKey(draftId: string): UseIdempotencyKeyReturn {
  const [key, setKey] = useState<string | null>(null);

  const storageKey = `idempotency_${draftId}`;

  // Initialize or fetch existing key
  useEffect(() => {
    // Prevent SSR errors by ensuring window is defined
    if (typeof window !== 'undefined') {
      const existing = sessionStorage.getItem(storageKey);
      if (existing) {
        setKey(existing);
      } else {
        const newKey = uuidv4();
        sessionStorage.setItem(storageKey, newKey);
        setKey(newKey);
      }
    }
  }, [draftId, storageKey]);

  const clearKey = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(storageKey);
      setKey(null);
    }
  }, [storageKey]);

  const regenerateKey = useCallback(() => {
    if (typeof window !== 'undefined') {
      const newKey = uuidv4();
      sessionStorage.setItem(storageKey, newKey);
      setKey(newKey);
    }
  }, [storageKey]);

  return { key, clearKey, regenerateKey };
}
