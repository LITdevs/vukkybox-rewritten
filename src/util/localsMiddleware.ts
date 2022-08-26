/**
 * Middleware to ensure add user to `res.locals` for use in templates.
 * If user is not authenticated, `res.locals.user` will be `null`.
 *
 * @param {Express.Request} req Express request
 * @param {Express.Response} res Express response
 * @param {Function} next Next middleware
 * @return {void}
 */
export default (req, res, next) => {
	res.locals.user = req.user ? req.user : null;
	next();
}