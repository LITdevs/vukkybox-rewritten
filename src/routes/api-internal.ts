import express, { Request, Response, Router} from 'express';
import checkAuth from "../util/auth/checkAuth";
import csurf from "csurf";
import openBox from "../util/vukkybox/openBox";

const router: Router = express.Router();

router.use(csurf({ cookie: true }));

router.get('/', checkAuth, (req: Request, res: Response) => {
	res.json({message: "Hello World, this is the internal API"});
})

router.get('/open/:id', checkAuth, (req : Request, res : Response) => {
	let realBoxIds = req.app.locals.boxes.map((box) => box.id);
	if (!realBoxIds.includes(parseInt(req.params.id))) return res.status(404).render('error', {title: "Vukkyboxn't", error: "Box not found"});
	let boxPrice = req.app.locals.boxes.find((box) => box.id === parseInt(req.params.id)).price;
	if (req.user.playerData.balance < boxPrice) return res.status(403).render('error', {title: "Vukkyboxn't", error: "You do not have enough money to open this box"});

	let box = req.app.locals.boxes.find((box) => box.id === parseInt(req.params.id));

	openBox(box).then(vukky => {
		res.json(vukky)
	})
})

export default router;