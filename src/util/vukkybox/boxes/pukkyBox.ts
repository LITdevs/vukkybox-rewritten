import Box, {Odds} from "../../../classes/Box";

const odds : Odds = {
	common: 0,
	uncommon: 0,
	rare: 0,
	mythical: 0,
	godly: 0,
	bukky: 0,
	unique: 1,
	pukky: 99
}

const pukkyBox = () => { return new Box("Pukky Box", "This box consists of only Pukkies, profile Vukkies!<br>You used to be able to get one on the <a href='https://discord.gg/mmhPScCZH4' class='text-blue-500'>LIT Devs Discord server</a>.<br>Unique: Developer Vukky", 50, [76], odds, "/resources/boxes/pukkybox.webp") }

export default pukkyBox