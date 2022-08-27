import dotenv from 'dotenv';
import SMTPTransport from "nodemailer/lib/smtp-transport";
dotenv.config();

const LOGIN_ROUTE = "/auth/oauth";

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
	MAILER_CONFIG
}