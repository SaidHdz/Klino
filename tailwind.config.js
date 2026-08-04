/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        klino: {
          primary: "#1B4F9B",    // Azul cobalto profundo
          secondary: "#2A7D6F",  // Verde salvia / teal
          background: "#F2F2F7", // Gris claro clásico de iOS
          card: "#FFFFFF",       // Blanco puro
          accent: "#E8820C",     // Naranja ámbar suave
          text: "#1A2332",       // Casi negro azulado
          subtext: "#5A6B7E",    // Gris azulado
          lightText: "#E8EFF8",  // Sobre fondos oscuros
          // Mantengo nombres descriptivos para compatibilidad con código existente si es necesario, 
          // pero priorizando la nueva paleta.
          pending: "#E8820C",    // Mapeado a accent
          processed: "#1B4F9B",  // Mapeado a primary
          completed: "#2A7D6F",  // Mapeado a secondary
        }
      }
    },
  },
  plugins: [],
}