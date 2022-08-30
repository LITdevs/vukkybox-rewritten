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

export default router;