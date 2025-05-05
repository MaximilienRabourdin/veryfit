module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "sans-serif"],
        inter: ["Inter", "sans-serif"],

      },
      fontSize: {
        h1: ["24px", "28.13px"], // Taille et hauteur de ligne pour h1
      },
      fontWeight: {
        "h1-bold": 900, // Poids spécifique pour h1
      },
      colors: {
        darkBlue: "#032444",
        lightGray: "#F9F9F9",
        darkRed: "#FF0000",
        customRed: "#D32F2F", // Rouge pour les boutons et validations
        customYellow: "#FFB300", // Jaune pour les éléments à valider
        customGreen: "#4CAF50", // Vert pour les validations réussies
      },
      backgroundImage: {
        login: "url('/src/medias/illustration_connexion.png')" // Chemin vers ton image de connexion
      },
      
    },
  },
  plugins: [],
};
