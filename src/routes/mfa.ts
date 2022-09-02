import express, {Request, Response, Router} from 'express';
import checkAuth from "../util/auth/checkAuth";
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import csurf from "csurf";
import {CSRF_COOKIE_OPTIONS} from "../util/constants/constants";
const router: Router = express.Router();

router.use(csurf({ cookie: CSRF_COOKIE_OPTIONS }));

/**
 * Verify the user's 2FA code against the stored secret.
 * If the code is valid, set the user's validated property to true.
 * If the user is in the middle of the 2FA enabling flow, move the temporary secret to database.
 */
router.post('/verify', checkAuth, (req: Request, res: Response) => {
	if (!req.body.token) return res.status(400).send({error: "No token provided"});
	let tokenValid
	if (res.locals.user.mfa) {
		// User has MFA enabled
		if (!res.locals.user?.mfasecret) return res.status(400).send({error: "2-Factor Authentication is not enabled"});
		tokenValid = authenticator.check(req.body.token, res.locals.user.mfasecret);
	} else {
		// User is in the process of enabling MFA
		if (!req.session?.vukkybox?.tempsecret) return res.status(400).send({error: "2-Factor Authentication is not enabled"});
		tokenValid = authenticator.check(req.body.token, req.session?.vukkybox?.tempsecret);
		// If the token is valid, we can delete the temporary secret from the session and save it to the user.
		if (tokenValid) {
			res.locals.user.mfasecret = req.session.vukkybox.tempsecret
			req.session.vukkybox.tempsecret = undefined;
			res.locals.user.mfa = true;
			res.locals.user.save();
		}
	}
	req.session.vukkybox.validated = true;
	res.send({valid: tokenValid});
});

/**
 * Start the 2FA enabling flow.
 * Generate a temporary secret and store it in the session.
 * Send the secret to the user.
 */
router.post('/enable', checkAuth, (req: Request, res: Response) => {
	if (res.locals.user.mfa) return res.status(400).send({error: "2-Factor Authentication is already enabled"});
	let secret = authenticator.generateSecret();
	req.session.vukkybox.tempsecret = secret;
	let url = authenticator.keyuri(res.locals.user.email, "Vukkybox", secret);
	QRCode.toDataURL(url).then((data) => {
		res.send({secret, qr: data});
	});
});

/**
 * Disable 2FA for the user.
 * Delete the secret from the user.
 * Set the user's mfa property to false.
 * Make sure there is no temporary secret in the session.
 */
router.post('/disable', checkAuth, (req: Request, res: Response) => {
	if (!res.locals.user.mfa) return res.status(400).send({error: "2-Factor Authentication is not enabled"});
	if (!req.session.vukkybox.validated) return res.status(400).send({error: "Validate 2-Factor Authentication first"});
	res.locals.user.mfa = false;
	res.locals.user.mfasecret = undefined;
	req.session.vukkybox.tempsecret = undefined;
	res.locals.user.save();
	res.send({success: true});
});

router.get('/validate', checkAuth, (req: Request, res: Response) => {
	res.render('mfa', {title: 'Vukkybox', csrfToken: req.csrfToken()});
});

router.get('/disable', checkAuth, (req: Request, res: Response) => {
	if (!res.locals.user.mfa) return res.status(400).render("error", {title: "Vukkyboxn't", error: res.locals.lang.mfa.alreadyDisabled});
	res.render('mfadisable', {title: 'Vukkybox', csrfToken: req.csrfToken()});
});

router.get('/enable', checkAuth, (req: Request, res: Response) => {
	if (res.locals.user.mfa) return res.status(400).render("error", {title: "Vukkyboxn't", error: res.locals.lang.mfa.alreadyEnabled});
	res.render('mfaenable', {title: 'Vukkybox', csrfToken: req.csrfToken()});
});

// Once 2FA is validated, the user is redirected here. Redirect them to the page they were trying to access before they validated 2FA.
// This page cannot be accessed if the user is not validated, so no need to check for that.
// Redirect to redirectTo cookie and clear it.
router.get('/success', checkAuth, (req: Request, res: Response) => {
	if (req.cookies['redirectTo']) {
		let dest = req.cookies['redirectTo'];
		res.clearCookie("redirectTo");
		res.redirect(dest);
	} else {
		res.redirect('/');
	}
});

export default router;