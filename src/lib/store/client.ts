import { writable } from 'svelte/store';
import { Client, DefaultProviderUrls, ProviderType } from '@massalabs/massa-web3';
import { CHAIN_URL as url } from '$lib/utils/config';

export const PROVIDER_URL_KEY = 'providerUrl';

const providers = [
	{ url, type: ProviderType.PUBLIC },
	{ url, type: ProviderType.PRIVATE }
];

export const baseClient = new Client({
	providers,
	retryStrategyOn: false,
	periodOffset: 0
});

const clientStore = writable<Client>(baseClient);
export default clientStore;
