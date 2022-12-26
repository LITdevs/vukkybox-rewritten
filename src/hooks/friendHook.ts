// The function is used by the hook system, but the linter doesn't realize
// noinspection JSUnusedGlobalSymbols
import serverEvents from "../index";
import friendEvent from "../classes/events/friendEvent";
import {Status} from "../classes/Friendship";
import UserNotification from "../classes/UserNotification";
import sendNotification from "../util/sendNotification";

function init() {
	serverEvents.on("friendEvent", (event : friendEvent) => {
		if (event.friendship.recipient == event.friendship.requester) {
			if (event.oldState === Status.Pending && event.friendship.state === Status.Accepted) {
				// Make sure user hasn't been awarded badge before
				// Give them the friendself badge
				const hasBadge = event.user.flags.some(flag => flag.flag === 4);
				if (hasBadge) return;
				event.user.flags.push({flag: 4, date: new Date(), reason: "THAT'S NOT HOW IT WORKS"})
				sendNotification(new UserNotification("New badge...", "You've been awarded a... new badge....", "/flags/friendself.webp"), event.user);
				event.user.save();
			}
			if (event.oldState === Status.Accepted && event.friendship.state === Status.NoFriendship) {
				// Make sure user hasn't been awarded badge before
				// Give them the unfriendself badge
				const hasBadge = event.user.flags.some(flag => flag.flag === 5);
				if (hasBadge) return;
				event.user.flags.push({flag: 5, date: new Date()})
				sendNotification(new UserNotification("New badge...", "You've been awarded a... new badge....", "/flags/unfriendself.webp"), event.user);
				event.user.save();
			}
		}
	})
	serverEvents.on("doubleFriendEvent", (event) => {
		// Make sure user hasn't been awarded badge before
		// Give them the stalker badge
		if (event.friendship.recipient == event.friendship.requester) {
			const hasBadge = event.user.flags.some(flag => flag.flag === 7);
			if (hasBadge) return;
			event.user.flags.push({flag: 7, date: new Date()})
			sendNotification(new UserNotification("Huh...", "You've been awarded a new badge", "/flags/ego.webp"), event.user);
			event.user.save();

		} else {
			const hasBadge = event.user.flags.some(flag => flag.flag === 6);
			if (hasBadge) return;
			event.user.flags.push({flag: 6, date: new Date()})
			sendNotification(new UserNotification("Stalker!", "You've been awarded a new badge", "/flags/stalker.webp"), event.user);
			event.user.save();
		}
	})
}

export { init }