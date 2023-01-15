import mongoose from 'mongoose';
import dotenv from 'dotenv';
import errorNotifier from "./util/errorNotifier";
import EventEmitter from "events";
import {IUser, UserSchema} from "./util/constants/userModel";
import {FriendSchema, IFriendship} from "./classes/Friendship";
import {promoCodeModel, IPromoCode} from "./util/constants/promoCodeModel";
import {eventModel, IEvent} from "./util/constants/eventModel";
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
let Events
db.once('open', () => {
	let userSchema = new mongoose.Schema<IUser>(UserSchema);
	let friendSchema = new mongoose.Schema<IFriendship>(FriendSchema);
	let codeSchema = new mongoose.Schema<IPromoCode>(promoCodeModel);
	let eventSchema = new mongoose.Schema<IEvent>(eventModel);
	userSchema.post('save', (doc) => {
		dbEvents.emit('userSave', doc);
	});
	Users = mongoose.model('User', userSchema);
	Friends = mongoose.model('Friendship', friendSchema);
	Codes = mongoose.model('Code', codeSchema);
	Events = mongoose.model('Event', eventSchema);
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

function getEvents() {
	return Events;
}

export default {
	getUsers,
	getFriends,
	getCodes,
	getEvents,
	events: dbEvents
};