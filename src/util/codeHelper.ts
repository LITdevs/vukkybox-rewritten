import db from '../databaseManager'
import errorNotifier from "./errorNotifier";
import serverEvents from "../index";
export enum CodeStatus {
    InfiniteUses,
    NoUses,
    Claimable,
    Claimed,
    InvalidCode,
    ServerError
}
export enum ClaimResult {
    Claimed,
    ServerError
}

/**
 * Check status of a promo code
 * Returns value of CodeStatus enum
 * @param code - The code
 * @param user - Mongoose document of user
 * @returns {Promise<CodeStatus>}
 */
export function checkCodeStatus(code : string, user : any) : Promise<CodeStatus> {
    return new Promise(resolve => {
        let Codes = db.getCodes()
        Codes.findOne({code: { $regex: new RegExp(`^${code}$`), $options: "i" }}, (err, promoCode) => {
            if (err) {
                errorNotifier(err);
                return resolve(CodeStatus.ServerError);
            }
            // Does code exist?
            if (!promoCode) return resolve(CodeStatus.InvalidCode);
            // Has user used the code already?
            if (promoCode.usedBy.includes(user._id.toString())) return resolve(CodeStatus.Claimed);
            // Does code have infinite uses?
            if (promoCode.uses === -1) return resolve(CodeStatus.InfiniteUses);
            // Does code have 0 uses left?
            if (promoCode.uses === 0) return resolve(CodeStatus.NoUses);
            return resolve(CodeStatus.Claimable)
        })
    })
}

/**
 * Claim a code, and return a ClaimResult
 * @param code{string} - The code
 * @param user - Mongoose user document
 * @returns {Promise<ClaimResult>}
 */
export function claimCode(code : string, user : any) : Promise<ClaimResult> {
    return new Promise(resolve => {
        let Codes = db.getCodes()
        Codes.findOne({code: { $regex: new RegExp(`^${code}$`), $options: "i"  }}, async (err, promoCode) => {
            if (err) {
                errorNotifier(err);
                return resolve(ClaimResult.ServerError);
            }
            // The code should always exist, because checkCodeStatus is run first.
            if (!promoCode) return resolve(ClaimResult.ServerError);
            // Check the status oooone more time just to be sure :)
            if (![CodeStatus.Claimable, CodeStatus.InfiniteUses].includes(await checkCodeStatus(code, user))) return resolve(ClaimResult.ServerError);
            // Actually claim it
            user.playerData.balance += promoCode.value;
            if (promoCode.uses !== -1) promoCode.uses -= 1;
            promoCode.usedBy.push(user._id.toString());
            // Save document changes
            user.save();
            promoCode.save();
            // Emit event and resolve to Claimed
            serverEvents.emit("codeClaimEvent", { userId: user._id, username: user.username, promoCode });
            return resolve(ClaimResult.Claimed);
        })
    })
}