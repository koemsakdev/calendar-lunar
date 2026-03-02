/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--ion-color-primary)",
        background: "var(--ion-background-color)",
        text: "var(--ion-text-color)",
      },
    },
  },
  plugins: [],
}

