import UserFlag from "../../classes/UserFlag";
import adminFlag from "./flags/adminFlag";
import migratorFlag from "./flags/migratorFlag";
import garbageFlag from "./flags/garbageFlag";
import cssFlag from "./flags/cssFlag";
import friendselfFlag from "./flags/friendselfFlag";
import unfriendselfFlag from "./flags/unfriendselfFlag";
import stalkerFlag from "./flags/stalkerFlag";
import egoFlag from "./flags/egoFlag";


function flagInitializer() {
	let flags : UserFlag[] = [];
	flags.push(adminFlag());
	flags.push(migratorFlag());
	flags.push(garbageFlag());
	flags.push(cssFlag());
	flags.push(friendselfFlag());
	flags.push(unfriendselfFlag());
	flags.push(stalkerFlag());
	flags.push(egoFlag());

	return flags;
}

export default flagInitializer;