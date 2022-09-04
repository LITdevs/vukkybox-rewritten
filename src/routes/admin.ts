import express, {Request, Response, Router} from 'express';
import checkAuth from "../util/auth/checkAuth";
import { CSRF_COOKIE_OPTIONS } from "../util/constants/constants";
import csurf from "csurf";
import errorNotifier from "../util/errorNotifier";
import {setVukkyList, vukkyList} from "../index";
import multer from "multer";
import path from "path";

// Storing the new vukky images
let storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, `${__dirname}/../../../public/resources`)
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname))
	}
})

let upload = multer({storage})

const router: Router = express.Router();

router.use(csurf({ cookie: CSRF_COOKIE_OPTIONS }));
router.use(checkAuth);
router.use((req, res, next) => {
	if(!req.user.flags.some(flag => flag.flag === 0)) {
		errorNotifier(`User ${req.user._id} (${req.user.username}) tried to access the admin panel.`, JSON.stringify({user: req.user, url: req.originalUrl, method: req.method, query: req?.query, headers: req?.headers}), "Vukkybox Admin Access Alert");
		return res.status(403).render('error', {title: "Vukkyboxn't", error: "403 Forbidden<br> You are not an administrator. This incident will be reported."});
	}
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
	let allVukkies = {};
	allVukkyIds.forEach(vukkyId => {
		allVukkies[vukkyId] = 999;
	})
	res.locals.user.playerData.collection = allVukkies;
	res.locals.user.save();
	res.send("Successfully gave all vukkies to user");
})

router.get('/vukkydesigner', (req: Request, res: Response) => {
	return res.render('admin/vukkydesigner', {title: "Vukkybox - Vukky Designer"});
})

router.post('/createvukky', upload.single('image'),(req: Request, res: Response) => {
	if (!req.body.name || !req.body.description || !req.body.rarity) {
		return res.status(400).json({error: "Missing parameters"});
	}
	if (!req.file) {
		return res.status(400).json({error: "Missing file"});
	}
	let newVukkyList = vukkyList;
	newVukkyList.currentId++;
	let newId = vukkyList.currentId;
	newVukkyList.rarity[req.body.rarity][newId] = {
		name: req.body.name,
		description: req.body.description,
		url: `https://vukkybox.com/resources/${req.file.filename}`,
		rarity: req.body.rarity
	}
	if (req.body.creator) newVukkyList.rarity[req.body.rarity][newId].creator = req.body.creator;
	setVukkyList(newVukkyList);
	console.log(`New Vukky added: ${req.body.name} (${newId})`);
	res.json({success: true});
})

router.post('/flag', (req: Request, res: Response) => {
	res.locals.user.flags.push({flag: 0, date: new Date()});
	res.locals.user.save();
	res.json({error: null});
});

export default router;