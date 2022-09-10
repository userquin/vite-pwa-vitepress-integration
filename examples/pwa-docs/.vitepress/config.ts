import { defineConfig } from '@vite-pwa/vitepress'

export default defineConfig({
    vite: {
        logLevel: 'info'
    },
    lang: 'en-US',
    title: 'VitePress PWA',
    description: 'Vite Plugin PWA Integration example for VitePress',
    head: [
        ['meta', { name: 'theme-color', content: '#ffffff' }],
        ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
        ['link', { rel: 'mask-icon', href: '/favicon.svg', color: '#ffffff' }],
        ['meta', {
            name: 'keywords',
            content: 'PWA, VitePress, workbox, Vite, vite-plugin',
        }],
        ['link', { rel: 'apple-touch-icon', href: '/pwa-192x192.png', sizes: '192x192' }],
        ['link', { rel: 'manifest', href: '/manifest.webmanifest', sizes: '192x192' }],
        ['script', { src: '/registerSW.js' }],
    ],
    pwa: {
        mode: 'development',
        base: '/',
        scope: '/',
        registerType: 'autoUpdate',
        injectRegister: 'script',
        includeAssets: ['favicon.svg'],
        manifest: {
            name: 'VitePress PWA',
            short_name: 'VitePressPWA',
            theme_color: '#ffffff',
            icons: [
                {
                    src: 'pwa-192x192.png',
                    sizes: '192x192',
                    type: 'image/png',
                },
                {
                    src: 'pwa-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                },
                {
                    src: 'pwa-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any maskable',
                },
            ],
        },
    }
})
