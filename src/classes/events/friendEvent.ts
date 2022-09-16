import Friendship, {Status} from "../Friendship";

class friendEvent {
	oldState? : Status;
	friendship : Friendship;
	constructor(friendship, oldState? : Status) {
		if (oldState) this.oldState = oldState;
		if (!oldState) this.oldState = Status.NeverFriends;
		this.friendship = friendship;
	}
}

export default friendEvent;