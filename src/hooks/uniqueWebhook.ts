// noinspection JSUnusedGlobalSymbols
// The function is used by the hook system, but the linter doesn't realize
import serverEvents from "../index";
import uniqueGetEvent from "../classes/events/uniqueGetEvent";
import dotenv from "dotenv";
import axios from "axios";
import errorNotifier from "../util/errorNotifier";
dotenv.config();

function init() {
	if (process.env.UNIQUE_WEBHOOK) {
		console.log("Unique webhook is enabled.");
		serverEvents.on("uniqueGetEvent", (event : uniqueGetEvent) => {
			const params = {
				username: "Vukkybox rewrite",
				content: "Someone just got an unique!"
			}
			axios.post(process.env.UNIQUE_WEBHOOK, params).catch(err => {
				errorNotifier(err, JSON.stringify(event));
			});
		})
	}
}

export { init }