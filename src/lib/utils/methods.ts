import {
	DCA_MANAGER_ADDRESS as _DCA_MANAGER_ADDRESS,
	LB_FACTORY_ADDRESS as _LB_FACTORY_ADDRESS,
	LB_QUOTER_ADDRESS as _LB_QUOTER_ADDRESS,
	LB_ROUTER_ADDRESS as _LB_ROUTER_ADDRESS,
	LIMIT_ORDER_MANAGER_ADDRESS as _LIMIT_ORDER_MANAGER_ADDRESS,
	MULTICALL_ADDRESS as _MULTICALL_ADDRESS,
	Token,
	TokenAmount,
	VAULT_MANAGER_ADDRESS as _VAULT_MANAGER_ADDRESS,
	Fraction
} from '@dusalabs/sdk';
import { bytesToU256, bytesToU64, strToBytes, Args, Address } from '@massalabs/massa-web3';
import { CHAIN_ID, DAI, USDC, WETH, WMAS, WETH_B, USDT } from './config';

export const toTitle = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

export const isEOA = (address: string): boolean => address.startsWith('AU1');
export const isSC = (address: string): boolean => address.startsWith('AS1');
export const isAddress = (address: string): boolean => {
	try {
		new Address(address);
		return true;
	} catch (e) {
		console.log(e);
		return false;
	}
};

export const LB_QUOTER_ADDRESS = _LB_QUOTER_ADDRESS[CHAIN_ID];
export const LB_ROUTER_ADDRESS = _LB_ROUTER_ADDRESS[CHAIN_ID];
export const LB_FACTORY_ADDRESS = _LB_FACTORY_ADDRESS[CHAIN_ID];
export const DCA_MANAGER_ADDRESS = _DCA_MANAGER_ADDRESS[CHAIN_ID];
export const LIMIT_ORDER_MANAGER_ADDRESS = _LIMIT_ORDER_MANAGER_ADDRESS[CHAIN_ID];
export const VAULT_MANAGER_ADDRESS = _VAULT_MANAGER_ADDRESS[CHAIN_ID];
export const MULTICALL_ADDRESS = _MULTICALL_ADDRESS[CHAIN_ID];
export const dexAddresses = [
	LB_QUOTER_ADDRESS,
	LB_ROUTER_ADDRESS,
	LB_FACTORY_ADDRESS,
	DCA_MANAGER_ADDRESS,
	LIMIT_ORDER_MANAGER_ADDRESS,
	VAULT_MANAGER_ADDRESS,
	MULTICALL_ADDRESS
];
export const tokenAddresses = [WMAS, USDC, WETH, DAI, WETH_B, USDT];

export const isVerified = (address: string) => isDusaContract(address) || isTokenAddress(address);
export const isDusaContract = (address: string) => dexAddresses.some((addr) => addr === address);
export const isTokenAddress = (address: string) =>
	tokenAddresses.some((token) => token.address === address);
export const isTokenSymbol = (symbol: string) =>
	tokenAddresses.some((token) => token.symbol === symbol);
export const isToken = (address: string) => isTokenAddress(address) || isTokenSymbol(address);

export const getAddressLabel = (address: string): string => {
	let label = '';
	if (isDusaContract(address)) label = '[Dusa Protocol]: ';
	if (isTokenAddress(address)) return 'Whitelisted token';
	if (LB_QUOTER_ADDRESS === address) return label + 'Quoter';
	if (LB_ROUTER_ADDRESS === address) return label + 'Router';
	if (LB_FACTORY_ADDRESS === address) return label + 'Factory';
	if (DCA_MANAGER_ADDRESS === address) return label + 'DCA Manager';
	if (LIMIT_ORDER_MANAGER_ADDRESS === address) return label + 'Limit Order Manager';
	if (VAULT_MANAGER_ADDRESS === address) return label + 'Vault Manager';
	if (MULTICALL_ADDRESS === address) return label + 'Multicall';
	throw new Error('Address not found');
};

export const printMasBalance = (balance: string): string =>
	Number(balance).toLocaleString() + ' MAS';
export const printAddress = (address: string, chars = 6): string =>
	address.slice(0, chars) + '...' + address.slice(-(chars - 2));
export const printTokenAmount = (amount: TokenAmount): string =>
	Number(amount.toSignificant()).toLocaleString();
export const printUint8Array = (arr: Uint8Array): string =>
	arr.length > 10
		? '[' + arr.slice(0, 4).toString() + '...' + arr.slice(-4).toString() + ']'
		: '[' + arr.toString() + ']';
export const printUSD = (value: number, keepCents = true, precision = 2) =>
	value.toLocaleString('en-US', {
		maximumSignificantDigits: value < 1 ? precision : undefined,
		maximumFractionDigits: keepCents ? precision : 0,
		minimumFractionDigits: keepCents ? precision : 0
	});

export const toFraction = (val: number): Fraction => {
	if (val === 0) return new Fraction(0n, 1n);
	const value = BigInt(Math.round(val * 1e18));
	return new Fraction(value, BigInt(1e18));
};

export const bytesToBigInt = (bytes: Uint8Array): bigint => {
	try {
		return bytesToU256(bytes);
	} catch (e) {
		try {
			return bytesToU64(bytes);
		} catch (e) {
			return 0n;
		}
	}
};

// DATASTORE

export const toDatastoreInput = (address: string, keys: string[]) =>
	keys.map((key) => ({ address, key: strToBytes(key) }));

export const parseBalance = (val: Uint8Array | null) => {
	try {
		return val ? new Args(val).nextU256() : 0n;
	} catch (err) {
		try {
			return val ? bytesToU256(val) : 0n;
		} catch (err) {
			return 0n;
		}
	}
};

export const chunk = (arr: string[], size: number) =>
	Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
		arr.slice(i * size, i * size + size)
	);
