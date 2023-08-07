import { Client, DefaultProviderUrls, ProviderType } from '@massalabs/massa-web3';

export const publicApi = DefaultProviderUrls.BUILDNET;

const providers = [
	{ url: publicApi, type: ProviderType.PUBLIC },
	{ url: publicApi, type: ProviderType.PRIVATE }
];

export let client = new Client({
	providers,
	retryStrategyOn: true,
	periodOffset: 0
});
