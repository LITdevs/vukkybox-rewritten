import Box, {Odds} from "../../../classes/Box";

const odds : Odds = {
	common: 0,
	uncommon: 0,
	rare: 50,
	mythical: 30,
	godly: 18.75,
	bukky: 1,
	unique: 0.24, // This is terrible odds. I am so sorry.  To be fair, before the rewrite it was 0.075
	pukky: 0.01 // Just a tiny little chance, if someone gets this please show me.
}

const sharkBox = () => { return new Box("Shark Box", "This box has no Vukkies below 3 stars (rare)<br>Unique: 2 secret Vukkies...", 100, [231, 232], odds, "/resources/boxes/sharkbox.webp") }

export default sharkBox