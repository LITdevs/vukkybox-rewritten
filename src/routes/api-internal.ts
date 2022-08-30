import express, { Request, Response, Router} from 'express';
import checkAuth from "../util/checkAuth";
import csurf from "csurf";

const router: Router = express.Router();

router.use(csurf({ cookie: true }));

router.get('/', checkAuth, (req: Request, res: Response) => {
	res.json({message: "Hello World, this is the internal API"});
})

export default router;