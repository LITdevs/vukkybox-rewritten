import express, { Request, Response, Router} from 'express';
import apiAuth from "../util/auth/apiAuth";

const router: Router = express.Router();

router.get('/', apiAuth, (req: Request, res: Response) => {
	res.json({message: "Hello World, this is the internal API"});
});

router.get('/user', apiAuth, (req : Request, res : Response) => {
	res.json({...req.user, mfasecret: null, email: null });
});

router.get('/user/email', apiAuth, (req : Request, res : Response) => {
	res.json({...req.user, mfasecret: null, email: null });
})

export default router;