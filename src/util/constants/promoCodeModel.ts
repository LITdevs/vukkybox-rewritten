interface IPromoCode {
	code: string,
	value: number,
	reason: string,
	createdBy: string,
	createdAt: Date,
	uses: number, // -1 = infinite uses, 0 = used up, 1+ = limited uses
	usedBy: string[]
}

const promoCodeModel = {
	code: {type: String, unique: true},
	value: Number,
	reason: String,
	createdBy: String,
	createdAt: Date,
	uses: Number,
	usedBy: Array<string>()
}

export { IPromoCode, promoCodeModel }