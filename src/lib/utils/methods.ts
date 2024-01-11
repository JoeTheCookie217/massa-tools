import {
	ChainId,
	DCA_MANAGER_ADDRESS,
	LB_FACTORY_ADDRESS,
	LB_QUOTER_ADDRESS,
	LB_ROUTER_ADDRESS,
	LIMIT_ORDER_MANAGER_ADDRESS,
	MULTICALL_ADDRESS,
	Token,
	TokenAmount,
	USDC,
	USDT,
	VAULT_MANAGER_ADDRESS,
	WBTC,
	WETH,
	WMAS
} from '@dusalabs/sdk';
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

const dexAddresses: Array<{ [chainId in ChainId]: string }> = [
	LB_QUOTER_ADDRESS,
	LB_ROUTER_ADDRESS,
	LB_FACTORY_ADDRESS,
	DCA_MANAGER_ADDRESS,
	LIMIT_ORDER_MANAGER_ADDRESS,
	VAULT_MANAGER_ADDRESS,
	MULTICALL_ADDRESS
];

const tokenAddresses: Array<{ [chainId in ChainId]: Token }> = [WETH, WMAS, USDC, USDT, WBTC];

export const isVerified = (address: string) => isDusaContract(address) || isToken(address);
export const isDusaContract = (address: string) =>
	dexAddresses.some((addr) => Object.values(addr).some((z) => z === address));
export const isToken = (address: string) =>
	tokenAddresses.some((addr) => Object.values(addr).some((z) => z.address === address));
export const getAddressLabel = (address: string): string => {
	if (contains(LB_QUOTER_ADDRESS, address)) return 'Quoter';
	if (contains(LB_ROUTER_ADDRESS, address)) return 'Router';
	if (contains(LB_FACTORY_ADDRESS, address)) return 'Factory';
	if (contains(DCA_MANAGER_ADDRESS, address)) return 'DCA Manager';
	if (contains(LIMIT_ORDER_MANAGER_ADDRESS, address)) return 'Limit Order Manager';
	if (contains(VAULT_MANAGER_ADDRESS, address)) return 'Vault Manager';
	if (contains(MULTICALL_ADDRESS, address)) return 'Multicall';
	throw new Error('Address not found');
};

const contains = (map: { [chainId in ChainId]: string }, address: string): boolean =>
	Object.values(map).some((z) => z === address);

export const printMasBalance = (balance: string): string =>
	Number(balance).toLocaleString() + ' MAS';
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

export const providerToChainId = (provider: IProvider): ChainId => {
	switch (provider.url) {
		case DefaultProviderUrls.MAINNET:
			return ChainId.MAINNET;
		case DefaultProviderUrls.BUILDNET:
		default:
			return ChainId.BUILDNET;
	}
};

export const chainIdToProviders = (chainId: ChainId): IProvider[] => {
	let url = '';
	switch (chainId) {
		case ChainId.MAINNET:
			url = DefaultProviderUrls.MAINNET;
		case ChainId.BUILDNET:
		default:
			url = DefaultProviderUrls.BUILDNET;
	}
	return [
		{ type: ProviderType.PUBLIC, url },
		{ type: ProviderType.PRIVATE, url }
	];
};
