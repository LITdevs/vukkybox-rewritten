interface IplayerDataModel {
	balance: number;
	collection?: Object;
	lastLogin: Date,
	lastLoginD: Date
}

const playerDataModel = {
	balance: Number,
	collection: Object
}

export { IplayerDataModel, playerDataModel }