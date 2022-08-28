import {LOGIN_ROUTE, MFA_ROUTE, MFA_POST_ROUTE} from './constants';
/**
 * Middleware to ensure user is authenticated, otherwise redirect to login page and set the redirectTo cookie.
 * If user has 2FA enabled, make sure they have validated their 2FA code before allowing them to access the page.
 * @param {Express.Request} req Express request
 * @param {Express.Response} res Express response
 * @param {Function} next Next middleware
 * @return {void}
 */
export default function (req, res, next) {
	if (req.isAuthenticated()) {
		// Do not redirect user if they are trying to access the validation page, to prevent infinite redirect loop.
		if (req.user.mfa && !req.session.vukkybox.validated && req.originalUrl !== MFA_ROUTE && req.originalUrl !== MFA_POST_ROUTE) {
			res.cookie('redirectTo', req.url);
			return res.redirect(MFA_ROUTE);
		}
		return next();
	}
	res.cookie('redirectTo', req.url);
	res.redirect(LOGIN_ROUTE);
}