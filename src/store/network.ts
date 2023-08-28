import type { IAccount } from '@massalabs/wallet-provider';
import { writable } from 'svelte/store';
import { Client, DefaultProviderUrls, ProviderType } from '@massalabs/massa-web3';

const defaultPublicApi = localStorage.getItem('defaultPublicApi') || DefaultProviderUrls.BUILDNET;
console.log('defaultPublicApi', defaultPublicApi, localStorage.getItem('defaultPublicApi'));
const providers = [
	{ url: defaultPublicApi, type: ProviderType.PUBLIC },
	{ url: defaultPublicApi, type: ProviderType.PRIVATE }
];
const client = new Client({
	providers,
	retryStrategyOn: false,
	periodOffset: 0
});

const networkStore = writable<Client>(client);

export default networkStore;
