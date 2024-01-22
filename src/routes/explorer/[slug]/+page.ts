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
import {
	isVerified,
	parseBalance,
	providerToChainId,
	toDatastoreInput,
	tokenAddresses
} from '$lib/utils/methods';
import { ERC20_KEYS } from '$lib/utils/types';

type Entry = {
	key: string;
	value: Uint8Array;
};

type AddressInfo = {
	address: string;
	entries: Entry[];
	isVerified: boolean;
	isToken: boolean;
	balance: bigint;
	erc20Balances: bigint[];
};

const client = get(clientStore);
const selectedNetwork = providerToChainId(client.getPublicProviders()[0]);

export async function load({ params }: { params: RouteParams }): Promise<AddressInfo> {
	const address = params.slug;

	const notFoundError = error(404, 'Address not found');
	const keys = await getDatastore(address).catch((err) => {
		console.error(err);
		throw notFoundError;
	});

	const erc20BalancesKeys = tokenAddresses.map((token) => ({
		address: token[selectedNetwork].address || address,
		key: strToBytes(`BALANCE${address}`)
	}));

	const { entries, erc20Balances } = await client
		.publicApi()
		.getDatastoreEntries(toDatastoreInput(address, keys).concat(erc20BalancesKeys))
		.then((res) => {
			const resEntries = res.slice(0, keys.length);
			const resBalances = res.slice(keys.length);
			const entries = resEntries
				.filter((entry) => entry.final_value)
				.map((entry, i) => ({
					value: entry.final_value as Uint8Array,
					key: keys[i]
				}));
			const erc20Balances = resBalances.map((entry, i) => parseBalance(entry.candidate_value));

			return { entries, erc20Balances };
		})
		.catch((err) => {
			console.error(err);
			throw error(404, 'Address invalid');
		});

	return {
		address,
		entries,
		isVerified: isVerified(address),
		isToken: ERC20_KEYS.every((key) => entries.some((entry) => entry.key === key)),
		balance: await fetchMasBalance(address),
		erc20Balances
	};
}
