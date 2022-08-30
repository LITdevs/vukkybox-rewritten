import Box, {Odds} from "../../../classes/Box";

const odds : Odds = {
	common: 80,
	uncommon: 20,
	rare: 0,
	mythical: 0,
	godly: 0,
	bukky: 0,
	unique: 0,
	pukky: 0
}

const beggarsBox = () => { return new Box("Beggars Box", "This box consists of only commons and uncommons!<br>Beggars can't be choosers!<br>Unique: None, silly!", 2, [], odds, "/resources/boxes/beggarsbox.webp", true) }

export default beggarsBox