
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./constants.ts",
    "./types.ts",
  ],
  safelist: [
    // Ensure all stage colors are included
    'bg-pink-500', 'bg-rose-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500', 'bg-teal-500',
    'text-pink-600', 'text-rose-600', 'text-purple-600', 'text-indigo-600', 'text-blue-600', 'text-teal-600',
    'hover:bg-pink-600', 'hover:bg-rose-600', 'hover:bg-purple-600', 'hover:bg-indigo-600', 'hover:bg-blue-600', 'hover:bg-teal-600',
    'focus:ring-pink-500', 'focus:ring-rose-500', 'focus:ring-purple-500', 'focus:ring-indigo-500', 'focus:ring-blue-500', 'focus:ring-teal-500',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
