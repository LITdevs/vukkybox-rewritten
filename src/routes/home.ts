import express, {Request, Response, Router} from 'express';
import csurf from "csurf";
import db from '../databaseManager';
import checkAuth from "../util/auth/checkAuth";
import {CSRF_COOKIE_OPTIONS} from "../util/constants/constants";
import Vukky from "../classes/Vukky";
import errorNotifier from "../util/errorNotifier";

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
	let Friends = db.getFriends();
	Friends.find({$or: [{recipient: req.query.userId}, {requester: req.query.userId}]}, (err, friends) => {
		if (err) {
			errorNotifier(err, JSON.stringify({user: req.user, query: req.query, url: req.url}));
			return res.status(500).render("error", { title: "Vukkyboxn't :(" });
		}
		res.render("friends", { title: "Vukkybox", friends})
	})
})

export default router;