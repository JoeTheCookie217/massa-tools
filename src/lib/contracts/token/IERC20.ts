import { Args } from '@massalabs/as-types';
import { Address, call } from '@massalabs/massa-as-sdk';
import { TokenWrapper } from '@massalabs/sc-standards/assembly/contracts/FT';
import { u256 } from 'as-bignum/assembly/integer/u256';

export class IERC20 extends TokenWrapper {
	init(name: string, symbol: string, decimals: u8, supply: u256): void {
		const args = new Args().add(name).add(symbol).add(decimals).add(supply);
		call(this._origin, 'constructor', args, 0);
	}

	burnFrom(account: Address, amount: u256): void {
		call(this._origin, 'burnFrom', new Args().add(account).add(amount), 0);
	}

	transferOwnership(newOwner: Address): void {
		call(this._origin, 'setOwner', new Args().add(newOwner), 0);
	}
}
