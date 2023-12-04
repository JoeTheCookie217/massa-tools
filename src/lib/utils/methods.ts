import { ChainId, Token, TokenAmount } from '@dusalabs/sdk';
import {
	bytesToU256,
	bytesToU64,
	ProviderType,
	type IProvider,
	DefaultProviderUrls
} from '@massalabs/massa-web3';

export const toTitle = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

export const isEOA = (address: string): boolean => address.startsWith('AU1');
export const isSC = (address: string): boolean => address.startsWith('AS1');
export const isAddress = (address: string): boolean =>
	(isEOA(address) || isSC(address)) && (address.length >= 50 || address.length <= 56);

export const printMasBalance = (balance: string): string => Number(balance).toFixed(2) + ' MAS';
export const printAddress = (address: string, chars = 6): string =>
	address.slice(0, chars) + '...' + address.slice(-(chars - 2));
export const printTokenAmount = (amount: TokenAmount): string =>
	Number(amount.toSignificant()).toLocaleString();

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

// PROVIDER <-> CHAIN ID

const mainnetUrl = DefaultProviderUrls.MAINNET;
const testnetUrl = DefaultProviderUrls.TESTNET;
const buildnetUrl = DefaultProviderUrls.BUILDNET;
const dusanetUrl = 'https://node.dusa.io/testnet';

export const providerToChainId = (provider: IProvider): ChainId => {
	switch (provider.url) {
		case dusanetUrl:
			return ChainId.DUSANET;
		case mainnetUrl:
			return ChainId.MAINNET;
		case testnetUrl:
			return ChainId.TESTNET;
		case buildnetUrl:
		default:
			return ChainId.BUILDNET;
	}
};

export const chainIdToProviders = (chainId: ChainId): IProvider[] => {
	let url = '';
	switch (chainId) {
		case ChainId.DUSANET:
			url = dusanetUrl;
			break;
		case ChainId.MAINNET:
			url = testnetUrl;
			break;
		case ChainId.TESTNET:
			url = testnetUrl;
		case ChainId.BUILDNET:
		default:
			url = buildnetUrl;
			break;
	}
	return [
		{ type: ProviderType.PUBLIC, url },
		{ type: ProviderType.PRIVATE, url }
	];
};
