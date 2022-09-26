import Friendship, {Status} from "../Friendship";

class friendEvent {
	oldState? : Status;
	user;
	friendship : Friendship;
	constructor(friendship, user, oldState? : Status) {
		if (oldState) this.oldState = oldState;
		if (!oldState) this.oldState = Status.NeverFriends;
		this.friendship = friendship;
		this.user = user;
	}
}

export default friendEvent;