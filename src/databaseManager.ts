import mongoose from 'mongoose';
import dotenv from 'dotenv';
import errorNotifier from "./util/errorNotifier";
import EventEmitter from "events";
import {IUser, UserSchema} from "./util/constants/userModel";
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
db.once('open', () => {
	let userSchema = new mongoose.Schema<IUser>(UserSchema);
	Users = mongoose.model('User', userSchema);
	// The database manager is ready, emit an event.
	dbEvents.emit('ready');
});

function getUsers() {
	return Users;
}

export default {
	getUsers,
	events: dbEvents
};