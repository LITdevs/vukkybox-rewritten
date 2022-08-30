import mongoose from "mongoose";
import {playerDataModel, IplayerDataModel} from "./playerDataModel";

interface IUser {
	litauthId: mongoose.Types.ObjectId,
	username: String,
	email: String,
	mfa?: Boolean,
	mfasecret?: String,
	apiKey?: String,
	playerData?: IplayerDataModel,
	statistics?: Object,
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
	statistics: Object,
	createdAt: Date
}

export { IUser, UserSchema }