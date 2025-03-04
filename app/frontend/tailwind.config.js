module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        background: 'var(--background-color)',
        secondaryBackground: 'var(--secondary-background)',
        lighterGrey: 'var(--lighter-grey)',
        text: 'var(--text-color)',
        inputBackground: 'var(--input-background)',
        inputText: 'var(--input-text-color)',
        border: 'var(--border-color)',
        label: 'var(--label-color)',
        buttonText: 'var(--button-text)',
        buttonHover: 'var(--button-hover)',
        error: 'var(--error-color)',
      },
    },
  },
  plugins: [],
};
