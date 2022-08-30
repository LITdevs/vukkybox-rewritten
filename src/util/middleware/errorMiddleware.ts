import errorNotifier from "../errorNotifier";
import fs from "fs";
const enlang = JSON.parse(fs.readFileSync("lang/en.json").toString());
/**
 * Middleware to handle errors.
 *
 * @param {Error} err Error object
 * @param {Express.Request} req Express request
 * @param {Express.Response} res Express response
 * @param {Function} next Next middleware
 * @return {void}
*/
export default (err, req, res, next) => {
	if (!err) return next();
	if (err.name === "ForbiddenError" && err.message === "invalid csrf token") return res.status(403).render('error', {title: "Vukkyboxn't", user: req.user ? req.user : null, error: "Invalid CSRF token in request", lang: enlang});
	errorNotifier(err, JSON.stringify({
		url: req.originalUrl,
		method: req.method,
		body: req?.body,
		params: req?.params,
		query: req?.query,
		headers: req?.headers,
		user: req?.user
	}));
	console.error(err);
	return res.status(500).render('error', {title: "Vukkyboxn't", user: req.user ? req.user : null, lang: enlang});
}