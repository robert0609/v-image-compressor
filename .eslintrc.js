module.exports = {
	"root": true,
	"parser": "babel-eslint",
	"env": {
		"es6": true,
		"browser": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"sourceType": "module"
	},
	"plugins": [
		"html",
		"import"
	],
	"settings": {
		"import/resolver": "webpack"
	},
	"rules": {
		"quotes": ["error", "single"],
		"semi": ["error", "always"],
		"no-unused-vars": "warn",
		"no-console": "warn"
	}
};
