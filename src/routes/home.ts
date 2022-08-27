import express, { Request, Response, Router } from 'express';
import checkAuth from '../util/checkAuth';
const router : Router = express.Router();

router.get('/', (req : Request, res : Response) => {
	res.render('index', {title: "Vukkybox"});
});

router.get('/info', checkAuth, (req : Request, res : Response) => {
	res.render('info', {title: "Vukkybox"});
});


export default router;