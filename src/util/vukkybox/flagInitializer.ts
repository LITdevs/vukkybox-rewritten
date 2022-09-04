import UserFlag from "../../classes/UserFlag";
import adminFlag from "./flags/adminFlag";
import testFlag from "./flags/migratorFlag";


function flagInitializer() {
	let flags : UserFlag[] = [];
	flags.push(adminFlag());
	flags.push(testFlag());

	return flags;
}

export default flagInitializer;