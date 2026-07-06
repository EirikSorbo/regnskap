import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Firebase-datalaget bygger på onSnapshot: setState kalles ASYNKRONT når
      // et snapshot kommer, ikke synkront i selve effekten. Regelen kan ikke se
      // det og gir falske positiver på hver realtime-lytter. Vi slår den av
      // bevisst (mønsteret er korrekt og idiomatisk).
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    // Context-filene samlokaliserer bevisst Provider-komponenten med sin hook og
    // konstanter (standard React-mønster). Fast-refresh-regelen vil ha dem i egne
    // filer; her er ekstra indireksjon ikke verdt det. Regelen står fortsatt på
    // for resten av appen (sider/komponenter).
    files: ['src/context/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
