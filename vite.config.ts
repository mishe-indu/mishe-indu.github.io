import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' hace que el build funcione en cualquier subruta de GitHub Pages
// (usuario.github.io/repositorio/) sin tener que fijar el nombre del repo.
export default defineConfig({
  plugins: [react()],
  base: './',
})
