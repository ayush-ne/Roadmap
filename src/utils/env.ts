// When true, this build is the published, read-only site (GitHub Pages).
// It's set via .env.production (VITE_READONLY=true), which Vite loads
// automatically for `npm run build`. Local `npm run dev` does not load
// .env.production, so editing stays available on your machine.
export const isReadOnlyBuild: boolean = import.meta.env.VITE_READONLY === 'true';
