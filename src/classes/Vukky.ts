interface IVukky {
	id: number;
	imageURL: string;
	name: string;
	description : string;
	rarity: string;
	creator?: string;
	audioURL?: string;
}

class Vukky implements IVukky {
	id: number;
	imageURL: string;
	name: string;
	description : string;
	rarity: string;
	creator?: string;
	audioURL?: string;

	constructor(id : number, imageURL: string, name : string, description : string, rarity : string, creator? : string, audioURL? : string) {
		this.id = id;
		this.imageURL = imageURL;
		this.name = name;
		this.description = description;
		this.rarity = rarity;
		if(creator) this.creator = creator;
		if(audioURL) this.audioURL = audioURL;
	}
}

export default Vukky;
export { IVukky, Vukky };