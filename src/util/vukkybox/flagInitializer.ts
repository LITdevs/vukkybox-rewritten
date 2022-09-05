import UserFlag from "../../classes/UserFlag";
import adminFlag from "./flags/adminFlag";
import migratorFlag from "./flags/migratorFlag";
import garbageFlag from "./flags/garbageFlag";
import cssFlag from "./flags/cssFlag";


function flagInitializer() {
	let flags : UserFlag[] = [];
	flags.push(adminFlag());
	flags.push(migratorFlag());
	flags.push(garbageFlag());
	flags.push(cssFlag());

	return flags;
}

export default flagInitializer;