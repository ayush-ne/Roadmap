import { useMemo } from 'react';
import { useStore } from '@/store/useStore';

export function useAllTags(): string[] {
  const nodes = useStore((s) => s.nodes);

  return useMemo(() => {
    const tags = new Set<string>();
    nodes.forEach((n) => n.tags.forEach((t) => tags.add(t)));
    return [...tags].sort();
  }, [nodes]);
}
