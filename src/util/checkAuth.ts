import {LOGIN_ROUTE} from './constants';
/**
 * Middleware to ensure user is authenticated, otherwise redirect to login page and set the redirectTo cookie.
 *
 * @param {Express.Request} req Express request
 * @param {Express.Response} res Express response
 * @param {Function} next Next middleware
 * @return {void}
 */
export default function (req, res, next) {
	if (req.isAuthenticated()) return next();
	res.cookie('redirectTo', req.url);
	res.redirect(LOGIN_ROUTE);
}