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
                'brand-gold': '#C5A059',
                'brand-dark': '#000000',
                'brand-light': '#FFFFFF',
            },
        },
    },
    plugins: [],
}
