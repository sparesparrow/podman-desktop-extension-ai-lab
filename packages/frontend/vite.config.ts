import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        runes: true  // Enable the new state management features
      }
    })
  ],
  // ... existing code ...
}); 