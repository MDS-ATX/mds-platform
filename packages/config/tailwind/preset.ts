import type { Config } from "tailwindcss";

const mdsPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // MDS brand colors — update these with actual brand values
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9dffd",
          300: "#7cc5fc",
          400: "#36a8f8",
          500: "#0c8de9",
          600: "#006fc7",
          700: "#0059a1",
          800: "#054b85",
          900: "#0a3f6e",
          950: "#072849",
        },
        modus: {
          dark: "#1a1a2e",
          medium: "#16213e",
          light: "#0f3460",
          accent: "#e94560",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "2rem",
          lg: "4rem",
          xl: "5rem",
        },
      },
    },
  },
};

export default mdsPreset;
