interface IstatisticsModel {
	boxesOpened?: number;
	dailyBonusesClaimed?: number;
	hourlyBonusesClaimed?: number;
	codesClaimed?: number;
	duplicatesGotten?: number;
	rarity: {
		common?: number;
		uncommon?: number;
		rare?: number;
		mythical?: number;
		godly?: number;
		bukky?: number;
		unique?: number;
		pukky?: number;
	}
}

const statisticsModel = {
	boxesOpened: Number,
	dailyBonusesClaimed: Number,
	hourlyBonusesClaimed: Number,
	codesClaimed: Number,
	duplicatesGotten: Number,
	rarity: {
		common: Number,
		uncommon: Number,
		rare: Number,
		mythical: Number,
		godly: Number,
		bukky: Number,
		unique: Number,
		pukky: Number
	}
}

export { IstatisticsModel, statisticsModel }