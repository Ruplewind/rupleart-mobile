/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'montserrat-black': ['Montserrat-Black', 'sans-serif'],
        'montserrat-black-italic': ['Montserrat-BlackItalic', 'sans-serif'],
        'montserrat-bold': ['Montserrat-Bold', 'sans-serif'],
        'montserrat-bold-italic': ['Montserrat-BoldItalic', 'sans-serif'],
        'montserrat-extrabold': ['Montserrat-ExtraBold', 'sans-serif'],
        'montserrat-extrabold-italic': ['Montserrat-ExtraBoldItalic', 'sans-serif'],
        'montserrat-extralight': ['Montserrat-ExtraLight', 'sans-serif'],
        'montserrat-extralight-italic': ['Montserrat-ExtraLightItalic', 'sans-serif'],
        'montserrat-italic': ['Montserrat-Italic', 'sans-serif'],
        'montserrat-light': ['Montserrat-Light', 'sans-serif'],
        'montserrat-light-italic': ['Montserrat-LightItalic', 'sans-serif'],
        'montserrat-medium': ['Montserrat-Medium', 'sans-serif'],
        'montserrat-medium-italic': ['Montserrat-MediumItalic', 'sans-serif'],
        'montserrat-regular': ['Montserrat-Regular', 'sans-serif'],
        'montserrat-semibold': ['Montserrat-SemiBold', 'sans-serif'],
        'montserrat-semibold-italic': ['Montserrat-SemiBoldItalic', 'sans-serif'],
        'montserrat-thin': ['Montserrat-Thin', 'sans-serif'],
        'montserrat-thin-italic': ['Montserrat-ThinItalic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}