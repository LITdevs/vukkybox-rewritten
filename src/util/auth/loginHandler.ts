import db from "../../databaseManager";
import errorNotifier from "../errorNotifier";

/**
 * Login handler for passport.
 * @param {string} accessToken
 * @param {string} refreshToken
 * @param {any} profile
 * @param {Function} done
 */
export default function loginHandler (accessToken : string, refreshToken : string, profile : any, done : Function) {
	let User = db.getUsers(); // Get User from the database manager.
	// Check if the user is already in the database.
	User.findOne({ litauthId: profile._id }, (err, user) => {
		if (err) {
			console.error(err);
			errorNotifier(err, "Error finding user in database.");
			return done("Database error");
		}
		if (user) {
			// User found, update data and return user
			if (user.username == profile.username && user.email == profile.email) return done(null, user);
			user.username = profile.username;
			user.email = profile.email;
			user.save((err : Error, user : any) => {
				if (err) {
					console.error(err);
					errorNotifier(err, "Error saving user to database.");
					return done("Database error");
				}
				return done(null, user);
			});
		} else {
			// User not found, create new user and return user
			let usr = new User({
				litauthId: profile._id,
				username: profile.username,
				email: profile.email,
				createdAt: Date.now()
			});
			// Save user
			usr.save((err : Error) => {
				if (err) {
					// In case of an error, notify the developer and return an error message.
					console.error(err);
					errorNotifier(err, "Error creating user in database.");
					return done("Failed to write user to database.");
				}
				done(null, usr);
			});
		}
	});
}