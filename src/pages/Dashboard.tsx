import { motion } from 'framer-motion';
import {
  TrendingUp,
  CheckCircle2,
  BookOpen,
  FolderGit2,
  Clock,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { STATUS_CONFIG } from '@/types';

export default function DashboardPage() {
  const stats = useDashboardStats();
  const selectNode = useStore((s) => s.selectNode);
  const navigate = useNavigate();

  const cards = [
    {
      label: 'Overall Progress',
      value: `${stats.overallProgress}%`,
      icon: TrendingUp,
      color: 'text-accent',
      bg: 'bg-accent-muted',
    },
    {
      label: 'Topics Completed',
      value: `${stats.completedTopics}/${stats.totalTopics}`,
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-500/15',
    },
    {
      label: 'Currently Learning',
      value: String(stats.learningTopics),
      icon: BookOpen,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/15',
    },
    {
      label: 'Projects',
      value: `${stats.completedProjects}/${stats.projectCount}`,
      icon: FolderGit2,
      color: 'text-purple-400',
      bg: 'bg-purple-500/15',
    },
    {
      label: 'Learning Hours',
      value: `${stats.completedHours}/${stats.totalHours}h`,
      icon: Clock,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/15',
    },
    {
      label: 'Streak',
      value: `${stats.streak} days`,
      icon: Flame,
      color: 'text-orange-500',
      bg: 'bg-orange-500/15',
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Your learning progress at a glance
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card"
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2.5 ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">{card.label}</p>
                  <p className="text-xl font-bold">{card.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Topic */}
          <div className="card">
            <h2 className="mb-4 font-semibold">Current Topic</h2>
            {stats.currentTopic ? (
              <button
                onClick={() => {
                  selectNode(stats.currentTopic!.id);
                  navigate('/');
                }}
                className="flex w-full items-center gap-3 rounded-lg bg-surface-elevated p-4 text-left transition-colors hover:bg-accent-muted"
              >
                <span className="text-2xl">
                  {STATUS_CONFIG[stats.currentTopic.status].emoji}
                </span>
                <div className="flex-1">
                  <p className="font-semibold">{stats.currentTopic.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {stats.currentTopic.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-accent" />
              </button>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">
                No topics currently in learning status
              </p>
            )}
          </div>

          {/* Status Breakdown */}
          <div className="card">
            <h2 className="mb-4 font-semibold">Status Breakdown</h2>
            <div className="space-y-3">
              {(
                [
                  ['completed', stats.completedTopics],
                  ['learning', stats.learningTopics],
                  ['revision', stats.revisionTopics],
                  ['not_started', stats.pendingTopics],
                ] as const
              ).map(([status, count]) => {
                const config = STATUS_CONFIG[status];
                const pct =
                  stats.totalTopics > 0
                    ? Math.round((count / stats.totalTopics) * 100)
                    : 0;
                return (
                  <div key={status}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>
                        {config.emoji} {config.label}
                      </span>
                      <span className="text-[var(--color-text-muted)]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: config.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recently Updated */}
        <div className="card">
          <h2 className="mb-4 font-semibold">Recently Updated</h2>
          <div className="space-y-2">
            {stats.recentlyUpdated.map((node) => (
              <button
                key={node.id}
                onClick={() => {
                  selectNode(node.id);
                  navigate('/');
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-surface-elevated"
              >
                <span>{STATUS_CONFIG[node.status].emoji}</span>
                <span className="flex-1 font-medium">{node.title}</span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {new Date(node.updatedAt).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
