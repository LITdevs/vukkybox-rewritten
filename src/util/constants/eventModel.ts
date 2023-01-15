interface IEvent {
	type: number;
	eventData: any;
	userId: string;
	timestamp: Date;
}

const eventModel = {
	eventData: Object,
	timestamp: Date,
	type: Number,
	userId: String
}

export { IEvent, eventModel }