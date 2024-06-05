import { error } from '@sveltejs/kit';
import {
	byteToU8,
	bytesToStr,
	strToBytes,
	type IDatastoreEntry,
	bytesToU256,
	Args
} from '@massalabs/massa-web3';
import clientStore from '$lib/store/client';
import { get } from 'svelte/store';
import { fetchMasBalance, getDatastore } from '$lib/services/datastore';
import type { RouteParams } from './$types';
import { isVerified, parseBalance, tokenAddresses } from '$lib/utils/methods';
import { ERC20_KEYS } from '$lib/utils/types';
import { CHAIN_ID, MAX_PER_REQUEST } from '$lib/utils/config';

type AddressInfo = {
	address: string;
	keys: string[];
	isVerified: boolean;
	isToken: boolean;
	isMultisig: boolean;
	balance: bigint;
	erc20Balances: bigint[];
};

const client = get(clientStore);

export async function load({ params }: { params: RouteParams }): Promise<AddressInfo> {
	const address = params.slug;

	const notFoundError = error(404, 'Address not found');
	const keys = await getDatastore(address).catch((err) => {
		console.error(err);
		throw notFoundError;
	});

	const erc20BalancesKeys = tokenAddresses.map((token) => ({
		address: token[CHAIN_ID].address || address,
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
		erc20Balances
	};
}
