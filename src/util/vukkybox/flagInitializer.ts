import UserFlag from "../../classes/UserFlag";
import adminFlag from "./flags/adminFlag";
import migratorFlag from "./flags/migratorFlag";
import garbageFlag from "./flags/garbageFlag";
import cssFlag from "./flags/cssFlag";
import friendselfFlag from "./flags/friendselfFlag";
import unfriendselfFlag from "./flags/unfriendselfFlag";
import stalkerFlag from "./flags/stalkerFlag";


function flagInitializer() {
	let flags : UserFlag[] = [];
	flags.push(adminFlag());
	flags.push(migratorFlag());
	flags.push(garbageFlag());
	flags.push(cssFlag());
	flags.push(friendselfFlag());
	flags.push(unfriendselfFlag());
	flags.push(stalkerFlag());

	return flags;
}

export default flagInitializer;