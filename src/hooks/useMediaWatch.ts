import { useEffect, useState } from 'react';

export type MediaEntityType = 'organization' | 'executive' | 'journalist';

export interface MediaWatchEntity {
  id: string;
  name: string;
  entityType: MediaEntityType;
  logoUrl?: string;
  parentCompany?: string;
  foundedYear?: number;
  headquarters?: string;
  reach?: string;
}

const STORAGE_KEY = 'civic-roster-media-watch';

export function useMediaWatch() {
  const [items, setItems] = useState<MediaWatchEntity[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to parse media watch from localStorage:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const persist = (next: MediaWatchEntity[]) => {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const add = (entity: MediaWatchEntity) => {
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
