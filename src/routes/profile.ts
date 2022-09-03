import express, {Request, Response, Router} from 'express';
import db from '../databaseManager';

const router: Router = express.Router();

router.get('/:username', (req: Request, res: Response) => {
	let User = db.getUsers();
	User.findOne({username: req.params.username}, (err, user) => {
		if (err || !user) {
			return res.status(404).render('error', {title: "Vukkyboxn't", error: "User not found"});
		}
		res.locals.puser = user;
		res.render('profile', {title: "Vukkybox"});
	})
});

export default router;