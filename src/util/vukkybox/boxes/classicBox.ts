import Box, {Odds} from "../../../classes/Box";

const odds : Odds = {
	common: 40,
	uncommon: 20,
	rare: 15,
	mythical: 11.5,
	godly: 7.5,
	bukky: 4,
	unique: 2,
	pukky: 0
}

const classicBox = () => { return new Box("Classic Box", "Just your usual box.<br>Unique: VukkyBot", 10, ["73"], odds, "/resources/boxes/classicbox.webp") }

export default classicBox