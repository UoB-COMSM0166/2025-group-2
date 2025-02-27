export class Coin {
	constructor() {
		this.coin = 0;
	}

	addCoin(coin) {
		this.coin += coin;
	}

	getCoin() {
		return this.coin;
	}

	reset() {
		this.coin = 0;
	}
}
