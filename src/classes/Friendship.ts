import { Types } from "mongoose";

enum Status {
	NoFriendship,
	Pending,
	Accepted
}

interface IFriendship {
	_id: Types.ObjectId;
	requester: string;
	recipient: string;
	timestamp: Date;
	state: Status;
}

const FriendSchema = {
	_id: Types.ObjectId,
	requester: String,
	recipient: String,
	timestamp: Date,
	state: Number
}

class Friendship implements IFriendship {
	_id: Types.ObjectId;
	recipient: string;
	requester: string;
	state: Status;
	timestamp: Date;

	constructor(requester : string, recipient : string, state?: Status) {
		this.timestamp = new Date();
		this.state = state || Status.Pending;
		this._id = new Types.ObjectId();
		this.recipient = recipient;
		this.requester = requester;

	}
}

export default Friendship;
export { Status, IFriendship, FriendSchema };