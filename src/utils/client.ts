import { Client, ProviderType } from '@massalabs/massa-web3';

const providers = [
	{ url: 'https://buildnet.massa.net/api/v2', type: ProviderType.PUBLIC },
	{ url: 'https://buildnet.massa.net/api/v2', type: ProviderType.PRIVATE }
];

export let client = new Client({
	providers,
	retryStrategyOn: true,
	periodOffset: 0
});
