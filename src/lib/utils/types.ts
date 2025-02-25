import { Token as _Token } from '@dusalabs/sdk';

export class Token extends _Token {
	constructor(
		chainId: number,
		address: string,
		decimals: number,
		public readonly logoURI: string,
		public readonly symbol: string,
		public readonly name: string
	) {
		super(chainId, address, decimals, symbol, name);
	}
}
export type Allowance = {
	owner: string;
	spender: string;
	amount: bigint;
};

export type BalanceEntry = {
	address: string;
	value: bigint;
};
export type Properties = {
	address: string;
	decimals: number;
	name: string;
	symbol: string;
	totalSupply: bigint;
	owner: string;
	holders: number;
	mintable: boolean;
	burnable: boolean;
};

export const ERC20_KEYS = ['SYMBOL', 'NAME', 'OWNER', 'TOTAL_SUPPLY', 'DECIMALS'] as const;
export type ERC20_KEY = (typeof ERC20_KEYS)[number];
