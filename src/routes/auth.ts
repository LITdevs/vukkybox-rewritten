import express, {Request, Response, Router} from 'express';
import {PassportStatic} from "passport";
import scopes from '../util/constants/scopes';
import errorNotifier from "../util/errorNotifier";
import csurf from "csurf";
import {CSRF_COOKIE_OPTIONS, MFA_ROUTE} from "../util/constants/constants";

function routerFunc(passport : PassportStatic) {
	const router: Router = express.Router();

	router.use(csurf({ cookie: CSRF_COOKIE_OPTIONS }));

	router.get('/oauth', passport.authenticate('litauth', { scope: scopes }), () => {});

	router.get('/callback', passport.authenticate('litauth', { failureRedirect: '/' }), (req: Request, res: Response) => {
		if (!req.session.vukkybox) req.session.vukkybox = {};
		req.session.vukkybox.validated = false;
		if (req.cookies['redirectTo'] && !req.user.mfa) {
			let dest = req.cookies['redirectTo'];
			res.clearCookie("redirectTo");
			res.redirect(dest);
		} else {
			if (req.user.mfa) return res.redirect(MFA_ROUTE);
			res.redirect('/');
		}
	});

	router.get('/logout', (req: Request, res: Response) => {
		req.logout((err) => {
			if (err) {
				console.error(err);
			}
			req.session.destroy((err) => {
				if (err) {
					errorNotifier(err);
					console.error(err);
					return res.send("There was a problem destroying your session, please clear your cookies.")
				}
				res.redirect('/')
			});
		})
	})

	return router;
}

export default routerFunc;
