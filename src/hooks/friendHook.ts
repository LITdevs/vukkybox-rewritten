// The function is used by the hook system, but the linter doesn't realize
// noinspection JSUnusedGlobalSymbols
import serverEvents from "../index";
import friendEvent from "../classes/events/friendEvent";
import {Status} from "../classes/Friendship";
import db from "../databaseManager";
import errorNotifier from "../util/errorNotifier";

function init() {
	serverEvents.on("friendEvent", (event : friendEvent) => {
		if (event.friendship.recipient == event.friendship.requester) {
			if (event.oldState === Status.Pending && event.friendship.state === Status.Accepted) {
				// Fetch user

				// Make sure user hasn't been awarded badge before

				// Give them the friendself badge
			}
			if (event.oldState === Status.Accepted && event.friendship.state === Status.NoFriendship) {
				// Fetch user

				// Make sure user hasn't been awarded badge before

				// Give them the unfriendself badge
			}
		}
	})
	serverEvents.on("doubleFriendEvent", () => {
		// Fetch user

		// Make sure user hasn't been awarded badge before

		// Give them the stalker badge
	})
}

function getUser(userId) {
	return new Promise(resolve => {
		let Users = db.getUsers();
		Users.findOne({_id: userId}, (err, user) => {
			if (err) {
				errorNotifier(err, `Error while getting ${userId} for friendHook`)
				return resolve(null);
			}
			return resolve(user);
		})
	})
}

export { init }