// tailwind.config.js
const plugin = require('daisyui');

module.exports = {
  content: [
    './src/**/*.{html,ts}', // Modifica il percorso se necessario
  ],
  theme: {
    extend: {},
  },
  plugins: [
    plugin,
  ],
  daisyui: {
    themes: [
      {
        dracula: {
          'base-100': 'oklch(28% 0.141 291.089)',
          'base-200': 'oklch(38% 0.189 293.745)',
          'base-300': 'oklch(43% 0.232 292.759)',
          'base-content': 'oklch(94% 0.029 294.588)',
          primary: 'oklch(71% 0.202 349.761)',
          'primary-content': 'oklch(28% 0.109 3.907)',
          secondary: 'oklch(84% 0.238 128.85)',
          'secondary-content': 'oklch(27% 0.072 132.109)',
          accent: 'oklch(75% 0.183 55.934)',
          'accent-content': 'oklch(26% 0.079 36.259)',
          neutral: 'oklch(49% 0.27 292.581)',
          'neutral-content': 'oklch(96% 0.016 293.756)',
          info: 'oklch(62% 0.214 259.815)',
          'info-content': 'oklch(97% 0.014 254.604)',
          success: 'oklch(72% 0.219 149.579)',
          'success-content': 'oklch(98% 0.018 155.826)',
          warning: 'oklch(79% 0.184 86.047)',
          'warning-content': 'oklch(98% 0.026 102.212)',
          error: 'oklch(64% 0.246 16.439)',
          'error-content': 'oklch(96% 0.015 12.422)',
        },
      },
    ],
  },
};
