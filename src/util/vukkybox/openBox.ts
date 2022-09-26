import {Box, Odds} from "../../classes/Box";
import { vukkyList } from "../../index";
import Vukky from "../../classes/Vukky";

/**
 * Returns a promise of the rarity of the Vukky
 * @param odds {Odds} The odds for different rarities
 */
const level = (odds : Odds) => {
	return new Promise<string>(resolve => {
		// Choose a random value between 0 and 1
		const random : number = Math.random();
		let threshold : number = 1;

		// For each level calculate threshold and if random is in threshold range, return level
		for (let [level, percentage ] of Object.entries(odds)) {
			threshold = threshold - (percentage / 100);
			if (random >= threshold) {
				resolve(level);
			}
		}
	})
}

/**
 * Opens a box and returns the Vukky inside
 * @param {Box} box - The box to open
 * @returns {Promise<Vukky>} The Vukky inside the box
 */
function openBox(box : Box) {
	return new Promise<Vukky>(resolve => {
		const odds: Odds = box.odds;
		level(odds).then(rarity => {
			let possibleVukkies = vukkyList.rarity[rarity];
			let possibleIds = Object.keys(possibleVukkies);

			// Uniques can only be the uniques in each box, not all uniques.
			if (rarity === "unique") {
				possibleIds = box.uniques;
				possibleVukkies = [];
				possibleIds.forEach(pid => {
					possibleVukkies.push(vukkyList.rarity[rarity][pid]);
				});
			}

			const vukkyId = possibleIds[Math.floor(Math.random() * possibleIds.length)];
			const vukkyObj = possibleVukkies[vukkyId];
			const vukky = new Vukky(parseInt(vukkyId), vukkyObj.url, vukkyObj.name, vukkyObj.description, rarity, vukkyObj.creator, vukkyObj.audioURL);
			resolve(vukky);
		});
	});
}

export default openBox;