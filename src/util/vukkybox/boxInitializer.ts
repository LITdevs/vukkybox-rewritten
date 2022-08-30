import Box from "../../classes/Box";
import classicBox from "./boxes/classicBox";
import veggieBox from "./boxes/veggieBox";
import fireBox from "./boxes/fireBox";
import cursedBox from "./boxes/cursedBox";
import pukkyBox from "./boxes/pukkyBox";
import sharkBox from "./boxes/sharkBox";
import beggarsBox from "./boxes/beggarsbox";

function boxInitializer() {
	let boxes : Box[] = [];
	boxes.push(classicBox());
	boxes.push(veggieBox());
	boxes.push(fireBox());
	boxes.push(cursedBox());
	boxes.push(pukkyBox());
	boxes.push(sharkBox());
	boxes.push(beggarsBox());

	return boxes;
}

export default boxInitializer;