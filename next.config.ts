import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ── GLSL shader support ──────────────────────────────────────────────────
  // Turbopack (default dev bundler in Next 16) has native raw-loader support
  // via the `rule` API. Webpack fallback is also configured.
  turbopack: {
    rules: {
      '*.glsl': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.vert': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.frag': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.(glsl|vert|frag)$/,
      use: 'raw-loader',
      exclude: /node_modules/,
    })
    return config
  },

  // ── Performance ──────────────────────────────────────────────────────────
  compress: true,

  // ── Images ───────────────────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
