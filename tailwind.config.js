/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'brand-gold': '#D4AF37',
                'brand-dark': '#111827',
                'brand-light': '#F9FAFB',
                'brand-secondary': '#4B5563',
            },
        },
    },
    plugins: [],
}
