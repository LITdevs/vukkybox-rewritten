import express, {Request, Response, Router} from 'express';
import checkAuth from "../util/auth/checkAuth";
import { ADMINS } from "../util/constants/constants";
import csurf from "csurf";

const router: Router = express.Router();

// TODO: Change the csrf cookie on all routers to be pulled from constants.ts, httpOnly, samesite etc...
router.use(csurf({ cookie: true }));
router.use(checkAuth);
router.use((req, res, next) => {
	if(!ADMINS.includes(String(req.user.litauthId))) return res.status(403).render('error', {title: "Vukkyboxn't", error: "403 FORBIDDEN\n You are not an administrator."});
	res.locals.csrfToken = req.csrfToken();
	next();
})

router.get('/', (req: Request, res: Response) => {
	return res.render('admin', {title: "Vukkybox - Admin"});
});

router.post('/giveall', (req: Request, res: Response) => {
	let allRarities = Object.keys(req.app.locals.vukkies.rarity);
	let allVukkyIds = [];
	allRarities.forEach(rarity => {
		allVukkyIds = allVukkyIds.concat(Object.keys(req.app.locals.vukkies.rarity[rarity]));
	})
	let allVukkies = {}
	allVukkyIds.forEach(vukkyId => {
		allVukkies[vukkyId] = 999;
	})
	res.locals.user.playerData.collection = allVukkies;
	res.locals.user.save();
	res.send("Successfully gave all vukkies to user");
})

export default router;