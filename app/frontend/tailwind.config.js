module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00c885',          // Green for buttons and highlights
        background: '#131313',       // Dark background
        secondaryBackground: '#1E1E1E', // Background for containers
        lighterGrey: '#353535',      // For buttons against dark background
        text: '#E0E0E0',             // General text color
        inputBackground: '#131313',  // Input background
        inputText: '#5A5A5A',        // Input text color
        border: '#565656',           // Border color
        label: '#878787',            // Label color for subheaders
        buttonText: '#ffffff',       // Text color for buttons
        buttonHover: '#00965a',      // Darker green for button hover
        error: 'red',                // Error color
      },
    },
  },
  plugins: [],
};
