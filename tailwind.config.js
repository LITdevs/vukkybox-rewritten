module.exports = {
	content: [
		"./views/*.ejs",
		"./views/common/*.ejs",
		"./views/common/profile/*.ejs",
		"./views/admin/*.ejs",
		"./public/*.js",
		"./public/js/*.js"
	],
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