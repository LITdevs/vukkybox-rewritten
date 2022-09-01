import Vukky from "../Vukky";

class uniqueGetEvent {
	vukky : Vukky;
	user : Express.User;
	constructor(vukky : Vukky, user : Express.User) {
		this.vukky = vukky;
		this.user = user;
	}
}

export default uniqueGetEvent;