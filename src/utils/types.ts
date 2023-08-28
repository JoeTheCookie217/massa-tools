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
	mintable: boolean;
	burnable: boolean;
};
