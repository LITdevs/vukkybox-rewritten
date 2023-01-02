import db from '../../databaseManager';
import errorNotifier from "../errorNotifier";
import localsMiddleware from "./localsMiddleware";

/**
 * Middleware to manage pseudomode, this tricks the system into thinking an administrator is another user
 * This can be utilized by administrators for various actions.
 * We can only end up here if user is authenticated and has pseudoMode in their session, no need to check for that
 *
 * @param {Express.Request} req Express request
 * @param {Express.Response} res Express response
 * @param {Function} next Next middleware
 * @return {void}
 */
export default (req, res, next) => {
	//if (!req.user.flags.some(flag => flag.id === 0)) return res.send("not administrator")
	let Users = db.getUsers();
	Users.findOne({_id: req.session.pseudoMode}, (err, user) => {
		if (err || !user) {
			if(err) errorNotifier(err, "", "pseudomode error")
			// exit pseudoMode
			req.session.pseudoMode = undefined;

			// hacky, but it should work
			return localsMiddleware(req, res, next);
		} else {
			res.locals.pseudoMode = true;
			res.locals.user = user;
			req.user = user;
			let Friendships = db.getFriends();
			Friendships.countDocuments({recipient: user._id, state: 1}, (err, count) => {
				if (err) {
					console.error(err);
					errorNotifier(err, "pseudomode erorr", "pseudomode friend error");
					return next(err);
				}
				res.locals.pendingFriends = count;
				return next();
			})
		}
	})
}