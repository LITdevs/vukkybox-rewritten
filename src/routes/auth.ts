import express, {Request, Response, Router} from 'express';
import {PassportStatic} from "passport";
import scopes from '../util/scopes';

function routerFunc(passport : PassportStatic) {
	const router: Router = express.Router();

	router.get('/oauth', passport.authenticate('litauth', { scope: scopes }), () => {});

	router.get('/callback', passport.authenticate('litauth', { failureRedirect: '/' }), (req: Request, res: Response) => {
		if (req.cookies['redirectTo']) {
			let dest = req.cookies['redirectTo'];
			res.clearCookie("redirectTo");
			res.redirect(dest);
		} else {
			res.redirect('/');
		}
	});

	router.get('/logout', (req: Request, res: Response) => {
		req.logout((err) => {
			if (err) {
				console.error(err);
			}
			res.redirect('/')
		})
	})

	return router;
}

export default routerFunc;
