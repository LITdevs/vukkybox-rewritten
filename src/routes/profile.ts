import express, {Request, Response, Router} from 'express';
import db from '../databaseManager';
import csurf from "csurf";
import {CSRF_COOKIE_OPTIONS} from "../util/constants/constants";

const router: Router = express.Router();

router.use(csurf({ cookie: CSRF_COOKIE_OPTIONS }));

router.get('/:username', (req: Request, res: Response) => {
	res.locals.csrfToken = req.csrfToken();
	let User = db.getUsers();
	User.findOne({username: req.params.username}, (err, user) => {
		if (err || !user) {
			return res.status(404).render('error', {title: "Vukkyboxn't", error: "User not found"});
		}
		let editMode = false;
		if (typeof req?.query?.editmode !== "undefined" && user._id.equals(req.user?._id)) editMode = true;
		res.locals.puser = user;
		res.render('profile', {title: "Vukkybox", editMode});
	})
});

export default router;