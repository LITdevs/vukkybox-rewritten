import express, {Request, Response, Router} from 'express';
import {PassportStatic} from "passport";
import scopes from '../util/scopes';
import db from '../databaseManager';

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

function loginHandler (accessToken : string, refreshToken : string, profile : any, done : Function) {
	let User = db.getUsers();
	// Check if the user is already in the database.
	User.findOne({ litauthId: profile._id }, (err, user) => {
		if (err) {
			console.error(err);
			return done("Database error")
		}
		if (user) {
			// User found, update data and return user
			if (user.username == profile.username && user.email == profile.email) return done(null, user);
			user.username = profile.username;
			user.email = profile.email;
			user.save((err : Error, user : any) => {
				if (err) {
					console.error(err);
					return done("Database error")
				}
				return done(null, user);
			});
		} else {
			// User not found, create new user and return user
			let usr = new User({
				litauthId: profile._id,
				username: profile.username,
				email: profile.email,
				playerData: {}
			});
			usr.save((err : Error) => {
				if (err) {
					console.error(err);
					return done("Failed to write user to database.");
				}
				done(null, usr);
			});
		}
	});
}

export { loginHandler as loginHandler, routerFunc as default};
