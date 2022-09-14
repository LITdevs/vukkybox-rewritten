import express, { Request, Response, Router} from 'express';
import apiAuth from "../util/auth/apiAuth";
import errorNotifier from "../util/errorNotifier";
import db from "../databaseManager";
import Friendship from "../classes/Friendship";
import UserNotification from "../classes/UserNotification";

const router: Router = express.Router();

router.get('/', apiAuth, (req: Request, res: Response) => {
	res.json({message: "Hello World, this is the public API"});
});

router.get('/user', apiAuth, (req : Request, res : Response) => {
	if (req.user.mfa) req.user.mfasecret = undefined;
	if (req.user.apiKey) req.user.apiKey = undefined;
	req.user.email = undefined;
	res.json({user: req.user});
});

router.get('/user/email', apiAuth, (req : Request, res : Response) => {
	if (req.user.mfa) req.user.mfasecret = undefined;
	if (req.user.apiKey) req.user.apiKey = undefined;
	res.json({user: req.user});
})

router.get('/leaderboard', (req : Request, res : Response) => {
	const legalSortTypes = ["totalVukkies", "common", "uncommon", "rare", "mythical", "godly", "bukky", "pukky", "unique", "balance", "boxesOpened", "codesRedeemed"];
	let sortType : string = req.query?.sort?.toString() || "totalVukkies";
	if (!legalSortTypes.includes(sortType)) sortType = "totalVukkies";
	const legalDirections = ["asc", "desc"];
	let sortDirection : string = req.query?.direction?.toString() || "desc";
	if (!legalDirections.includes(sortDirection)) sortDirection = "desc";
	res.json({sortType, sortDirection})
})

router.post('/profile', apiAuth, (req: Request, res: Response) => {
	if (!req.body.action) return res.status(400).json({error: "No action specified"});
	switch (req.body.action) {
		case "update":
			if (!req.body.order && !req.body.bio) return res.status(400).json({error: "Missing parameters"});
			res.locals.user.profile.order = req.body.order || res.locals.user.profile.order;
			if (typeof req.body.bio !== "undefined") res.locals.user.profile.bio = req.body.bio.substring(0, 511)
			res.locals.user.save();
			res.json({error: null, success: true});
			break;
		case "css":
			if (!req.body.css) res.locals.user.profile.css = "";
			if (!req.user.flags.some(flag => flag.flag === 3)) {
				if (req.body.css) res.locals.user.profile.css = req.body.css.replace(/<[^>]*>?/gm, '').replace(/content ?:/gm, 'apply for unrestricted css').replace(/url ?\(/gm, 'apply for unrestricted css');
			} else {
				if (req.body.css) res.locals.user.profile.css = req.body.css.replace(/<[^>]*>?/gm, '');
			}
			res.locals.user.save();
			res.json({error: null, success: true});
			break;
		case "background":
			if (!req.body.bgMode) return res.status(400).json({error: "Missing parameters"});
			switch (req.body.bgMode) {
				case "color":
					if (!req.body.bgColor) return res.status(400).json({error: "Missing parameters"});
					res.locals.user.profile.background.mode = "color";
					res.locals.user.profile.background.color = req.body.bgColor;
					res.locals.user.save();
					res.json({error: null, success: true});
					break;
				case "image":
					if (!req.body.bgImage) return res.status(400).json({error: "Missing parameters"});
					res.locals.user.profile.background.mode = "image";
					res.locals.user.profile.background.image = req.body.bgImage;
					res.locals.user.save();
					res.json({error: null, success: true});
					break;
				case "random":
					res.locals.user.profile.background.mode = "random";
					res.locals.user.save();
					res.json({error: null, success: true});
					break;
				default:
					res.status(400).json({error: "Invalid background mode"});
					break;
			}
			break;
		default:
			res.status(400).json({error: "Invalid action"});
			break;
	}
});

router.post("/notifications/read", apiAuth, (req: Request, res: Response) => {
	if (!req.body.readNotifications) return res.status(400).json({error: "Missing parameters"})
	if (typeof req.body.readNotifications !== "object") return res.status(400).json({error: "readNotifications must be an array"})
	try {
		res.locals.user.playerData.notifications = res.locals.user.playerData.notifications.filter(notification => !req.body.readNotifications.includes(notification.id.toString()));
		res.locals.user.save();
		return res.json({error: null})
	} catch (e) {
		errorNotifier(e, JSON.stringify({user: req.user, body: req.body}));
		return res.status(500).json({error: "Internal server error"});
	}
})

router.post("/friendship/add", apiAuth, (req : Request, res: Response) => {
	if (!req.body.friendId) return res.status(400).json({error: "Missing parameters"});
	let requesterId : string = res.locals.user._id.toString()
	let Friend = db.getFriends();
	let Users = db.getUsers();
	Friend.findOne({$or:[{requester: requesterId},{recipient: requesterId}]}, (err, friendship : Friendship) => {
		if (err) {
			res.status(500).json({error: "Internal server error"});
			return errorNotifier(err, `${res.locals.username} tried to friend ${req.body.friendId}`);
		}
		if (friendship) {
			return res.status(400).json({error: "Already friends"})
		}
		if (!friendship) {
			new Friend(new Friendship(requesterId, req.body.friendId)).save();
			res.json({error: null})
			Users.findOne({_id: req.body.friendId.toString()}, (err, user) => {
				user.playerData.notifications.push(new UserNotification("New friend request", `${res.locals.user.username} has requested to be your friend!`, "/resources/duolingo.webp"));
				user.save();
			})
		}
	})
})

export default router;