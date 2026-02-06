/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                sgf: {
                    dark: '#0F2B2F',           // HSL(188°, 49%, 12%) - Primary dark
                    primary: '#00A86B',        // HSL(160°, 100%, 33%) - Primary green
                    light: '#70C4A8',          // HSL(161°, 33%, 60%) - Light accent
                    surface: '#F5F7F9',
                    text: {
                        primary: '#1F2937',
                        secondary: '#6B7280',
                    }
                },
                status: {
                    moving: '#22C55E',         // Verde - Em movimento
                    idle: '#3B82F6',           // Azul - Parado/ligado
                    stopped: '#9CA3AF',        // Cinza - Desligado
                    alert: '#EF4444',          // Vermelho - Alerta
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
