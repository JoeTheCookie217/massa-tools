import { writable } from 'svelte/store';
import { Client, DefaultProviderUrls, ProviderType } from '@massalabs/massa-web3';

const defaultPublicApi =
	(typeof window !== 'undefined' && window.localStorage.getItem('defaultPublicApi')) ||
	DefaultProviderUrls.BUILDNET;
const providers = [
	{ url: defaultPublicApi, type: ProviderType.PUBLIC },
	{ url: defaultPublicApi, type: ProviderType.PRIVATE }
];
const client = new Client({
	providers,
	retryStrategyOn: false,
	periodOffset: 0
});

const clientStore = writable<Client>(client);

export default clientStore;
