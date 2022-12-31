import express, {Request, Response, Router} from 'express';
import checkAuth from "../util/auth/checkAuth";
import errorNotifier from "../util/errorNotifier";
import {setVukkyList, vukkyList} from "../index";
import multer from "multer";
import path from "path";
import db from "../databaseManager"
import UserNotification from "../classes/UserNotification";
import sendNotification from "../util/sendNotification";
import {isValidObjectId} from "mongoose";

// Storing the new vukky images
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${__dirname}/../../../public/resources`)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

let upload = multer({storage})

const router: Router = express.Router();

let adminAbusers = [];

router.use(checkAuth);
router.use((req, res, next) => {
    if(!req.user.flags.some(flag => flag.flag === 0) && !req.session.pseudoMode) {
        let warning = false;
        adminAbusers.push({id: req.user._id, time: Date.now()})
        let abuseCount = adminAbusers.filter(user => user.id.equals(req.user._id) && Date.now() - user.time < 1000 * 60 * 60 * 60).length
        if (abuseCount > 2) {
            warning = true;
        }
        if (abuseCount === 5) {
            errorNotifier(`User ${req.user._id} (${req.user.username}) tried to access the admin panel after final warning.`, "dummy head", "Vukkybox admin acces alert (Repeated)")
        }
        if (abuseCount > 3) {
            return res.redirect('/auth/logout');
        }
        if (!warning) errorNotifier(`User ${req.user._id} (${req.user.username}) tried to access the admin panel.`, JSON.stringify({user: req.user, url: req.originalUrl, method: req.method, query: req?.query, headers: req?.headers}), "Vukkybox Admin Access Alert");
        return res.status(403).render('error', {title: "Vukkyboxn't", error: `403 Forbidden<br> You are not an administrator. This incident will be reported.${warning ? "<br><span class='fuckingstop'>Please stop or you will be terminated</span>" : ""}`});
    }
    next();
})

router.get('/', (req: Request, res: Response) => {
    return res.render('admin', {title: "Vukkybox - Admin"});
});

router.post('/giveall', (req: Request, res: Response) => {
    let allRarities = Object.keys(req.app.locals.vukkies.rarity);
    let allVukkyIds = [];
    allRarities.forEach(rarity => {
        allVukkyIds = allVukkyIds.concat(Object.keys(req.app.locals.vukkies.rarity[rarity]));
    })
    let allVukkies = {};
    allVukkyIds.forEach(vukkyId => {
        allVukkies[vukkyId] = 999;
    })
    res.locals.user.playerData.collection = allVukkies;
    res.locals.user.save();
    res.send("Successfully gave all vukkies to user");
})

router.get('/vukkydesigner', (req: Request, res: Response) => {
    return res.render('admin/vukkydesigner', {title: "Vukkybox - Vukky Designer"});
})

router.post('/createvukky', upload.single('image'),(req: Request, res: Response) => {
    if (!req.body.name || !req.body.description || !req.body.rarity) {
        return res.status(400).json({error: "Missing parameters"});
    }
    if (!req.file) {
        return res.status(400).json({error: "Missing file"});
    }
    let newVukkyList = vukkyList;
    newVukkyList.currentId++;
    let newId = vukkyList.currentId;
    newVukkyList.rarity[req.body.rarity][newId] = {
        name: req.body.name,
        description: req.body.description,
        url: `https://vukkybox.com/resources/${req.file.filename}`,
        rarity: req.body.rarity
    }
    if (req.body.creator) newVukkyList.rarity[req.body.rarity][newId].creator = req.body.creator;
    setVukkyList(newVukkyList);
    console.log(`New Vukky added: ${req.body.name} (${newId})`);
    res.json({success: true});
})

router.post('/flag', (req: Request, res: Response) => {
    res.locals.user.flags.push({flag: 0, date: new Date()});
    sendNotification(new UserNotification("Admin flag added", "hello LIT DEV you now have admin permissions here", "/flags/admin.webp"), res.locals.user);
    res.locals.user.save();
    res.json({error: null});
});

router.delete("/flagEditor", (req: Request, res: Response) => {
    if (!req.body.userId && req.body.flagId || !isValidObjectId(req.body.userId)) return res.status(400).send("Missing parameters")
    let Users = db.getUsers();
    Users.findOne({_id: req.body.userId}, (err, user) => {
        if (err) {
            errorNotifier(err);
            return res.status(500).send("Internal Server Error")
        }
        if (!user) return res.status(404).send("no such user")
        if (isNaN(parseInt(req.body.flagId))) return res.status(400).send("flag id please")
        user.flags = user.flags.filter(flag => flag.flag !== req.body.flagId)
        sendNotification(new UserNotification("Badge revoked", `"Your "${res.locals.lang.flags[res.app.locals.flags[req.body.flagId].langkey].name}" badge has been revoked`, res.app.locals.flags[req.body.flagId].imageURL), user);
        user.save();
        res.sendStatus(200)
    })
})

router.post("/flagEditor", (req: Request, res: Response) => {
    // Add flag
    if (!req.body.userId && req.body.flagId || !isValidObjectId(req.body.userId)) return res.status(400).send("Missing parameters")
    let Users = db.getUsers();
    Users.findOne({_id: req.body.userId}, (err, user) => {
        if (err) {
            errorNotifier(err);
            return res.status(500).send("Internal Server Error")
        }
        if (!user) return res.status(404).send("no such user")
        if (user.flags.some(flag => flag.flag === req.body.flagId)) return res.status(400).send("User already has flag")
        if (isNaN(parseInt(req.body.flagId))) return res.status(400).send("flag id please")
        let flag : { flag: number, date: Date, reason?: string} = {flag: parseInt(req.body.flagId), date: new Date() }
        if (req.body.reason) flag.reason = req.body.reason;
        user.flags.push(flag)
        // TODO: the flag array is not actually ordered lol, use array.find or something here
        sendNotification(new UserNotification("New badge", "You have been awarded a new badge!", res.app.locals.flags[flag.flag].imageURL), user);
        user.save();
        res.sendStatus(200)
    })
})

router.post('/flag/css', (req: Request, res: Response) => {
    if (!req.body.targetId) return res.status(400).json({error: "Missing parameters"});
    let Users = db.getUsers();
    Users.findOne({_id: req.body.targetId.trim()}, (err, user) => {
        //user.flags.push({flag: 2, date: new Date(), reason: "\"I dont want a garbage bag on my profile\""});
        user.flags.push({flag: 3, date: new Date(), reason: "Approved for full custom CSS by administrator"});
        sendNotification(new UserNotification("Unrestricted CSS approved", "You have been given permission for use of unrestricted CSS!", "/flags/css.webp"), user);
        user.save();
        res.json({error: null});
    })
});

router.post('/flag/admin', (req: Request, res: Response) => {
    if (!req.body.targetId) return res.status(400).json({error: "Missing parameters"});
    let Users = db.getUsers();
    Users.findOne({_id: req.body.targetId.trim()}, (err, user) => {
        user.flags.push({flag: 0, date: new Date()});
        sendNotification(new UserNotification("Admin flag added", "hello LIT DEV you now have admin permissions here", "/flags/admin.webp"), user);
        user.save();
        res.json({error: null});
    })
});

router.post('/user', (req: Request, res: Response) => {
    if (!req.body._id) return res.status(400).json({error: "Missing parameters"});
    let Users = db.getUsers();
    Users.findOne({_id: req.body._id}, (err, user) => {
        if(!user) return res.status(404).json({error: "User not found"})
        if(err) return res.status(500).json({error: err});
        res.json({error: null, user});
    })
})

router.get('/userEditor', (req: Request, res: Response) => {
    res.render("admin/userEditor", {title: "Vukkybox - User editor"})
})

router.get('/flagEditor/:id', (req: Request, res: Response) => {
    let Users = db.getUsers();
    if (!isValidObjectId(req.params.id)) return res.status(400).render("error", { title: "Vukkyboxn't", error: "Invalid id" })
    Users.findOne({_id: req.params.id}, (err, user) => {
        if (err) {
            errorNotifier(err);
            return res.status(500).render('error', {title: "Vukkyboxn't" });
        }
        res.render("admin/flagEditor", {title: "Vukkybox - Flag editor", puser: user})
    })
})

router.post('/testNotification', (req: Request, res: Response) => {
    // Assuming all parameters are correct because lol
    sendNotification(new UserNotification("Test notification", "This notification is a test"), res.locals.user);
    sendNotification(new UserNotification("Test notification with image", "This notification is a test, but it has an image", "/flags/css.webp"), res.locals.user);
    sendNotification(new UserNotification("Long test notification with image", "This notification is a test, but it has an image, and it is also very long, blah blah blah according to all known laws of aviation bees shouldnt fly but they do because fuck the police", "/flags/css.webp"), res.locals.user);
    res.locals.user.save();
    res.json({success: true})
})

router.post('/pseudoMode', (req: Request, res: Response) => {
    // Assuming all parameters are correct because lol
    req.session.pseudoMode = req.body.targetId.toString();
    res.json({success: true})
})

router.get('/pseudoModeExit', (req: Request, res: Response) => {
    if (!req.session.pseudoMode) return res.send("leave.")
    req.session.pseudoMode = undefined;
    res.redirect("/");
})
export default router;