import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import AutoImport from 'unplugin-auto-import/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [AutoImport({
      dirs: ['src/common/js'],
      imports: [
        'react',
        { '@/common/js/dayjs-setup': [['default', 'dayjs']] },
      ],
      dts: 'src/auto-imports.d.ts',
    }), react(), tailwindcss()
  ],
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, 'src/common/js/common.jsx'),
      '@': path.resolve(__dirname, 'src'),
    }
  },
  base: '/soldout-manage-front/',
})
