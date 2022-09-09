import UserNotification from "../../classes/UserNotification";

interface IPlayerDataModel {
	balance: number;
	collection?: object;
	lastLogin: Date;
	lastLoginD: Date;
	notifications: UserNotification[];
}

const playerDataModel = {
	balance: Number,
	collection: Object,
	lastLogin: Date,
	lastLoginD: Date,
	notifications: Array<UserNotification>(),
}

export { IPlayerDataModel, playerDataModel }