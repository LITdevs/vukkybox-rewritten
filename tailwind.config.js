
/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./views/**/*.{html,js,ejs}", "./public/**/*.{html,js,ejs}"],
	darkMode: 'class', // or 'media' or 'class'
	theme: {
		extend: {},
	},
	variants: {
		extend: {}
	},
	plugins: [
		require('@tailwindcss/line-clamp')
	],
}