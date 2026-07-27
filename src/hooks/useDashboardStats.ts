import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import {
  calculateOverallProgress,
  countByStatus,
  getCompletedHours,
  getTotalEstimatedHours,
} from '@/utils/progress';
import type { DashboardStats } from '@/types';

export function useDashboardStats(): DashboardStats {
  const nodes = useStore((s) => s.nodes);

  return useMemo(() => {
    const topics = nodes.filter((n) => n.type === 'topic');
    const projects = nodes.filter((n) => n.type === 'project');
    const learning = topics.filter((n) => n.status === 'learning');

    const sorted = [...nodes].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return {
      overallProgress: calculateOverallProgress(nodes),
      totalTopics: topics.length,
      completedTopics: countByStatus(nodes, 'completed'),
      learningTopics: countByStatus(nodes, 'learning'),
      revisionTopics: countByStatus(nodes, 'revision'),
      pendingTopics: countByStatus(nodes, 'not_started'),
      projectCount: projects.length,
      completedProjects: projects.filter((n) => n.status === 'completed').length,
      totalHours: getTotalEstimatedHours(topics),
      completedHours: getCompletedHours(topics),
      streak: 7,
      recentlyUpdated: sorted.slice(0, 5),
      currentTopic: learning[0] ?? null,
    };
  }, [nodes]);
}
