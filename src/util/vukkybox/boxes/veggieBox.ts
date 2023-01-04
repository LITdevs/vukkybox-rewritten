import Box, {Odds} from "../../../classes/Box";

const odds : Odds = {
	common: 45,
	uncommon: 25,
	rare: 0,
	mythical: 18,
	godly: 7.75,
	bukky: 3,
	unique: 1.25,
	pukky: 0
}

const veggieBox = () => { return new Box("Veggie Box", "This box has no Rare Vukkies but way more Mythical<br>and Godly Vukkies!<br>Unique: Salad Vukky, Vukky Planet", 25, [68, 31], odds, "/resources/boxes/veggiebox.webp") }

export default veggieBox