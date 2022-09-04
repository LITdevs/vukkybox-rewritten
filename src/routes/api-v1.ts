import express, { Request, Response, Router} from 'express';
import apiAuth from "../util/auth/apiAuth";

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
			if (!req.body.order) return res.status(400).json({error: "Missing parameters"});
			res.locals.user.profile.order = req.body.order;
			res.locals.user.save();
			res.json({error: null, success: true});
			break;
		case "css":
			if (!req.body.css) res.locals.user.profile.css = "";
			if (req.body.css) res.locals.user.profile.css = req.body.css.replace(/<[^>]*>?/gm, '');
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

export default router;