import apiAuth from "../../../util/auth/apiAuth";
import express, {Request, Response, Router} from "express";
import {isValidObjectId} from "mongoose";
import db from "../../../databaseManager";
import errorNotifier from "../../../util/errorNotifier";
import Friendship, {Status} from "../../../classes/Friendship";
import event from "../../../index";
import UserNotification from "../../../classes/UserNotification";
import friendEvent from "../../../classes/events/friendEvent";


const router: Router = express.Router();

router.post("/aaa", apiAuth, (req, res) => {
	res.json(req.user)
})

router.post("/friendship/add", apiAuth, (req : Request, res: Response) => {
	if (!req.body.friendId) return res.status(400).json({error: "Missing parameters"});
	if (!isValidObjectId(req.body.friendId)) return res.status(400).json({error: "Id not valid"})
	let requesterId : string = res.locals.user._id.toString()
	let Friend = db.getFriends();
	let Users = db.getUsers();

	// Look for an existing friendship
	Friend.findOne({$or:[{requester: requesterId, recipient: req.body.friendId},{requester: req.body.friendId, recipient: requesterId}]}, (err, friendship) => {
		if (err) {
			res.status(500).json({error: "Internal server error"});
			return errorNotifier(err, `${res.locals.username} tried to friend ${req.body.friendId}`);
		}
		if (friendship) {
			if (friendship.state !== Status.NoFriendship) {
				event.emit("doubleFriendEvent", { friendship, user: res.locals.user })
				return res.status(400).json({error: "Already friends"});
			} else {
				let oldState = friendship.state
				friendship.state = Status.Pending;
				friendship.timestamp = new Date();
				Users.findOne({_id: req.body.friendId.toString()}, (err, user) => {
					if (!user) return res.status(400).json({error: "No such user"});
					if (err) {
						res.status(500).json({error: "Internal server error"});
						return errorNotifier(err, `${res.locals.username} tried to friend ${req.body.friendId}`);
					}
					res.json({error: null});
					user.playerData.notifications.push(new UserNotification("New friend request", `${res.locals.user.username} has requested to be your friend!`, "/resources/duolingo.webp"));
					event.emit("friendEvent", new friendEvent(friendship, res.locals.user, oldState))
					friendship.save();
					user.save();
				})
			}
		}
		if (!friendship) {
			let frsh = new Friend(new Friendship(requesterId, req.body.friendId));
			Users.findOne({_id: req.body.friendId.toString()}, (err, user) => {
				if (!user) return res.status(400).json({error: "No such user"});
				if (err) {
					res.status(500).json({error: "Internal server error"});
					return errorNotifier(err, `${res.locals.username} tried to friend ${req.body.friendId}`);
				}
				res.json({error: null})
				user.playerData.notifications.push(new UserNotification("New friend request", `${res.locals.user.username} has requested to be your friend!`, "/resources/duolingo.webp"));
				event.emit("friendEvent", new friendEvent(frsh, res.locals.user))
				frsh.save();
				user.save();
			})
		}
	})
})

router.post("/friendship/accept", apiAuth, (req : Request, res: Response) => {
	if(!req.body.requestId) return res.status(400).json({error: "Missing parameters"});
	if (!isValidObjectId(req.body.requestId)) return res.status(400).json({error: "Id not valid"})
	let Friends = db.getFriends();
	// Find a friendship with the provided ID, and where the user accepting it is the recipient.
	Friends.findOne({ _id: req.body.requestId, recipient: res.locals.user._id.toString()}, (err, friendship) => {
		if (err) {
			res.status(500).json({error: "Internal server error"});
			return errorNotifier(err, `${res.locals.username} tried to accept ${req.body.requestId}`);
		}

		// Making sure a pending request was found
		if (!friendship || friendship.state !== Status.Pending) return res.json({error: "No such friend request"});

		let oldState = friendship.state;
		// Accept it :)
		friendship.state = Status.Accepted;
		friendship.timestamp = new Date();
		event.emit("friendEvent", new friendEvent(friendship, res.locals.user, oldState))
		friendship.save();
		res.json({error: null})
	})
})

router.post("/friendship/reject", apiAuth, (req : Request, res: Response) => {
	if(!req.body.requestId) return res.status(400).json({error: "Missing parameters"});
	if (!isValidObjectId(req.body.requestId)) return res.status(400).json({error: "Id not valid"})
	let Friends = db.getFriends();
	// Find a friendship with the provided ID, and where the user rejecting it is the recipient.
	Friends.findOne({ _id: req.body.requestId, recipient: res.locals.user._id.toString()}, (err, friendship) => {
		if (err) {
			res.status(500).json({error: "Internal server error"});
			return errorNotifier(err, `${res.locals.username} tried to reject ${req.body.requestId}`);
		}

		// Making sure a pending request was found
		if (!friendship || friendship.state !== Status.Pending) return res.json({error: "No such friend request"});

		let oldState = friendship.state;

		// Reject it :)
		friendship.state = Status.NoFriendship;
		event.emit("friendEvent", new friendEvent(friendship, res.locals.user, oldState))
		friendship.save();
	})
})

router.post("/friendship/remove", apiAuth, (req : Request, res: Response) => {
	if(!req.body.requestId) return res.status(400).json({error: "Missing parameters"});
	if (!isValidObjectId(req.body.requestId)) return res.status(400).json({error: "Id not valid"})
	let Friends = db.getFriends();
	// Find a friendship with the provided ID, and where the user can be the requester or recipient
	Friends.findOne({$or:[{requester: res.locals.user._id, _id: req.body.requestId},{recipient: res.locals.user._id, _id: req.body.requestId}]}, (err, friendship) => {
		if (err) {
			res.status(500).json({error: "Internal server error"});
			return errorNotifier(err, `${res.locals.username} tried to unfriend ${req.body.requestId}`);
		}

		// Making sure a pending request was found
		if (!friendship) return res.json({error: "No such friend request"});

		let oldState = friendship.state;

		// Unfriend :)
		friendship.state = Status.NoFriendship;
		event.emit("friendEvent", new friendEvent(friendship, res.locals.user, oldState))
		friendship.save();
		res.json({error: null})
	})
})

router.get('/friendship/get', (req : Request, res: Response) => {
	// return friendship between two users
	if (!req.body.user1 || !req.body.user2)  return res.status(400).json({error: "Missing parameters"})
	if (!isValidObjectId(req.body.user1) || !isValidObjectId(req.body.user2)) return res.status(400).json({error: "UserId not valid"})
	let Friends = db.getFriends();
	Friends.findOne({$or:[{requester: req.body.user1, recipient: req.body.user2},{requester: req.body.user2, recipient: req.body.user1}]}, (err, friendship) => {
		if (err) {
			res.status(500).json({error: "Internal server error"});
			return errorNotifier(err, `${res.locals.username} tried to friend ${req.body.friendId}`);
		}
		if (!friendship) return res.json(new Friendship(req.body.user1, req.body.user2, Status.NeverFriends));
		return res.json(friendship);
	})
})

export default router