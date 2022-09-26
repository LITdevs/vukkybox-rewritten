import mongoose from 'mongoose';
import dotenv from 'dotenv';
import errorNotifier from "./util/errorNotifier";
import EventEmitter from "events";
import {IUser, UserSchema} from "./util/constants/userModel";
import {FriendSchema, IFriendship} from "./classes/Friendship";
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
db.once('open', () => {
	let userSchema = new mongoose.Schema<IUser>(UserSchema);
	let friendSchema = new mongoose.Schema<IFriendship>(FriendSchema);
	Users = mongoose.model('User', userSchema);
	Friends = mongoose.model('Friendship', friendSchema);
	// The database manager is ready, emit an event.
	dbEvents.emit('ready');
});

function getUsers() {
	return Users;
}

function getFriends() {
	return Friends;
}

export default {
	getUsers,
	getFriends,
	events: dbEvents
};