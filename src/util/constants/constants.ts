import dotenv from 'dotenv';
import SMTPTransport from "nodemailer/lib/smtp-transport";
import {CookieOptions} from "csurf";
dotenv.config();

const LOGIN_ROUTE = "/auth/oauth";
const MFA_ROUTE = "/2fa/validate";
const MFA_POST_ROUTE = "/2fa/verify";
const ADMINS = ["62b3515989cdb45c9e06e010"];

const CSRF_COOKIE_OPTIONS : CookieOptions = {
	httpOnly: true,
	sameSite: "strict",
	secure: process.env.CALLBACK_URL.startsWith("https")
}

const MAILER_CONFIG : SMTPTransport.Options = {
	host: process.env.MAILER_HOST,
	port: Number(process.env.MAILER_PORT),
	secure: process.env?.MAILER_SECURE == "true",
	auth: {
		user: process.env.MAILER_USER,
		pass: process.env.MAILER_PASS
	},
	tls: {
		ciphers: process.env.MAILER_CIPHERS,
		rejectUnauthorized: Boolean(process.env.MAILER_REJECT_UNAUTHORIZED)
	}
}

export {
	LOGIN_ROUTE,
	MFA_ROUTE,
	MFA_POST_ROUTE,
	ADMINS,
	CSRF_COOKIE_OPTIONS,
	MAILER_CONFIG
}