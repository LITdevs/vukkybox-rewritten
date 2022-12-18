// noinspection JSUnusedGlobalSymbols
// The function is used by the hook system, but the linter doesn't realize
import dotenv from "dotenv";
import errorNotifier from "../util/errorNotifier";
import serverEvents from "../index";
import fs from "fs";
import transporter from "../util/mailer";
dotenv.config();

function init() {
	serverEvents.on("notification", (data) => {
		try {
			let userEmail = data.user.email;
			let emailBody = fs.readFileSync(`${__dirname}/../../../views/email/notification.html`).toString();
			emailBody = emailBody.replace(/\$notifTitle/gm, data.notification.title);
			emailBody = emailBody.replace(/\$notifBody/gm, data.notification.body);
			transporter.sendMail({
				from: '"Vukkybox" <vukkybox@litdevs.org>',
				to: userEmail,
				subject: 'New Vukkybox notification',
				html: emailBody
			}).catch(e => {
				console.error(e);
			});
		} catch (e) {
			console.error(e);
			errorNotifier(e, "Error sending notification email");
		}
	})
}

export { init }