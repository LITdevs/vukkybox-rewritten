import UserNotification from "../classes/UserNotification";
import serverEvents from "../index";
import transporter from "./mailer";
import fs from "fs";
import errorNotifier from "./errorNotifier";

/**
 * Send a notification to a user
 * Does not save the user automatically
 * @param notification{UserNotification} The notification to send
 * @param user Mongo user object
 */
export default function (notification : UserNotification, user) {
    user.playerData.notifications.push(notification);
    serverEvents.emit("notification", {user: user, notification: notification});
    user.markModified("playerData");


}