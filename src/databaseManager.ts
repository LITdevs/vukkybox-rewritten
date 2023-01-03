import mongoose from 'mongoose';
import dotenv from 'dotenv';
import errorNotifier from "./util/errorNotifier";
import EventEmitter from "events";
import {IUser, UserSchema} from "./util/constants/userModel";
import {FriendSchema, IFriendship} from "./classes/Friendship";
import {promoCodeModel, IPromoCode} from "./util/constants/promoCodeModel";
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).catch(e => {
	console.error(e);
	errorNotifier(e, "Error connecting to database!");
	console.log("\n\n\nUnrecoverable error connecting to database. Exiting...");
	process.exit(1);
});

const db = mongoose.connection;
const dbEvents = new EventEmitter();

let Users
let Friends
let Codes
db.once('open', () => {
	let userSchema = new mongoose.Schema<IUser>(UserSchema);
	let friendSchema = new mongoose.Schema<IFriendship>(FriendSchema);
	let codeSchema = new mongoose.Schema<IPromoCode>(promoCodeModel)
	userSchema.post('save', (doc) => {
		dbEvents.emit('userSave', doc);
	});
	Users = mongoose.model('User', userSchema);
	Friends = mongoose.model('Friendship', friendSchema);
	Codes = mongoose.model('Code', codeSchema);
	// The database manager is ready, emit an event.
	dbEvents.emit('ready');
});

function getUsers() {
	return Users;
}

function getFriends() {
	return Friends;
}

function getCodes() {
	return Codes;
}

export default {
	getUsers,
	getFriends,
	getCodes,
	events: dbEvents
};