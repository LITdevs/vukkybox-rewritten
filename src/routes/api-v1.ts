import express, {Request, Response, Router} from 'express';
import apiAuth from "../util/auth/apiAuth";
import errorNotifier from "../util/errorNotifier";
import db from "../databaseManager";
import {isValidObjectId} from "mongoose";
import friendshipAPI from "./api/v1/friendshipAPI";
import compare from "../util/stringComparision";
import {checkCodeStatus, claimCode, ClaimResult, CodeStatus} from "../util/codeHelper";

const router: Router = express.Router();

router.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "*, Authorization");
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	next();
})
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

router.get('/user/friends', (req : Request, res : Response) => {
	if (!req.query.userId) return res.status(400).json({error: "Missing parameters"})
	if (!isValidObjectId(req.query.userId)) return res.status(400).json({error: "Invalid userId"})
	let Friends = db.getFriends()
	Friends.find({$or: [{recipient: req.query.userId}, {requester: req.query.userId}]}, (err, friends) => {
		if (err) {
			errorNotifier(err, JSON.stringify({user: req.user, query: req.query, url: req.url}));
			return res.status(500).json({error: "Internal server error"});
		}
		return res.json(friends);
	})
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

router.get("/notifications", apiAuth, (req : Request, res : Response) => {
	return res.json(res.locals.user.playerData.notifications);
})

router.get("/users/search/:username", (req : Request, res : Response) => {
	if (!req.params.username) return res.status(400).send("Please provide an username")
	let Users = db.getUsers();
	Users.find({}, (err, users) => {
		if (err) {
			errorNotifier(err);
			return res.status(500).send("Internal Server Error")
		}
		let usernames = users.map(user => user.username);
		let resultArray = [];
		usernames.forEach(username => {
			let similarityScore = compare(username.toLowerCase(), req.params.username.toString().toLowerCase())
			if (similarityScore > 0.4) {
				let user = users.find(user => user.username === username)
				resultArray.push({ username, score: similarityScore, _id: user._id, avatarURI: `https://auth.litdevs.org/api/avatar/bg/${user.litauthId}` });
			}
		})
		resultArray.sort((a, b) => b.score - a.score);
		res.json(resultArray)
	})
})

router.post("/promo/claim", apiAuth, async (req : Request, res : Response) => {
	if (!req.body.code) return res.status(400).send("Please provide a code");
	let codeValidity : CodeStatus = await checkCodeStatus(req.body.code, res.locals.user);
	if ([CodeStatus.Claimable, CodeStatus.InfiniteUses].includes(codeValidity)) {
		let claimResult : ClaimResult = await claimCode(req.body.code, res.locals.user);
		if (claimResult === ClaimResult.Claimed) {
			return res.status(200).send("CLAIMED");
		} else {
			res.status(500).send("ERR_INTERNALSERVERERROR")
		}
	} else {
		switch (codeValidity) {
			case CodeStatus.Claimed:
				res.status(403).send("ERR_CLAIMED")
				break;
			case CodeStatus.InvalidCode:
				res.status(404).send("ERR_INVALID")
				break;
			case CodeStatus.ServerError:
				res.status(500).send("ERR_INTERNALSERVERERROR")
				break;
			case CodeStatus.NoUses:
				res.status(403).send("ERR_NOUSES")
				break;
		}
	}
})

router.use(friendshipAPI);

export default router;