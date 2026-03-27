import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://ronnywang.github.io',
  base: '/ronny-github',
  integrations: [tailwind()],
});
