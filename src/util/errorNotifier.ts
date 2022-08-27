import transporter from "./mailer";

/**
 * Notifies developers of errors in the application.
 * @param {Error} error The error to notify about.
 * @param {string} [message] A message to send with the error.
 * @return {void}
 */
export default function (error : Error, message? : string) {
	transporter.sendMail({
		from: '"Vukkybox" <vukkybox@litdevs.org>',
		to: 'contact@litdevs.org',
		subject: 'Vukkybox Error',
		text: `${message ? message + '\n\n' : ''}${error.stack}`
	}).catch(e => {
		console.error(e);
	});
}