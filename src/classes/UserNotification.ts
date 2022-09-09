interface INotification {
	title: string;
	body: string;
	image?: string;
	read: boolean;
	timestamp: Date;
}

class UserNotification implements INotification {
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
	}
}

export default UserNotification;
export { INotification }