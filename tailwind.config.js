/** @type {import('tailwindcss').Config} */
export default {

	content: [
		'./index.html',
		'./src/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {},
	},
	safelist: [
		'hover:bg-green-400/50',
		'hover:bg-blue-400/50',
		/^bg-/, /^text-/,
	],
	plugins: [],
}

