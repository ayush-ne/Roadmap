import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useStore } from '@/store/useStore';
import {
  calculateOverallProgress,
  getCategoryBreakdown,
  getConfidenceDistribution,
  countByStatus,
} from '@/utils/progress';
import { STATUS_CONFIG } from '@/types';

const CONFIDENCE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#6366f1'];

export default function StatisticsPage() {
  const nodes = useStore((s) => s.nodes);
  const categories = useStore((s) => s.categories);

  const topics = nodes.filter((n) => n.type === 'topic');
  const projects = nodes.filter((n) => n.type === 'project');

  const categoryData = getCategoryBreakdown(nodes, categories).filter((c) => c.count > 0);

  const statusData = (
    ['completed', 'learning', 'revision', 'not_started', 'blocked'] as const
  ).map((status) => ({
    name: STATUS_CONFIG[status].label,
    value: countByStatus(nodes, status),
    color: STATUS_CONFIG[status].color,
  })).filter((d) => d.value > 0);

  const confidenceDist = getConfidenceDistribution(topics);
  const confidenceData = Object.entries(confidenceDist).map(([level, count]) => ({
    name: `${level} Star${Number(level) > 1 ? 's' : ''}`,
    value: count,
    color: CONFIDENCE_COLORS[Number(level) - 1],
  }));

  const trendData = [
    { month: 'Jan', topics: 5 },
    { month: 'Feb', topics: 12 },
    { month: 'Mar', topics: 18 },
    { month: 'Apr', topics: 25 },
    { month: 'May', topics: countByStatus(nodes, 'completed') },
  ];

  const mostStudied = [...topics]
    .sort((a, b) => b.estimatedHours - a.estimatedHours)
    .slice(0, 5);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Statistics</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Detailed analytics of your learning journey
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: 'Total Topics', value: topics.length },
            { label: 'Completed', value: countByStatus(nodes, 'completed') },
            { label: 'Projects', value: projects.length },
            { label: 'Overall', value: `${calculateOverallProgress(nodes)}%` },
          ].map((stat) => (
            <div key={stat.label} className="card text-center">
              <p className="text-xs text-[var(--color-text-muted)]">{stat.label}</p>
              <p className="text-2xl font-bold text-accent">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Progress by Category */}
          <div className="card">
            <h2 className="mb-4 font-semibold">Progress by Category</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="progress" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="card">
            <h2 className="mb-4 font-semibold">Status Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Learning Trend */}
          <div className="card">
            <h2 className="mb-4 font-semibold">Learning Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="topics"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-accent)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Confidence Distribution */}
          <div className="card">
            <h2 className="mb-4 font-semibold">Confidence Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {confidenceData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Studied Topics */}
        <div className="card">
          <h2 className="mb-4 font-semibold">Most Studied Topics</h2>
          <div className="space-y-2">
            {mostStudied.map((node, i) => (
              <div
                key={node.id}
                className="flex items-center gap-3 rounded-lg bg-surface-elevated px-3 py-2"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-muted text-xs font-bold text-accent">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-medium">{node.title}</span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {node.estimatedHours}h
                </span>
                <span>{STATUS_CONFIG[node.status].emoji}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
