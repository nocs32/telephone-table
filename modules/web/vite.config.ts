import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const coreApiUrl = 'http://localhost:2569';

// Live tables: the Colyseus client talks to /live (matchmaking over HTTP, then a WebSocket);
// core-api serves those routes at its root.
const liveProxy = {
  target: coreApiUrl,
  ws: true,
  rewrite: (path: string): string => path.replace(/^\/live/u, ''),
};

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      'styled-system': fileURLToPath(new URL('./styled-system', import.meta.url)),
    },
  },
  // 5175 and 4175, one above Scribble Table's 5174 and 4174 (and two above Felt Table's 5173 and
  // 4173), so all three games may run at once.
  server: {
    port: 5175,
    strictPort: true,
    proxy: { '/api': coreApiUrl, '/live': liveProxy },
  },
  // `pnpm play`: the production build is served here, on this machine only, and a Cloudflare Tunnel
  // of its own (not the siblings') brings telephone.timnox.dev to it. The preview reuses
  // `server.proxy`, so /api and /live reach core-api exactly as in dev.
  preview: {
    host: '127.0.0.1',
    port: 4175,
    strictPort: true,
    allowedHosts: ['telephone.timnox.dev'],
  },
});
