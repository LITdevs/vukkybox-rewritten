import mongoose from "mongoose";

interface IUser {
	litauthId: mongoose.Types.ObjectId,
	username: String,
	email: String,
	mfa?: Boolean,
	mfasecret?: String,
	apiKey?: String,
	playerData?: Object,
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
	playerData: Object,
	statistics: Object,
	createdAt: Date
}

export { IUser, UserSchema }