import { error } from '@sveltejs/kit';
import { strToBytes } from '@massalabs/massa-web3';
import clientStore from '$lib/store/client';
import { get } from 'svelte/store';
import { fetchMasBalance, getDatastore, resolveMNS } from '$lib/services/datastore';
import type { RouteParams } from './$types';
import { isAddress, isVerified, parseBalance, tokenAddresses } from '$lib/utils/methods';
import { ERC20_KEYS } from '$lib/utils/types';

export type AddressInfo = {
	address: string;
	keys: string[];
	isVerified: boolean;
	isToken: boolean;
	isMultisig: boolean;
	balance: bigint;
	erc20Balances: bigint[];
	tooBig?: boolean;
};

const client = get(clientStore);

export async function load({ params }: { params: RouteParams }): Promise<AddressInfo> {
	const address: string = isAddress(params.slug) ? params.slug : await resolveMNS(params.slug);
	if (!isAddress(address)) throw error(404, 'Address invalid');

	const notFoundError = error(404, 'Address not found');

	let tooBig = false;
	const keys = await getDatastore(address).catch((err) => {
		if (err.message === 'Response is too big') {
			tooBig = true;
			return [];
		}
		console.error(err);
		throw notFoundError;
	});

	const erc20BalancesKeys = tokenAddresses.map((token) => ({
		address: token.address || address,
		key: strToBytes(`BALANCE${address}`)
	}));

	const erc20Balances = await client
		.publicApi()
		.getDatastoreEntries(erc20BalancesKeys)
		.then((res) => res.map(({ candidate_value }) => parseBalance(candidate_value)));

	return {
		address,
		keys,
		isVerified: isVerified(address),
		isToken: ERC20_KEYS.every((key) => keys.some((k) => k === key)),
		isMultisig: ['required', 'delay', 'upgradeable_period', 'owners'].every((key) =>
			keys.some((k) => k === key)
		),
		balance: await fetchMasBalance(address),
		erc20Balances,
		tooBig
	};
}
