import db from '../../databaseManager';
import serverEvents from "../../index";

/**
 * Create a new event in the database, and emit a gameEvent to serverEvents.
 * @param user
 * @param type
 * @param eventData
 */
export default async function (user, type: number, eventData : any) {
    const event = {
        eventData,
        timestamp: new Date(),
        type,
        userId: user._id
    };

    let Event = db.getEvents();
    let ev = await new Event(event).save();
    serverEvents.emit('gameEvent', event);
    return ev._id;
}