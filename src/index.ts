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
import boxInitializer from './util/vukkybox/boxInitializer';
import flagInitializer from './util/vukkybox/flagInitializer';
import Rarity from "./util/constants/rarity";
import vukkyJSON from '../public/data/vukkies.json';
import fs from 'fs';
let vukkyList = vukkyJSON;

dotenv.config();

// Create an event emitter to tell the other modules what's going on.
const serverEvents : EventEmitter = new EventEmitter();
export default serverEvents;
export { vukkyList };

function setVukkyList(newList : any) {
	vukkyList = newList;
	fs.writeFileSync("./public/data/vukkies.json", JSON.stringify(vukkyList, null, 4));
}

export { setVukkyList };

fs.readdirSync('src/hooks').forEach(file => {
	require(`./hooks/${file.split(".")[0]}`).init();
})

const sessionStore = new MongoDBStore({
	uri: process.env.MONGODB_URI,
	collection: 'sessions',
	expires: 100 * 60 * 60 * 24 * 30
});

passport.serializeUser(function(user : Express.User, done) {
	done(null, user);
});
passport.deserializeUser(function(obj : Express.User, done) {
	done(null, obj);
});

const app : Express = express();

import loginHandler from './util/auth/loginHandler';

passport.use(new litauth.Strategy({
	clientID: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
	callbackURL: process.env.CALLBACK_URL ? process.env.CALLBACK_URL : "http://localhost:5000/auth/callback",
	scope: scopes
}, loginHandler));

// TODO: Think about cookie options...
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: true,
	saveUninitialized: false,
	store: sessionStore,
	proxy: true,
	cookie: {
		maxAge: 100 * 60 * 60 * 24 * 30,
		secure: process.env.CALLBACK_URL.startsWith("https"),
		sameSite: "lax"
	}
}));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', true);
app.set('view engine', 'ejs');

// Application wide locals, available in all views.
app.locals.vukkies = vukkyList;
app.locals.rarity = Rarity;
app.locals.boxes = boxInitializer();
app.locals.flags = flagInitializer();

// Import routers
import home from './routes/home';
import mfa from './routes/mfa';
import apiv1 from './routes/api-v1';
import apiinternal from './routes/api-internal';
import admin from './routes/admin';
import auth from './routes/auth';
import profile from './routes/profile';

app.use(locals);
app.use(langMiddleware);
app.use(errorMiddleware);

// Map routes to their routers, expose static assets in public folder
app.use('/api/v1/', apiv1);
app.use('/api/internal/', apiinternal);
app.use('/', home);
app.use('/', express.static('public'));
app.use('/mfa/', mfa);
app.use('/auth', auth(passport));
app.use('/admin', admin);
app.use('/profile', profile);

// 404
app.get('*', (req, res) => { res.status(404).render('404', {title: "Vukkybox - 404"}); });

import { verifyConnection } from './util/mailer';

// When the Database Manager is ready, verify SMTP connection and start listening for http traffic and count the number of users in the database.
db.events.on('ready', () => {
	//SMTP verification
	verifyConnection().then((success) => {
		if (!success) {
			console.log("Failed to verify connection to mail server.");
			return process.exit(2);
		} else {
			// Count users
			db.getUsers().countDocuments().then(count => {
				console.log(`Database manager ready. ${count} users in database.`);
				console.log(`${app.locals.boxes.length} boxes loaded.`);
				// Start listening to http traffic
				app.listen(process.env.PORT || 5000, () => {
					if (process.env?.VB_ENV === "dev") console.log("DEV SERVER")
					console.log(`Server running on port ${process.env.PORT || 5000}`);
					serverEvents.emit('ready');
				});
			})
		}
	})
});
