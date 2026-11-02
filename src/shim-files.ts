// Standalone shim for @instinct/files: persistence via window.localStorage.
import React, { useState, useEffect, useCallback } from 'react';

export function FileRouter({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

type Saved = { ready: boolean; status: string; message: string };

export function useLocalState<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void, Saved] {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw));
    } catch { /* storage blocked or corrupt: keep initial */ }
    setReady(true);
  }, [key]);
  const set = useCallback((v: T | ((p: T) => T)) => {
    setValue(prev => {
      const nv = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
      try { window.localStorage.setItem(key, JSON.stringify(nv)); } catch { /* ignore */ }
      return nv;
    });
  }, [key]);
  return [value, set, { ready, status: 'saved', message: '' }];
}
