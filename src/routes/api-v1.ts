import express, { Request, Response, Router} from 'express';
import apiAuth from "../util/auth/apiAuth";
import errorNotifier from "../util/errorNotifier";
import db from "../databaseManager";
import Friendship, { Status } from "../classes/Friendship";
import UserNotification from "../classes/UserNotification";
import event from "../index";
import friendEvent from "../classes/events/friendEvent";

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

	// Look for an existing friendship
	Friend.findOne({$or:[{requester: requesterId, recipient: req.body.friendId},{requester: req.body.friendId, recipient: requesterId}]}, (err, friendship) => {
		if (err) {
			res.status(500).json({error: "Internal server error"});
			return errorNotifier(err, `${res.locals.username} tried to friend ${req.body.friendId}`);
		}
		if (friendship) {
			if (friendship.state !== Status.NoFriendship) {
				event.emit("doubleFriendEvent", { friendship })
				return res.status(400).json({error: "Already friends"});
			} else {
				let oldState = friendship.state
				friendship.state = Status.Pending;
				friendship.timestamp = new Date();
				Users.findOne({_id: req.body.friendId.toString()}, (err, user) => {
					if (!user) return res.status(400).json({error: "No such user"});
					if (err) {
						res.status(500).json({error: "Internal server error"});
						return errorNotifier(err, `${res.locals.username} tried to friend ${req.body.friendId}`);
					}
					res.json({error: null});
					user.playerData.notifications.push(new UserNotification("New friend request", `${res.locals.user.username} has requested to be your friend!`, "/resources/duolingo.webp"));
					event.emit("friendEvent", new friendEvent(friendship, oldState))
					friendship.save();
					user.save();
				})
			}
		}
		if (!friendship) {
			let frsh = new Friend(new Friendship(requesterId, req.body.friendId));
			Users.findOne({_id: req.body.friendId.toString()}, (err, user) => {
				if (!user) return res.status(400).json({error: "No such user"});
				if (err) {
					res.status(500).json({error: "Internal server error"});
					return errorNotifier(err, `${res.locals.username} tried to friend ${req.body.friendId}`);
				}
				res.json({error: null})
				user.playerData.notifications.push(new UserNotification("New friend request", `${res.locals.user.username} has requested to be your friend!`, "/resources/duolingo.webp"));
				event.emit("friendEvent", new friendEvent(friendship))
				frsh.save();
				user.save();
			})
		}
	})
})

router.post("/friendship/accept", apiAuth, (req : Request, res: Response) => {
	if(!req.body.requestId) return res.status(400).json({error: "Missing parameters"});
	let Friends = db.getFriends();
	// Find a friendship with the provided ID, and where the user accepting it is the recipient.
	Friends.findOne({ _id: req.body.requestId, recipient: res.locals.user._id.toString()}, (err, friendship) => {
		if (err) {
			res.status(500).json({error: "Internal server error"});
			return errorNotifier(err, `${res.locals.username} tried to accept ${req.body.requestId}`);
		}

		// Making sure a pending request was found
		if (!friendship || friendship.state !== Status.Pending) return res.json({error: "No such friend request"});

		let oldState = friendship.state;
		// Accept it :)
		friendship.state = Status.Accepted;
		friendship.timestamp = new Date();
		event.emit("friendEvent", new friendEvent(friendship, oldState))
		friendship.save();
	})
})

router.post("/friendship/reject", apiAuth, (req : Request, res: Response) => {
	if(!req.body.requestId) return res.status(400).json({error: "Missing parameters"});
	let Friends = db.getFriends();
	// Find a friendship with the provided ID, and where the user rejecting it is the recipient.
	Friends.findOne({ _id: req.body.requestId, recipient: res.locals.user._id.toString()}, (err, friendship) => {
		if (err) {
			res.status(500).json({error: "Internal server error"});
			return errorNotifier(err, `${res.locals.username} tried to reject ${req.body.requestId}`);
		}

		// Making sure a pending request was found
		if (!friendship || friendship.state !== Status.Pending) return res.json({error: "No such friend request"});

		let oldState = friendship.state;

		// Reject it :)
		friendship.state = Status.NoFriendship;
		event.emit("friendEvent", new friendEvent(friendship, oldState))
		friendship.save();
	})
})

router.post("/friendship/remove", apiAuth, (req : Request, res: Response) => {
	if(!req.body.requestId) return res.status(400).json({error: "Missing parameters"});
	let Friends = db.getFriends();
	// Find a friendship with the provided ID, and where the user can be the requester or recipient
	Friends.findOne({$or:[{requester: res.locals.user._id, _id: req.body.requestId},{recipient: res.locals.user._id, _id: req.body.requestId}]}, (err, friendship) => {
		if (err) {
			res.status(500).json({error: "Internal server error"});
			return errorNotifier(err, `${res.locals.username} tried to unfriend ${req.body.requestId}`);
		}

		// Making sure a pending request was found
		if (!friendship) return res.json({error: "No such friend request"});

		let oldState = friendship.state;

		// Unfriend :)
		friendship.state = Status.NoFriendship;
		event.emit("friendEvent", new friendEvent(friendship, oldState))
		friendship.save();
		res.json({error: null})
	})
})

router.get('/friendship/get', (req : Request, res: Response) => {
	// return friendship by id
})

export default router;