import express, { Express } from 'express';
import passport from 'passport';
import session from 'express-session';
const MongoDBStore = require('connect-mongodb-session')(session);
import dotenv from 'dotenv';
import litauth from 'passport-litauth';
import db from './databaseManager';
import EventEmitter from "events";
import scopes from './util/scopes';
import cookieParser from 'cookie-parser';
import locals from './util/localsMiddleware';
dotenv.config();

// Create a event emitter to tell the other modules what's going on.
const serverEvents : EventEmitter = new EventEmitter();
export default serverEvents;

const sessionStore = new MongoDBStore({
	uri: process.env.MONGODB_URI,
	collection: 'sessions',
	expires: 100 * 60 * 60 * 24 * 30
})

passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

const app : Express = express();

import loginHandler from './util/loginHandler';

passport.use(new litauth.Strategy({
	clientID: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
	callbackURL: process.env.CALLBACK_URL ? process.env.CALLBACK_URL : "http://localhost:5000/auth/callback",
	scope: scopes
}, loginHandler))

app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: true,
	saveUninitialized: false,
	store: sessionStore,
	cookie: {
		maxAge: 100 * 60 * 60 * 24 * 30
	}
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.set('view engine', 'ejs');

// Import routers
import home from './routes/home';
import apiv1 from './routes/api-v1';
import auth from './routes/auth';

app.use(locals);

// Map routes to their routers, expose static assets in public folder
app.use('/', home);
app.use('/', express.static('public'));
app.use('/api/v1/', apiv1);
app.use('/auth', auth(passport));

// When the Database Manager is ready, start listening for http traffic and count the number of users in the database.
db.events.on('ready', () => {
	db.getUsers().countDocuments().then(count => {
		console.log(`Database manager ready. ${count} users in database.`);
		app.listen(process.env.PORT || 5000, () => {
			console.log(`Server running on port ${process.env.PORT || 5000}`);
		});
	})
});
