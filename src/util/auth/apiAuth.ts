import db from '../../databaseManager';
import errorNotifier from "../errorNotifier";
/**
 * Middleware to authenticate API calls.
 * Either via API key or Session.
 * @param {Express.Request} req Express request
 * @param {Express.Response} res Express response
 * @param {Function} next Next middleware
 * @return {void}
 */
export default function (req, res, next) {
	try {
		const User = db.getUsers();
		if (req.isAuthenticated()) {
			// User is authenticated via session.
			if (req.user.mfa && !req.session.vukkybox.validated) {
				return res.status(401).json({error: "2FA not validated."});
			}
			return next();
		}
		if (!req.headers?.["authorization"]?.startsWith("Bearer")) return res.status(401).json({
			error: "Unauthorized",
			message: "No Bearer token present in Authorization header"
		});
		const apiKey = req.headers["authorization"].split(" ")[1];
		if (!apiKey) return res.status(401).json({
			error: "Unauthorized",
			message: "No Bearer token present in Authorization header"
		});
		User.findOne({apiKey: apiKey}, (err, user) => {
			if (err) {
				console.error(err);
				errorNotifier(err, "Error during API call, now enjoy a dump of debug data: " + JSON.stringify({
					url: req.originalUrl,
					method: req.method,
					body: req?.body,
					params: req?.params,
					query: req?.query,
					headers: req?.headers,
					user: req?.user
				}));
				return res.status(500).json({error: "Internal Server Error", message: "Something went wrong"});
			}
			if (!user) return res.status(403).json({error: "Unauthorized", message: "Invalid API key"});
			req.user = user;
			res.locals.user = user;
			next();
		});
	} catch (err) {
		console.error(err);
		errorNotifier(err, "Error during API call, now enjoy a dump of debug data: " + JSON.stringify({
			url: req.originalUrl,
			method: req.method,
			body: req?.body,
			params: req?.params,
			query: req?.query,
			headers: req?.headers,
			user: req?.user
		}));
		return res.status(500).json({error: "Internal Server Error", message: "Something went wrong"});
	}
}