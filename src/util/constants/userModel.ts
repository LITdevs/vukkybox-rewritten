import mongoose from "mongoose";
import {playerDataModel, IplayerDataModel} from "./playerDataModel";
import {statisticsModel, IstatisticsModel} from "./statisticsModel";

interface IUser {
	litauthId: mongoose.Types.ObjectId,
	username: String,
	email: String,
	mfa?: Boolean,
	mfasecret?: String,
	apiKey?: String,
	playerData?: IplayerDataModel,
	statistics?: IstatisticsModel,
	createdAt: Date
}

const UserSchema = {
	litauthId: mongoose.Types.ObjectId,
	username: String,
	email: String,
	mfa: Boolean,
	mfasecret: String,
	apiKey: String,
	playerData: playerDataModel,
	statistics: statisticsModel,
	createdAt: Date
}

export { IUser, UserSchema }