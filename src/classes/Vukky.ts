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
	creator: string;
	audioURL?: string;

	constructor(vukkyObj : IVukky) {
		this.id = vukkyObj.id;
		this.imageURL = vukkyObj.imageURL;
		this.name = vukkyObj.name;
		this.description = vukkyObj.description;
		this.rarity = vukkyObj.rarity;
		this.creator = vukkyObj.creator || "Unknown";
		if(vukkyObj.audioURL) this.audioURL = vukkyObj.audioURL;
	}
}

export default Vukky;
export { IVukky, Vukky };