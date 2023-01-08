// noinspection JSUnusedGlobalSymbols
// The function is used by the hook system, but the linter doesn't realize
import serverEvents from "../index";
import dotenv from "dotenv";
import axios from "axios";
import errorNotifier from "../util/errorNotifier";
dotenv.config();

function init() {
	if (process.env.ADMIN_WEBHOOK) {
		console.log("Admin webhook is enabled.");
		serverEvents.on("adminAccess", (event : {user: any, url: string, method: string, query?: any, headers?: any, body?: any}) => {
			let fields = [
				{
					name: "Method",
					value: event.method,
				},
				{
					name: "URL",
					value: event.url,
				},
				{
					name: "Username & ID",
					value: `${event.user.username} (${event.user._id})`,
				}
				/*event.headers && {
                    name: "Headers",
                    value: JSON.stringify(event.headers),
                },*/
			]
			if (Object.keys(event.query).length > 0) fields.push({
				name: "Query",
				value: JSON.stringify(event.query),
			})
			if (Object.keys(event.body).length > 0) fields.push({
				name: "Body",
				value: JSON.stringify(event.body),
			})
			const params = {
				username: "VBAAL (Vukkybox Admin Access Log)",
				avatar_url: `https://auth.litdevs.org/api/avatar/bg/${event.user.litauthId}`,
				embeds: [
					{
						title: `Access to ${event.url} by ${event.user.username}`,
						type: "rich",
						timestamp: new Date().toISOString(),
						fields: fields
					}
				]
			}
			axios.post(event.method === "GET" ? process.env.ADMIN_WEBHOOK_VBAAL_GET : process.env.ADMIN_WEBHOOK, params).catch(err => {
				console.error(err);
				errorNotifier(err, JSON.stringify(event));
			});
		})
	}
}

export { init }