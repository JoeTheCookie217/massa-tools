import { writable } from 'svelte/store';
import { Client, ProviderType } from '@massalabs/massa-web3';
import { CHAIN_URL as url } from '$lib/utils/config';

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
