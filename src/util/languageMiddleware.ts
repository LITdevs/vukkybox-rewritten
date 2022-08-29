import fs from 'fs';
import LANG_LIST from '../../lang/codes';

let lang = {};

fs.readdirSync(`lang`).forEach(file => {
	if (file.endsWith(".json")) {
		lang[file.split('.')[0]] = JSON.parse(fs.readFileSync(`lang/${file}`).toString());
	}
})

/**
 *
 * @param req
 * @param res
 * @param next
 */
export default function (req, res, next) {
	let preferredLanguage = req.acceptsLanguages()[0].split("-")[0];
	if (!LANG_LIST.includes(preferredLanguage)) preferredLanguage = "en";
	let enlang = {};
	Object.assign(enlang, lang["en"]);
	res.locals.lang = Object.assign(enlang, lang[preferredLanguage]);
	return next();
}