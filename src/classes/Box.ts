import { vukkyList } from '../index';

interface Odds {
	"common": number;
	"uncommon": number;
	"rare": number;
	"mythical": number;
	"godly": number;
	"bukky": number;
	"unique": number;
	"pukky": number;
}

interface IBox {
	id: number;
	name : string;
	description: string;
	price : number;
	uniques : string[];
	odds : Odds;
	imageURL : string;
	noRefund? : boolean;
}

let boxNameStore : string[] = [];
let boxId : number = 0;

class Box implements IBox {
	id: number;
	imageURL: string;
	name: string;
	description : string;
	odds: Odds;
	price: number;
	uniques: string[];
	noRefund? : boolean;

	constructor(name : string, description : string, price : number, uniques : string[], odds : Odds, imageURL : string, noRefund? : boolean) {
		this.id = boxId + 1;
		this.name = name;
		this.description = description;
		this.price = price;
		this.uniques = uniques;
		this.odds = odds;
		this.imageURL = imageURL;
		if (noRefund) this.noRefund = noRefund;

		// Verify that the total odds are 100%
		let totalOdds = 0;
		Object.keys(this.odds).forEach((rarity) => {
			let chance = this.odds[rarity];
			totalOdds += chance;
		})
		if (totalOdds !== 100) throw new Error(`Odds in box ${this.name} do not add up to 100%: ${totalOdds}% != 100%`);

		// Verify the box name is unique
		if (boxNameStore.includes(this.name)) throw new Error(`Box name ${this.name} is not unique!`);
		boxNameStore.push(this.name);

		// Verify that the box price is not negative
		if (this.price <= 0) throw new Error(`Box price ${this.price} is negative or zero!`);

		// Verify uniques exist
		this.uniques.forEach((unique) => {
			if (!vukkyList.rarity.unique[unique])  {
				Object.keys(vukkyList.rarity).forEach((rarity) => {
					if (Object.keys(vukkyList.rarity[rarity]).includes(String(unique))) throw new Error(`Unique ${unique} in box "${this.name}" is in rarity "${rarity}", needs to be "unique"`);
				})
				throw new Error(`Unique ${unique} in box "${this.name}" does not exist!`);
			}
		})

		boxId += 1;
	}

}

export default Box;
export { Odds, IBox, Box };