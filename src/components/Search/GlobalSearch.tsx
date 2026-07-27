import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { STATUS_CONFIG } from '@/types';

interface GlobalSearchProps {
  compact?: boolean;
}

export default function GlobalSearch({ compact }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const nodes = useStore((s) => s.nodes);
  const selectNode = useStore((s) => s.selectNode);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const results = query.trim()
    ? nodes.filter((node) => {
        const q = query.toLowerCase();
        const searchable = [
          node.title,
          node.description,
          ...node.tags,
          ...node.notes.map((n) => n.content),
          ...node.resources.map((r) => r.title),
          ...node.github.map((g) => g.title),
        ]
          .join(' ')
          .toLowerCase();
        return searchable.includes(q);
      }).slice(0, 8)
    : [];

  const handleSelect = (nodeId: string) => {
    selectNode(nodeId);
    setOpen(false);
    setQuery('');
    navigate('/');
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 rounded-lg bg-surface-elevated px-3 py-1.5 text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search...</span>
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-surface-border bg-surface p-3 shadow-2xl">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-[var(--color-text-muted)]" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search topics, tags, notes..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && results[0]) handleSelect(results[0].id);
                  }}
                />
                {query && (
                  <button onClick={() => setQuery('')}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {results.length > 0 && (
                <div className="mt-2 max-h-60 overflow-y-auto">
                  {results.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => handleSelect(node.id)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-surface-elevated"
                    >
                      <span>{STATUS_CONFIG[node.status].emoji}</span>
                      <span className="truncate">{node.title}</span>
                      {node.type === 'project' && (
                        <span className="ml-auto text-[10px] text-purple-400">Project</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {query && results.length === 0 && (
                <p className="mt-2 text-center text-xs text-[var(--color-text-muted)]">
                  No results found
                </p>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
}

export function SearchResults() {
  const [query, setQuery] = useState('');
  const nodes = useStore((s) => s.nodes);
  const selectNode = useStore((s) => s.selectNode);
  const navigate = useNavigate();

  const results = query.trim()
    ? nodes.filter((node) => {
        const q = query.toLowerCase();
        const searchable = [
          node.title,
          node.description,
          ...node.tags,
          ...node.notes.map((n) => n.content),
          ...node.resources.map((r) => r.title),
          ...node.github.map((g) => g.title),
        ]
          .join(' ')
          .toLowerCase();
        return searchable.includes(q);
      })
    : nodes;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Search across topics, tags, projects, resources, and notes
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by topic, tag, project, resource, notes, GitHub..."
          className="input-field pl-10 text-base"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs text-[var(--color-text-muted)]">
          {results.length} result{results.length !== 1 ? 's' : ''}
        </p>
        {results.map((node) => (
          <button
            key={node.id}
            onClick={() => {
              selectNode(node.id);
              navigate('/');
            }}
            className="card flex w-full items-start gap-3 text-left transition-colors hover:border-accent/50"
          >
            <span className="text-lg">{STATUS_CONFIG[node.status].emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{node.title}</p>
              <p className="truncate text-sm text-[var(--color-text-muted)]">
                {node.description || 'No description'}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {node.tags.map((tag) => (
                  <span key={tag} className="badge bg-surface-elevated text-[10px]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {node.type === 'project' && (
              <span className="badge bg-purple-500/15 text-purple-400">Project</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
