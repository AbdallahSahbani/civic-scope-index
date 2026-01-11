import { useEffect, useState } from 'react';

export interface InterestEntity {
  id: string;
  name: string;
  party?: 'D' | 'R' | 'I' | string | null;
  entityType: string;
  photoUrl?: string;
  jurisdiction?: string;
  state?: string;
  role?: string;
}

const STORAGE_KEY = 'civic-roster-interests';

export function useInterests() {
  const [items, setItems] = useState<InterestEntity[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to parse interests from localStorage:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const persist = (next: InterestEntity[]) => {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const add = (entity: InterestEntity) => {
    if (items.find(i => i.id === entity.id)) return;
    persist([...items, entity]);
  };

  const remove = (id: string) => {
    persist(items.filter(i => i.id !== id));
  };

  const has = (id: string) => {
    return items.some(i => i.id === id);
  };

  return { items, add, remove, has, isLoaded };
}
