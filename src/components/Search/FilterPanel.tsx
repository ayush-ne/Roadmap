import { useState } from 'react';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAllTags } from '@/hooks/useAllTags';
import { STATUS_CONFIG, type NodeStatus } from '@/types';

const ALL_STATUSES: NodeStatus[] = [
  'completed',
  'learning',
  'revision',
  'not_started',
  'blocked',
];

export default function FilterPanel() {
  const [expanded, setExpanded] = useState(false);
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const resetFilters = useStore((s) => s.resetFilters);
  const allTags = useAllTags();

  const activeCount =
    filters.statuses.length +
    filters.tags.length +
    filters.difficulty.length +
    filters.confidence.length +
    (filters.searchQuery ? 1 : 0);

  const toggleStatus = (status: NodeStatus) => {
    const statuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    setFilters({ statuses });
  };

  const toggleTag = (tag: string) => {
    const tags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    setFilters({ tags });
  };

  return (
    <div className="w-64 rounded-xl border border-surface-border bg-surface/95 shadow-lg backdrop-blur-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium"
      >
        <span className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5" />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] text-white">
              {activeCount}
            </span>
          )}
        </span>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-surface-border px-3 py-3">
          <div>
            <p className="section-title mb-1.5">Status</p>
            <div className="flex flex-wrap gap-1">
              {ALL_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={`badge text-[10px] transition-opacity ${
                    filters.statuses.includes(status)
                      ? 'ring-1 ring-accent opacity-100'
                      : 'opacity-50 hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: STATUS_CONFIG[status].bgColor,
                    color: STATUS_CONFIG[status].color,
                  }}
                >
                  {STATUS_CONFIG[status].emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="section-title mb-1.5">Tags</p>
            <div className="flex max-h-24 flex-wrap gap-1 overflow-y-auto">
              {allTags.slice(0, 12).map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`badge bg-surface-elevated text-[10px] ${
                    filters.tags.includes(tag) ? 'ring-1 ring-accent' : 'opacity-60'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="section-title mb-1.5">Difficulty</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    const difficulty = filters.difficulty.includes(d)
                      ? filters.difficulty.filter((x) => x !== d)
                      : [...filters.difficulty, d];
                    setFilters({ difficulty });
                  }}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs ${
                    filters.difficulty.includes(d)
                      ? 'bg-accent text-white'
                      : 'bg-surface-elevated'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={filters.showProjects}
              onChange={(e) => setFilters({ showProjects: e.target.checked })}
              className="rounded accent-accent"
            />
            Show Projects
          </label>

          {activeCount > 0 && (
            <button
              onClick={resetFilters}
              className="w-full rounded-lg py-1.5 text-xs text-red-500 hover:bg-red-500/10"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
