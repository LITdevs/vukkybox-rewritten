import express, { Request, Response, Router} from 'express';
import apiAuth from "../util/auth/apiAuth";

const router: Router = express.Router();

router.get('/', apiAuth, (req: Request, res: Response) => {
	res.json({message: "Hello World, this is the internal API"});
});

//TODO: mfasecret and email are not correctly filtered out
router.get('/user', apiAuth, (req : Request, res : Response) => {
	res.json({...req.user, mfasecret: null, email: null });
});

//TODO: mfasecret and email are not correctly filtered out
router.get('/user/email', apiAuth, (req : Request, res : Response) => {
	res.json({...req.user, mfasecret: null});
})

export default router;