export class Coin {
	constructor(initialAmount = 0) {
		this.coin = initialAmount;
	}

	addCoin(amount) {
		if (amount <= 0) return false;
		this.coin += amount;
		return true;
	}

	spendCoin(amount) {
		if (amount <= 0 || this.coin < amount) return false;
		this.coin -= amount;
		return true;
	}

	canAfford(amount) {
		return this.coin >= amount;
	}

	getCoin() {
		return this.coin;
	}

	reset(amount = 0) {
		this.coin = amount;
	}
}
