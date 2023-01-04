import Box, {Odds} from "../../../classes/Box";

const odds : Odds = {
	common: 30,
	uncommon: 30,
	rare: 20,
	mythical: 10.5,
	godly: 5,
	bukky: 3,
	unique: 1.5,
	pukky: 0
}

const fireBox = () => { return new Box("Fire Box", "This box has an increased chance of Uncommon Vukkies.<br>Unique: Fire Vukky", 25, [23], odds, "/resources/boxes/firebox.webp") }

export default fireBox