import { writable } from 'svelte/store';
import { Client, DefaultProviderUrls, ProviderType } from '@massalabs/massa-web3';

export const PROVIDER_URL_KEY = 'providerUrl';

const defaultPublicApi =
	(typeof window !== 'undefined' && window.localStorage.getItem(PROVIDER_URL_KEY)) ||
	DefaultProviderUrls.MAINNET;
const providers = [
	{ url: defaultPublicApi, type: ProviderType.PUBLIC },
	{ url: defaultPublicApi, type: ProviderType.PRIVATE }
];

export const baseClient = new Client({
	providers,
	retryStrategyOn: false,
	periodOffset: 0
});

const clientStore = writable<Client>(baseClient);
export default clientStore;
