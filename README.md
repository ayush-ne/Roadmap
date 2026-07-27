# AI Learning Knowledge Graph

An interactive visual learning platform where every topic is represented as a connected node. Build your personal knowledge graph that grows as you learn — like Google Maps for your learning journey.

![Knowledge Graph](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-blue)

## Features

- **Interactive Knowledge Graph** — Zoom, pan, drag nodes with React Flow
- **Visual Roadmap Builder** — Create, edit, move, and delete topics in Edit Mode
- **Collapsible Nodes** — Collapse any node to hide its child subtree; expand it again anytime
- **Free-form Directed Connections** — Drag from one node's edge handle to another to link any two topics (not just parent/child), with arrows and optional labels; manage connections from the sidebar too
- **Workflows** — Add or delete independent roadmaps (e.g. "DSA", "System Design") from the graph toolbar, in addition to the built-in categories
- **Status Tracking** — Completed, Learning, Revision, Not Started, Blocked
- **Progress Calculation** — Automatic progress at node, category, and overall levels
- **Rich Node Details** — Notes, practice checklists, resources, GitHub repos, live demos — all addable/removable from the sidebar
- **Project Nodes** — Purple project nodes with architecture, tech stack, lessons learned
- **Search & Filters** — Global search by topic, tag, notes, resources
- **Dashboard** — Progress stats, current topic, recently updated
- **Statistics** — Charts for category progress, status distribution, confidence levels
- **Local Persistence** — Auto-saves to browser storage with JSON import/export
- **Read-only Publishing** — The deployed GitHub Pages build always runs in view-only mode (Edit Mode is disabled site-wide), so only you, running the app locally, can make changes
- **Dark/Light Mode** — Customizable accent colors and view modes
- **Export** — PNG, PDF, Markdown, JSON
- **Responsive Design** — Works on desktop, tablet, and mobile

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS
- React Flow (@xyflow/react)
- Framer Motion
- React Router
- Zustand (state + localStorage persistence)
- Recharts (statistics)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

### Option 1: GitHub Actions (Recommended)

1. Push this repo to GitHub (repo name: `Roadmap`)
2. Go to **Settings → Pages → Build and deployment**
3. Set source to **GitHub Actions**
4. Push to `main` — the workflow in `.github/workflows/deploy.yml` will build and deploy automatically

Your site will be live at: `https://<username>.github.io/Roadmap/`

### Option 2: Manual Deploy

```bash
npm run deploy
```

This uses `gh-pages` to publish the `dist` folder.

### Important: Base Path

If your repo name is **not** `Roadmap`, update the base path in:

- `vite.config.ts` — change `/Roadmap/` to `/<your-repo-name>/`
- `.github/workflows/deploy.yml` — set `GITHUB_PAGES: 'true'` (already configured)

## Usage

### View Mode
- Click any node to open the detail panel
- Use category/workflow tabs to switch roadmaps
- Search from the navbar
- Filter by status, tags, difficulty
- Click a node's chevron to collapse/expand its children

### Edit Mode
Toggle **Edit Mode** from the navbar (only available when running locally — see Publishing below) to:
- **Add Topic** — Create new root topics
- **Add Child** — Add sub-topics to any node
- **Drag** — Reposition nodes
- **Connect** — Drag from a node's edge handle onto another node to draw a directed link between any two topics
- **Add/Delete Workflow** — Use the `+` button next to the workflow tabs, or the `×` on a tab, to add or remove an entire roadmap
- **Delete** — Remove nodes (and children)

### Node Details Panel
- Update status, confidence
- Add/remove notes, practice items, resources, GitHub repos, live demos
- Add/remove free-form connections to other topics
- Navigate to related topics

## Publishing (local edit → static GitHub Pages)

Since GitHub Pages only serves static files, there's no server to check who's
editing — so the app enforces a simple split instead:

- **Locally** (`npm run dev`), Edit Mode is fully available: everything above works.
- **The production build** (`npm run build`, which is what the GitHub Actions
  workflow runs) automatically sets `VITE_READONLY=true` via `.env.production`.
  This hides and disables Edit Mode entirely, so the deployed site is always
  view-only for everyone, regardless of local browser state.

To publish your latest progress:

1. Edit locally with Edit Mode on.
2. In **Settings → Export → JSON**, download your data — this file is a complete,
   ready-to-use replacement for `src/data/initial-data.json`. Nothing needs to
   be copied between files by hand.
3. Run:
   ```bash
   npm run publish-data -- /path/to/downloaded-file.json
   ```
   This swaps the file in and automatically saves a timestamped copy of the
   previous one under `src/data/backups/` first — so older versions of your
   progress are always kept. (You can also just replace
   `src/data/initial-data.json` yourself; the script is a convenience, not a
   requirement.)
4. Commit and push — GitHub Actions rebuilds and redeploys automatically.

Every git commit is also a preserved past version — `git log -- src/data/initial-data.json`
shows the full history, and `git show <commit>:src/data/initial-data.json` recovers
any older version on demand.

## Example data

`src/data/example-data.json` is a reference file (not your live data) showing every
field the app supports — one node of each type (topic, project, milestone) filled
in with example values, plus a custom connection between two of them. Use it as a
template when you're not sure what a field should look like, or load it via
**Settings → Load Example Data** to see it rendered in the app (this replaces
whatever data is currently loaded, so export first if you want to keep it).

## Project Structure

```
src/
├── components/
│   ├── Roadmap/       # React Flow graph & custom nodes
│   ├── Sidebar/       # Node detail panel
│   ├── Search/        # Global search & filters
│   └── layout/        # App shell & navbar
├── pages/             # Route pages
├── store/             # Zustand store with persistence
├── data/              # Initial seed data
├── utils/             # Progress, layout, export helpers
└── types/             # TypeScript definitions
```

## Data Model

Each node stores: title, status, description, difficulty, confidence, estimated hours, notes, practice items, resources, GitHub links, live demos, related topics, tags, and position.

Data persists in `localStorage` under the key `knowledge-graph-storage`.

## License

MIT
