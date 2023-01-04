import Box, {Odds} from "../../../classes/Box";

const odds : Odds = {
	common: 0,
	uncommon: 50,
	rare: 25,
	mythical: 14,
	godly: 8,
	bukky: 2,
	unique: 1,
	pukky: 0
}

const cursedBox = () => { return new Box("Cursed Box", "This box has no Common Vukkies.<br>Unique: Vukky Meat (Normal, Cooked, Burnt)", 50, [69, 70, 71], odds, "/resources/boxes/cursedbox.webp") }

export default cursedBox