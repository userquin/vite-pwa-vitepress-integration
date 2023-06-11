import type { DefaultTheme, UserConfig } from 'vitepress'
import type { VitePluginPWAAPI } from 'vite-plugin-pwa'
import { VitePWA } from 'vite-plugin-pwa'
import { configurePWAOptions } from './config'

export function withUserConfig<T = DefaultTheme.Config>(config: UserConfig<T>) {
  let viteConf = config.vite
  if (!viteConf) {
    viteConf = {}
    config.vite = viteConf
  }

  let vitePlugins = viteConf.plugins
  if (typeof vitePlugins === 'undefined') {
    vitePlugins = []
    viteConf.plugins = vitePlugins
  }

  if (vitePlugins && vitePlugins.length > 0) {
    const pwaPlugin = vitePlugins.find(i => i && typeof i === 'object' && 'name' in i && i.name === 'vite-plugin-pwa')
    if (pwaPlugin)
      throw new Error('Remove vite-plugin-pwa plugin from Vite Plugins entry in VitePress config file')
  }

  const { pwa = {} } = config

  configurePWAOptions(pwa)

  let api: VitePluginPWAAPI | undefined

  vitePlugins.push(
    VitePWA({ ...pwa }),
    {
      name: 'vite-plugin-pwa:vitepress',
      apply: 'build',
      enforce: 'post',
      configResolved(resolvedViteConfig) {
        if (!resolvedViteConfig.build.ssr)
          api = resolvedViteConfig.plugins.find(p => p.name === 'vite-plugin-pwa')?.api
      },
    },
  )

  const vitePressConfig = config as UserConfig<T>

  const userTransformHead = vitePressConfig.transformHead
  const userBuildEnd = vitePressConfig.buildEnd

  vitePressConfig.transformHead = async (ctx) => {
    const head = (await userTransformHead?.(ctx)) ?? []

    const webManifestData = api?.webManifestData()
    if (webManifestData) {
      const href = webManifestData.href
      if (webManifestData.useCredentials)
        head.push(['link', { rel: 'manifest', href, crossorigin: 'use-credentials' }])
      else
        head.push(['link', { rel: 'manifest', href }])
    }

    const registerSWData = api?.registerSWData()
    if (registerSWData && registerSWData.shouldRegisterSW) {
      if (registerSWData.inline) {
        head.push([
          'script',
          { id: 'vite-plugin-pwa:inline-sw' },
                    `if('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('${registerSWData.inlinePath}', { scope: '${registerSWData.scope}' })})}`,
        ])
      }
      else {
        head.push([
          'script',
          {
            id: 'vite-plugin-pwa:register-sw',
            src: registerSWData.registerPath,
          },
        ])
      }
    }

    return head
  }

  vitePressConfig.buildEnd = async (siteConfig) => {
    await userBuildEnd?.(siteConfig)
    api && !api.disabled && await api.generateSW()
  }

  return vitePressConfig
}
