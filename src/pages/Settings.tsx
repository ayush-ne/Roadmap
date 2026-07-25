import { useRef } from 'react';
import {
  Upload,
  RotateCcw,
  Sun,
  Moon,
  LayoutGrid,
  Maximize2,
  FileJson,
  FileText,
  Image,
  FileType,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ACCENT_COLORS } from '@/types';
import { isReadOnlyBuild } from '@/utils/env';
import {
  exportToJSON,
  exportToMarkdown,
  exportToPNG,
  exportToPDF,
  downloadFile,
  importFromJSON,
} from '@/utils/export';

export default function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const nodes = useStore((s) => s.nodes);
  const categories = useStore((s) => s.categories);
  const edges = useStore((s) => s.edges);
  const customEdges = useStore((s) => s.customEdges);
  const updateSettings = useStore((s) => s.updateSettings);
  const importData = useStore((s) => s.importData);
  const resetToDefault = useStore((s) => s.resetToDefault);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = importFromJSON(ev.target?.result as string);
      if (result) {
        importData(result.nodes, result.categories, result.edges, result.customEdges);
        alert('Data imported successfully!');
      } else {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Customize your learning graph experience
          </p>
        </div>

        {/* Appearance */}
        <section className="card space-y-4">
          <h2 className="font-semibold">Appearance</h2>

          <div>
            <p className="section-title mb-2">Theme</p>
            <div className="flex gap-2">
              <button
                onClick={() => updateSettings({ theme: 'light' })}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${
                  settings.theme === 'light'
                    ? 'bg-accent text-white'
                    : 'bg-surface-elevated'
                }`}
              >
                <Sun className="h-4 w-4" /> Light
              </button>
              <button
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${
                  settings.theme === 'dark'
                    ? 'bg-accent text-white'
                    : 'bg-surface-elevated'
                }`}
              >
                <Moon className="h-4 w-4" /> Dark
              </button>
            </div>
          </div>

          <div>
            <p className="section-title mb-2">Accent Color</p>
            <div className="flex flex-wrap gap-2">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => updateSettings({ accentColor: color })}
                  className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                    settings.accentColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-surface' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="section-title mb-2">View Mode</p>
            <div className="flex gap-2">
              <button
                onClick={() => updateSettings({ viewMode: 'compact' })}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${
                  settings.viewMode === 'compact'
                    ? 'bg-accent text-white'
                    : 'bg-surface-elevated'
                }`}
              >
                <LayoutGrid className="h-4 w-4" /> Compact
              </button>
              <button
                onClick={() => updateSettings({ viewMode: 'expanded' })}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${
                  settings.viewMode === 'expanded'
                    ? 'bg-accent text-white'
                    : 'bg-surface-elevated'
                }`}
              >
                <Maximize2 className="h-4 w-4" /> Expanded
              </button>
            </div>
          </div>
        </section>

        {/* Export */}
        <section className="card space-y-4">
          <h2 className="font-semibold">Export</h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Export your knowledge graph in various formats
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                downloadFile(
                  exportToJSON(nodes, categories, edges, customEdges),
                  'knowledge-graph.json',
                  'application/json'
                )
              }
              className="btn-secondary justify-center"
            >
              <FileJson className="h-4 w-4" /> JSON
            </button>
            <button
              onClick={() =>
                downloadFile(
                  exportToMarkdown(nodes, categories),
                  'knowledge-graph.md',
                  'text/markdown'
                )
              }
              className="btn-secondary justify-center"
            >
              <FileText className="h-4 w-4" /> Markdown
            </button>
            <button
              onClick={() => {
                const el = document.querySelector('.react-flow') as HTMLElement;
                if (el) exportToPNG(el);
              }}
              className="btn-secondary justify-center"
            >
              <Image className="h-4 w-4" /> PNG
            </button>
            <button
              onClick={() => {
                const el = document.querySelector('.react-flow') as HTMLElement;
                if (el) exportToPDF(el);
              }}
              className="btn-secondary justify-center"
            >
              <FileType className="h-4 w-4" /> PDF
            </button>
          </div>
        </section>

        {/* Import */}
        <section className="card space-y-4">
          <h2 className="font-semibold">Import & Reset</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary"
            >
              <Upload className="h-4 w-4" /> Import JSON
            </button>
            <button
              onClick={() => {
                if (confirm('Reset all data to defaults? This cannot be undone.')) {
                  resetToDefault();
                }
              }}
              className="btn-secondary text-red-500"
            >
              <RotateCcw className="h-4 w-4" /> Reset to Default
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </section>

        {/* Data Info */}
        <section className="card">
          <h2 className="mb-3 font-semibold">Data Storage</h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Your data is automatically saved to browser local storage. Use JSON export
            to back up your knowledge graph.
          </p>
          <div className="mt-3 grid grid-cols-4 gap-3 text-center">
            <div className="rounded-lg bg-surface-elevated p-3">
              <p className="text-lg font-bold text-accent">{nodes.length}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Nodes</p>
            </div>
            <div className="rounded-lg bg-surface-elevated p-3">
              <p className="text-lg font-bold text-accent">{categories.length}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Workflows</p>
            </div>
            <div className="rounded-lg bg-surface-elevated p-3">
              <p className="text-lg font-bold text-accent">{edges.length}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Tree links</p>
            </div>
            <div className="rounded-lg bg-surface-elevated p-3">
              <p className="text-lg font-bold text-accent">{customEdges.length}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Custom links</p>
            </div>
          </div>
        </section>

        {/* Publishing */}
        <section className="card space-y-3">
          <h2 className="font-semibold">Publishing to GitHub Pages</h2>
          {isReadOnlyBuild ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              This is the published, read-only site — Edit Mode is disabled here on
              purpose so visitors can only view your progress. Make changes on your
              local copy instead.
            </p>
          ) : (
            <ol className="list-decimal space-y-1.5 pl-4 text-sm text-[var(--color-text-muted)]">
              <li>Edit freely here while running the app locally (Edit Mode).</li>
              <li>
                Click <span className="font-medium text-[var(--color-text)]">Export → JSON</span> above.
              </li>
              <li>
                Replace <code className="rounded bg-surface-elevated px-1">src/data/initial-data.json</code>{' '}
                with the exported file's <code className="rounded bg-surface-elevated px-1">nodes</code> and{' '}
                <code className="rounded bg-surface-elevated px-1">categories</code>, and copy its{' '}
                <code className="rounded bg-surface-elevated px-1">customEdges</code> array in too.
              </li>
              <li>Commit and push — GitHub Actions rebuilds and deploys automatically.</li>
              <li>
                The deployed site always builds in read-only mode (Edit Mode never appears
                there), so only you, editing locally, can change anything.
              </li>
            </ol>
          )}
        </section>

        <div ref={graphRef} className="hidden" />
      </div>
    </div>
  );
}
