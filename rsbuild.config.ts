import {defineConfig} from '@rsbuild/core'
import {pluginReact} from '@rsbuild/plugin-react'

export default defineConfig({
  html: {
    title: 'Lexical Editor Experiment',
  },
  output: {
    assetPrefix: '/2025-08-05-lexical-editor-experiment/',
  },
  plugins: [pluginReact()],
})
