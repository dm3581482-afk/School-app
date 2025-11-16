import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        house: {
          red: {
            light: '#FCA5A5',
            DEFAULT: '#EF4444',
            dark: '#B91C1C',
          },
          blue: {
            light: '#93C5FD',
            DEFAULT: '#3B82F6',
            dark: '#1E40AF',
          },
          green: {
            light: '#86EFAC',
            DEFAULT: '#10B981',
            dark: '#047857',
          },
          yellow: {
            light: '#FDE047',
            DEFAULT: '#EAB308',
            dark: '#A16207',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
