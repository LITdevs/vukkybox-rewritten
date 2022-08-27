import nodemailer from "nodemailer";
import {MAILER_CONFIG} from "./constants";

let transporter = nodemailer.createTransport({pool: true, ...MAILER_CONFIG});

/**
 * Verifies that the SMTP connection is working.
 * @return {Promise<true>} A promise that resolves to true if the connection is working.
 */
function verifyConnection() {
	return new Promise((resolve) => {
		transporter.verify((err, success) => {
			if (err) {
				console.error(err);
				return resolve(false);
			}
			resolve(success);
		});
	});
}

export default transporter;
export {verifyConnection};