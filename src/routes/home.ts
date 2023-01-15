import express, {Request, Response, Router} from 'express';
import csurf from "csurf";
import db from '../databaseManager';
import checkAuth from "../util/auth/checkAuth";
import Vukky from "../classes/Vukky";
import errorNotifier from "../util/errorNotifier";
import LANG_LIST from "../../lang/codes";
import fs from "fs";
import {isValidObjectId} from "mongoose";
import EventType from "../util/events/EventType";

const router : Router = express.Router();

router.get('/', (req : Request, res : Response) => {
	res.render('index', {title: "Vukkybox"});
});

router.get('/login', (req : Request, res : Response) => {
	res.render('login', {title: "Vukkybox"});
});

router.get('/delete', checkAuth, (req: Request, res: Response) => {
	res.render('delete', {title: "NO STOP WHAT ARE YOU DOING"});
})

router.delete('/delete', checkAuth, (req: Request, res: Response) => {
	let Users = db.getUsers();
	Users.deleteOne({_id: req.user._id}, (err) => {
		if(err) {
			errorNotifier(err);
			res.status(500).send("Internal server error");
		}
		req.session.destroy(() => {
			res.sendStatus(200);
		})
	})
})

router.get('/store', (req : Request, res : Response) => {
	res.render('store', {title: "Vukkybox"});
});

router.get('/searchtest', (req : Request, res : Response) => {
	res.render('searchTest', {title: "Vukkybox"});
});

router.get('/usersearch', (req : Request, res : Response) => {
	res.render('userSearch', {title: "Vukkybox"});
});

router.get('/promo', (req : Request, res : Response) => {
	res.render('promo', {title: "Vukkybox"});
});

router.get('/open/:id', checkAuth, (req : Request, res : Response) => {
	let realBoxIds = req.app.locals.boxes.map((box) => box.id);
	if (!realBoxIds.includes(parseInt(req.params.id))) return res.status(404).render('error', {title: "Vukkyboxn't", error: "Box not found"});
	let boxPrice = req.app.locals.boxes.find((box) => box.id === parseInt(req.params.id)).price;
	if (req.user.playerData.balance < boxPrice) return res.status(403).render('error', {title: "Vukkyboxn't", error: "You do not have enough money to open this box"});
	res.render('open', {title: "Vukkybox", boxId: req.params.id});
});

router.get('/collection', (req : Request, res : Response) => {
	if (!req?.query?.user) {
		checkAuth(req, res, () => {
			res.render('collection', {title: "Vukkybox", sortingMethod: req?.query?.sortingMethod, puser: req.user});
		})
	} else {
		let User = db.getUsers();
		User.findOne({_id: req.query.user}, (err, user) => {
			if (err || !user) {
				checkAuth(req, res, () => {
					return res.render('collection', {title: "Vukkybox", sortingMethod: req?.query?.sortingMethod, puser: req.user});
				})
			} else {
				res.render('collection', {title: "Vukkybox", sortingMethod: req?.query?.sortingMethod, puser: user});
			}

		})
	}
});

router.get("/view/:id", (req : Request, res : Response) => {
	let vukkyObj = res.app.locals.vukkies.vukkies.find(vukky => vukky.id === parseInt(req.params.id));
	if (!vukkyObj) return res.status(404).render('error', {title: "Vukkyboxn't", error: "Vukky not found"});
	res.locals.vukky = new Vukky(vukkyObj);
	res.render('view', {title: "Vukkybox"});
})

router.get("/friends", checkAuth, (req : Request, res : Response) => {
	let Users = db.getUsers();
	const lookupFriend = async (id) => {
		return new Promise((resolve, reject) => {
			Users.findOne({_id: id.toString()}, (err, user) => {
				if (err) {
					errorNotifier(err, JSON.stringify({user: req.user, query: req.query, url: req.url}));
					res.status(500).render("error", { title: "Vukkyboxn't :(" });
					reject();
				}
				resolve(user);
			})
		});
	}

	let Friends = db.getFriends();
	Friends.find({$or: [{recipient: res.locals.user._id}, {requester: res.locals.user._id}]}, (err, friends) => {
		if (err) {
			errorNotifier(err, JSON.stringify({user: req.user, query: req.query, url: req.url}));
			return res.status(500).render("error", { title: "Vukkyboxn't :(" });
		}
		if (!friends || friends.length === 0) return res.render("friends", { title: "Vukkybox", friendships: [] });
		let newFriends = [];
		let i = 0
		friends.forEach(async (friend, index) => {
			let idToLookup;
			if (friend.recipient.toString() !== res.locals.user._id.toString()) idToLookup = friend.recipient;
			if (friend.requester.toString() !== res.locals.user._id.toString()) idToLookup = friend.requester;
			if (!idToLookup) {
				i++;
				newFriends[index] = {ship: friend, friend: res.locals.user};
				return;
			}
			let friendData = await lookupFriend(idToLookup);
			if (!friendData) return;
			i++;
			newFriends[index] = {ship: friend, friend: friendData};
			if (i === friends.length) {
				res.render("friends", { title: "Vukkybox", friendships: newFriends})
			}
		})
	})
})

router.get("/settings", checkAuth, (req : Request, res : Response) => {
	let langs = [];
	LANG_LIST.forEach((lang) => {
		let langJson = JSON.parse(fs.readFileSync(`lang/${lang}.json`).toString());
		langs.push({code: lang, name: langJson["lang_full"]});
	})
	res.render("settings", { title: "Vukkybox", languages: langs });
})

router.get("/flag/:flagId", (req : Request, res : Response) => {
	let flag = req.app.locals.flags.find((flag) => flag.id === parseInt(req.params.flagId));
	if (!flag) return res.status(404).render("404", { title: "Vukkyboxn't :(" });
	let Users = db.getUsers();
	Users.find({"flags.flag": flag.id }, (err, users) => {
		if (err) {
			errorNotifier(err, JSON.stringify({user: req.user, query: req.query, url: req.url}));
			return res.status(500).render("error", { title: "Vukkyboxn't :(" });
		}
		res.render("flag", { title: "Vukkybox", flag: flag, users: users });
	})
})

router.get("/event/:eventId", (req: Request, res: Response) => {
	if (!isValidObjectId(req.params.eventId)) return res.status(400).render("error", { title: "Vukkyboxn't :(", error: "Invalid event ID" });
	let Events = db.getEvents();
	Events.findOne({_id: req.params.eventId}, (err, event) => {
		if (err) {
			errorNotifier(err, JSON.stringify({user: req.user, query: req.query, url: req.url}));
			return res.status(500).render("error", { title: "Vukkyboxn't :(" });
		}
		if (!event) return res.status(404).render("error", { title: "Vukkyboxn't :(", error: "Event not found" });
		if (event.type !== EventType.UnboxVukky && (!req.isAuthenticated() || !res.locals.user || !res.locals.user.flags.some(f => f.id === 0))) return res.status(403).render("error", { title: "Vukkyboxn't :(", error: "You are not permitted to view this event." });
		let Users = db.getUsers();
		Users.findOne({_id: event.userId}, (err, user) => {
			if (err) {
				errorNotifier(err, JSON.stringify({user: req.user, query: req.query, url: req.url}));
				return res.status(500).render("error", { title: "Vukkyboxn't :(" });
			}
			if (!user) return res.status(404).render("error", { title: "Vukkyboxn't :(", error: "Event not valid" });
			res.render("event", { title: "Vukkybox", eventObject: event, puser: user });
		})
	})
})

export default router;