import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://udonrm.github.io',
  base: '/Ordo-docs',
  trailingSlash: 'always',
  integrations: [starlight({
    title: 'Ordo Docs',
    defaultLocale: 'root',
    locales: { root: { label: '日本語', lang: 'ja' } },
    sidebar: [
      { label: 'はじめに', link: '/' },
      { label: 'プロダクト', items: [{ autogenerate: { directory: 'product' } }] },
      { label: 'アーキテクチャ', items: [{ autogenerate: { directory: 'architecture' } }] },
      { label: '意思決定の記録', items: [{ autogenerate: { directory: 'decisions' } }] },
      { label: '学習', items: [{ autogenerate: { directory: 'learning' } }] },
    ],
  })],
});
