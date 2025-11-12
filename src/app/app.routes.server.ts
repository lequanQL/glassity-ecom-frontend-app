import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Static routes that can be prerendered (no data dependencies)
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'sign-up',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'forgot-password',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'reset-password',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'forbidden',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'policy',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'warranty-policy',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'privacy-policy',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'landing',
    renderMode: RenderMode.Prerender
  },
  // Data-dependent routes that should use SSR (load JSON files)
  {
    path: '',
    renderMode: RenderMode.Server
  },
  {
    path: 'collection',
    renderMode: RenderMode.Server
  },
  {
    path: 'products',
    renderMode: RenderMode.Server
  },
  {
    path: 'detail/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'payment',
    renderMode: RenderMode.Server
  },
  {
    path: 'orders',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/**',
    renderMode: RenderMode.Server
  },
  // Fallback for any other routes
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
