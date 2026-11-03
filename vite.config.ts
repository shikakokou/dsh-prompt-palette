import { defineConfig, type Plugin } from 'vite'

const PLUGIN_ID = 'dsh-prompt-palette'

function moduleLoader(): Plugin {
  return {
    name: 'dsh-module-loader',
    enforce: 'post',
    generateBundle(_options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk' || !output.isEntry) continue
        output.code = `window.__ModuleLoader__.load({id:${JSON.stringify(PLUGIN_ID)},factory:(require)=>{var module={exports:{}};var exports=module.exports;\n${output.code}\nreturn module.exports;}});\n`
      }
    }
  }
}

export default defineConfig({
  plugins: [moduleLoader()],
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: 'src/client.tsx',
      formats: ['cjs'],
      fileName: () => 'client.js'
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        exports: 'named'
      }
    }
  }
})
