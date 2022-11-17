import { Types } from "mongoose";

enum Status {
	NoFriendship,
	Pending,
	Accepted,
	NeverFriends
}

interface IFriendship {
	_id: Types.ObjectId;
	requester: string;
	recipient: string;
	timestamp: Date;
	originalDate: Date;
	state: Status;
	friend?: object;
}

const FriendSchema = {
	_id: Types.ObjectId,
	requester: String,
	recipient: String,
	timestamp: Date,
	originalDate: Date,
	state: Number
}

class Friendship implements IFriendship {
	_id: Types.ObjectId;
	recipient: string;
	requester: string;
	state: Status;
	timestamp: Date;
	originalDate: Date;
	friend?: object;

	constructor(requester : string, recipient : string, state?: Status) {
		this.timestamp = new Date();
		this.originalDate = new Date();
		this.state = state || Status.Pending;
		this._id = new Types.ObjectId();
		this.recipient = recipient;
		this.requester = requester;

	}
}

export default Friendship;
export { Status, IFriendship, FriendSchema };