interface IUserFlag {
	id: number;
	langkey: string;
	imageURL: string;
}

let usedIds: number[] = [];
let usedLangkeys: string[] = [];

export default class UserFlag implements IUserFlag {
	id: number;
	langkey: string;
	imageURL: string;
	constructor(id: number, langkey: string, imageURL: string) {
		this.id = id;
		this.langkey = langkey;
		this.imageURL = imageURL;

		if (usedIds.includes(id)) {
			throw new Error(`UserFlag id for ${this.langkey} already exists`);
		} else {
			usedIds.push(id);
		}
		if (usedLangkeys.includes(langkey)) {
			throw new Error(`UserFlag langkey for flag id ${this.id} already exists`);
		} else {
			usedLangkeys.push(langkey);
		}
	}
}

export { IUserFlag };