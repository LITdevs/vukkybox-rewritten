import express, { Request, Response, Router } from 'express';
import csurf from "csurf";
import checkAuth from "../util/auth/checkAuth";
const router : Router = express.Router();

router.use(csurf({ cookie: true }));

router.get('/', (req : Request, res : Response) => {
	res.render('index', {title: "Vukkybox"});
});

router.get('/test', (req : Request, res : Response) => {
	res.render('test', {title: "Vukkybox"});
})

router.get('/open/:id', checkAuth, (req : Request, res : Response) => {
	let realBoxIds = req.app.locals.boxes.map((box) => box.id);
	if (!realBoxIds.includes(parseInt(req.params.id))) return res.status(404).render('error', {title: "Vukkyboxn't", error: "Box not found"});
	let boxPrice = req.app.locals.boxes.find((box) => box.id === parseInt(req.params.id)).price;
	if (req.user.playerData.balance < boxPrice) return res.status(403).render('error', {title: "Vukkyboxn't", error: "You do not have enough money to open this box"});
	res.render('open', {title: "Vukkybox", boxId: req.params.id});
})

export default router;