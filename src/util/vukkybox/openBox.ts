import {Box, Odds} from "../../classes/Box";
import { vukkyList } from "../../index";
import Vukky, {IVukky} from "../../classes/Vukky";

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
			let possibleVukkies = vukkyList.vukkies.filter(vukky => vukky.rarity === rarity);

			// Uniques can only be the uniques in each box, not all uniques.
			if (rarity === "unique") {
				possibleVukkies = vukkyList.vukkies.filter(vukky => vukky.rarity === rarity && box.uniques.includes(vukky.id));
			}

			const vukkyObj : IVukky = possibleVukkies[Math.floor(Math.random() * possibleVukkies.length)];
			const vukky = new Vukky(vukkyObj);
			resolve(vukky);
		});
	});
}

export default openBox;