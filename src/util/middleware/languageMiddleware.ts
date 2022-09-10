import fs from 'fs';
import LANG_LIST from '../../../lang/codes';

let lang = {};

// Load all the language files into the lang object.
fs.readdirSync(`lang`).forEach(file => {
	if (file.endsWith(".json")) {
		lang[file.split('.')[0]] = JSON.parse(fs.readFileSync(`lang/${file}`).toString());
	}
})

/**
 * Middleware to add language to `res.locals` for use in templates.
 * Uses accept-language header to determine language.
 * If none is specified or language is not supported, english is used
 * Missing keys are filled with english values.
 *
 * @param {Express.Request} req Express request
 * @param {Express.Response} res Express response
 * @param {Function} next Next middleware
 * @return {void}
 */
export default function (req, res, next) {
	let preferredLanguage = req.acceptsLanguages()[0].split("-")[0];
	if (!LANG_LIST.includes(preferredLanguage)) preferredLanguage = "en";

	if (req.cookies["lang"]) preferredLanguage = req.cookies["lang"]

	// Copy the english language to a new object.
	let enlang = {};
	Object.assign(enlang, lang["en"]);

	// Fill in missing keys with english values.
	res.locals.lang = Object.assign(enlang, lang[preferredLanguage]);
	return next();
}