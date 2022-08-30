import express, { Express } from 'express';
import passport from 'passport';
import session from 'express-session';
const MongoDBStore = require('connect-mongodb-session')(session);
import dotenv from 'dotenv';
import litauth from 'passport-litauth';
import db from './databaseManager';
import EventEmitter from "events";
import scopes from './util/constants/scopes';
import cookieParser from 'cookie-parser';
import locals from './util/middleware/localsMiddleware';
import langMiddleware from './util/middleware/languageMiddleware';
import errorMiddleware from './util/middleware/errorMiddleware';
dotenv.config();

// Create an event emitter to tell the other modules what's going on.
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

import loginHandler from './util/auth/loginHandler';

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
app.use(express.json());
app.set('view engine', 'ejs');

// Import routers
import home from './routes/home';
import mfa from './routes/mfa';
import apiv1 from './routes/api-v1';
import apiinternal from './routes/api-internal';
import auth from './routes/auth';

app.use(locals);
app.use(langMiddleware);
app.use(errorMiddleware);

// Map routes to their routers, expose static assets in public folder
app.use('/api/v1/', apiv1);
app.use('/api/internal/', apiinternal);
app.use('/', home);
app.use('/', express.static('public'));
app.use('/2fa/', mfa);
app.use('/auth', auth(passport));

// 404
app.get('*', (req, res) => { res.status(404).render('404', {title: "Vukkybox - 404"}); })

import { verifyConnection } from './util/mailer';

// When the Database Manager is ready, verify SMTP connection and start listening for http traffic and count the number of users in the database.
db.events.on('ready', () => {
	verifyConnection().then((success) => {
		if (!success) {
			console.log("Failed to verify connection to mail server.");
			return process.exit(2);
		} else {
			db.getUsers().countDocuments().then(count => {
				console.log(`Database manager ready. ${count} users in database.`);
				app.listen(process.env.PORT || 5000, () => {
					console.log(`Server running on port ${process.env.PORT || 5000}`);
				});
			})
		}
	})
});
