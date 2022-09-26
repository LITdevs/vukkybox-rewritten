import db from '../../databaseManager';
import errorNotifier from "../errorNotifier";
import pseudoModeMiddleware from "./pseudoModeMiddleware";

/**
 * Middleware to add user to `res.locals` for use in templates.
 * If user is not authenticated, `res.locals.user` will be `null`.
 *
 * @param {Express.Request} req Express request
 * @param {Express.Response} res Express response
 * @param {Function} next Next middleware
 * @return {void}
 */
export default (req, res, next) => {
	res.locals.pseudoMode = false; // This will get overwritten later if the user is indeed in pseudoMode
	if (req.csrfToken) res.locals.csrfToken = req.csrfToken();
	res.locals.user = req.user ? req.user : null;
	if (res.locals.user) {
		if (req.session.pseudoMode) {
			return pseudoModeMiddleware(req, res, next);
		} else {
			let Users = db.getUsers();
			Users.findOne({ _id: res.locals.user._id }, (err, user) => {
				if (err) {
					console.error(err);
					errorNotifier(err, "Error in localsMiddleware, you should fix this ASAP");
					return next(err);
				}
				res.locals.user = user;
				req.session.user = user;
				req.user = user;
				return next();
			})
		}
	} else {
		return next();
	}
}