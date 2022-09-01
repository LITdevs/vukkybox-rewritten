import transporter from "./mailer";

/**
 * Notifies developers of errors in the application.
 * @param {Error | string} error The error to notify about.
 * @param {string} [message] A message to send with the error.
 * @param {string} [subject] Notification subject.
 * @return {void}
 */
export default function (error : Error | string, message? : string, subject? : string) {
	transporter.sendMail({
		from: '"Vukkybox" <vukkybox@litdevs.org>',
		to: 'contact@litdevs.org',
		subject: subject ? subject : 'Vukkybox Error',
		text: `${message ? message + '\n\n' : ''}${typeof error === "object" ? error.stack : error}`
	}).catch(e => {
		console.error(e);
	});
}