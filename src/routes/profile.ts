import express, {Request, Response, Router} from 'express';
import db from '../databaseManager';
import errorNotifier from "../util/errorNotifier";

const router: Router = express.Router();

router.get('/:username', (req: Request, res: Response) => {
	let User = db.getUsers();
	User.findOne({username: req.params.username}, (err, user) => {
		if (err || !user) {
			return res.status(404).render('404', {title: "Vukkyboxn't"});
		}
		let editMode = false;
		if (typeof req?.query?.editmode !== "undefined" && user._id.equals(req.user?._id)) editMode = true;
		res.locals.puser = user;
		getFriendship(res.locals.user, user).then(({error, friendship}) => {
			if (error) {
				return res.status(500).render('error', {title: "Vukkyboxn't :("})
			}
			if (!friendship) friendship = {state: 0}
			res.render('profile', {title: "Vukkybox", editMode, friendship});
		})
	})
});

function getFriendship(user, puser) {
	return new Promise(resolve => {
		if (!user) return resolve({error: null, friendship: null});
		if (user._id.equals(puser._id)) return resolve({error: null, friendship: null})
		let Friends = db.getFriends();
		// Find a friendship between the provided users
		Friends.findOne({$or:[{requester: user._id, recipient: puser._id},{requester: puser._id, recipient: user._id}]}, (err, friendship) => {
			if (err) {
				errorNotifier(err, `Trying to fetch friendship of ${user._id} (${user.username}) ${puser._id} (${user.username})`)
				return resolve({error: true})
			}

			// If no friends found return null
			if (!friendship) return resolve({error: null, friendship: null})

			// Unfriend :)
			return resolve({error: null, friendship});
		})
	})
}

export default router;