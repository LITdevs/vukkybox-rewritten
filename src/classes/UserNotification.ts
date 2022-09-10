import { Types } from "mongoose";

interface INotification {
	id: Types.ObjectId,
	title: string;
	body: string;
	image?: string;
	read: boolean;
	timestamp: Date;
}

class UserNotification implements INotification {
	id: Types.ObjectId;
	title: string;
	body: string;
	image: string;
	read: boolean;
	timestamp: Date;

	constructor(title : string, body: string, image? : string, read?: boolean) {
		this.read = read || false;
		this.title = title;
		this.body = body;
		this.image = image || undefined;
		this.timestamp = new Date();
		this.id = new Types.ObjectId();
	}
}

export default UserNotification;
export { INotification }