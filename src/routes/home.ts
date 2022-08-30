import express, { Request, Response, Router } from 'express';
import csurf from "csurf";
const router : Router = express.Router();

router.use(csurf({ cookie: true }));

router.get('/', (req : Request, res : Response) => {
	res.render('index', {title: "Vukkybox"});
});

router.get('/langtest', (req : Request, res : Response) => {
	res.render('langtest', {title: "Vukkybox"});
})

export default router;