import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh for better development experience
      fastRefresh: true,
      // Optimize JSX runtime for production
      jsxRuntime: 'automatic'
    }),
    // Bundle analyzer for development
    process.env.ANALYZE &&
      visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true
      }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'school.png'],
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: 'auto',
      manifest: {
        name: 'Setupati School Management System',
        short_name: 'Setupati School',
        description:
          'Setupati School Management System - Access your academic information, attendance, exam results, and school announcements',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1e40af',
        orientation: 'portrait',
        scope: '/',
        categories: ['education', 'productivity'],
        lang: 'en',
        icons: [
          {
            src: '/school.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/school.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/school.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/school.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/school.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/school.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/school.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/school.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/school.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/school.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 10000000 // 10MB - increased for large chunks
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@app': path.resolve(__dirname, './app')
    }
  },
  build: {
    // Simplified chunk splitting for better performance
    rollupOptions: {
      output: {
        // Simplified manual chunking
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],

          // UI libraries
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            'lucide-react'
          ],

          // Data management
          'data-vendor': ['@tanstack/react-query', 'zustand', 'axios'],

          // Forms
          'forms-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],

          // Firebase
          'firebase-vendor': ['firebase'],

          // Charts and large libraries
          'charts-vendor': ['recharts'],
          'utils-vendor': [
            'date-fns',
            'clsx',
            'class-variance-authority',
            'tailwind-merge'
          ]
        }
      }
    },

    // Reasonable performance settings
    chunkSizeWarningLimit: 500,
    sourcemap: false, // Disable source maps for faster builds
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true
      }
    }
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
      'axios'
    ]
  },

  // Server configuration
  server: {
    host: true,
    port: 5173
  }
});
