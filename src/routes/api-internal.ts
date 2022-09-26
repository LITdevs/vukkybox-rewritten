import express, { Request, Response, Router} from 'express';
import checkAuth from "../util/auth/checkAuth";
import csurf from "csurf";
import openBox from "../util/vukkybox/openBox";
import event from "../index";
import uniqueGetEvent from "../classes/events/uniqueGetEvent";

const router: Router = express.Router();

router.use(csurf({ cookie: true }));

router.get('/', checkAuth, (req: Request, res: Response) => {
	res.json({message: "Hello World, this is the internal API"});
})

router.post('/open/:id', checkAuth, (req : Request, res : Response) => {
	let realBoxIds = req.app.locals.boxes.map((box) => box.id);
	if (!realBoxIds.includes(parseInt(req.params.id))) return res.status(404).render('error', {title: "Vukkyboxn't", error: "Box not found"});
	let boxPrice = req.app.locals.boxes.find((box) => box.id === parseInt(req.params.id)).price;
	if (req.user.playerData.balance < boxPrice) return res.status(403).send({error: "You do not have enough money to open this box"});
	res.locals.user.playerData.balance -= boxPrice;
	let box = req.app.locals.boxes.find((box) => box.id === parseInt(req.params.id));

	openBox(box).then(vukky => {
		// Make sure properties exist
		if (!res.locals.user.playerData.collection) res.locals.user.playerData.collection = {};
		if (!res.locals.user.statistics) res.locals.user.statistics = {};
		if (!res.locals.user.statistics.duplicatesGotten) res.locals.user.statistics.duplicatesGotten = 0;
		if (!res.locals.user.statistics.boxesOpened) res.locals.user.statistics.boxesOpened = 0;
		if (!res.locals.user.statistics.rarity[vukky.rarity]) res.locals.user.statistics.rarity[vukky.rarity] = 0;

		// Increment statistics
		res.locals.user.statistics.boxesOpened += 1;
		res.locals.user.statistics.rarity[vukky.rarity] += 1;

		// Is duplicate?
		if (res.locals.user.playerData.collection[vukky.id]) {
			// Duplicate
			res.locals.user.statistics.duplicatesGotten += 1;
			res.locals.user.playerData.collection[vukky.id] += 1;
			if (!box.noRefund) res.locals.user.playerData.balance += box.price * 0.1;
		} else {
			// New
			res.locals.user.playerData.collection[vukky.id] = 1;
		}

		// Save user and return json response
		res.locals.user.markModified('playerData');
		res.locals.user.markModified('statistics');
		res.locals.user.playerData.balance = res.locals.user.playerData.balance.toFixed(2);
		res.locals.user.save();
		if (vukky.rarity === "unique") event.emit("uniqueGetEvent", new uniqueGetEvent(vukky, res.locals.user));
		res.json(vukky)
	})
})

export default router;