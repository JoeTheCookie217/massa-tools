import { ChainId } from '@dusalabs/sdk';
import { bytesToU256, bytesToU64, ProviderType, type IProvider } from '@massalabs/massa-web3';

export const toTitle = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

export const printAddress = (address: string): string =>
	address.slice(0, 6) + '...' + address.slice(-4);

export const printMasBalance = (balance: string): string => Number(balance).toFixed(2) + ' MAS';

export const bytesToNumber = (bytes: Uint8Array): bigint => {
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

const buildnetUrl = 'https://buildnet.massa.net/api/v2';
const testnetUrl = 'https://testnet.massa.net/api/v2';
const dusanetUrl = 'https://node.dusa.io/testnet';

export const providerToChainId = (provider: IProvider): ChainId => {
	switch (provider.url) {
		case buildnetUrl:
			return ChainId.BUILDNET;
		case testnetUrl:
			return ChainId.MAINNET;
		case dusanetUrl:
			return ChainId.DUSANET;
		default:
			return ChainId.BUILDNET;
	}
};

export const chainIdToProviders = (chainId: ChainId): IProvider[] => {
	let url = '';
	switch (chainId) {
		case ChainId.BUILDNET:
			url = buildnetUrl;
			break;
		case ChainId.MAINNET:
			url = testnetUrl;
			break;
		case ChainId.DUSANET:
			url = dusanetUrl;
			break;
		default:
			url = buildnetUrl;
			break;
	}
	return [
		{ type: ProviderType.PUBLIC, url },
		{ type: ProviderType.PRIVATE, url }
	];
};
