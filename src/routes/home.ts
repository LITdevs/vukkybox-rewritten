import express, {Request, Response, Router} from 'express';
import csurf from "csurf";
import db from '../databaseManager';
import checkAuth from "../util/auth/checkAuth";
import {CSRF_COOKIE_OPTIONS} from "../util/constants/constants";
import Vukky from "../classes/Vukky";
import errorNotifier from "../util/errorNotifier";
import LANG_LIST from "../../lang/codes";
import fs from "fs";

const router : Router = express.Router();

router.use(csurf({ cookie: CSRF_COOKIE_OPTIONS }));


router.get('/', (req : Request, res : Response) => {
	res.render('index', {title: "Vukkybox"});
});

router.get('/store', (req : Request, res : Response) => {
	res.render('store', {title: "Vukkybox"});
});

router.get('/open/:id', checkAuth, (req : Request, res : Response) => {
	let realBoxIds = req.app.locals.boxes.map((box) => box.id);
	if (!realBoxIds.includes(parseInt(req.params.id))) return res.status(404).render('error', {title: "Vukkyboxn't", error: "Box not found"});
	let boxPrice = req.app.locals.boxes.find((box) => box.id === parseInt(req.params.id)).price;
	if (req.user.playerData.balance < boxPrice) return res.status(403).render('error', {title: "Vukkyboxn't", error: "You do not have enough money to open this box"});
	res.render('open', {title: "Vukkybox", boxId: req.params.id, csrfToken: req.csrfToken()});
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
	let rarities = Object.keys(req.app.locals.vukkies.rarity);
	let rarity = rarities.find((rarity) => Object.keys(req.app.locals.vukkies.rarity[rarity]).includes(req.params.id));
	if (!rarity) return res.status(404).render('error', {title: "Vukkyboxn't", error: "Vukky not found"});
	let vukkyObj = req.app.locals.vukkies.rarity[rarity][req.params.id];
	res.locals.vukky = new Vukky(parseInt(req.params.id), vukkyObj.url, vukkyObj.name, vukkyObj.description, rarity, vukkyObj.creator);
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
	res.render("settings", { title: "Vukkybox", languages: langs, csrfToken: req.csrfToken() });
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

export default router;