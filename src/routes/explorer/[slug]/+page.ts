import { error } from '@sveltejs/kit';
import { byteToU8, bytesToStr, strToBytes, type IDatastoreEntry } from '@massalabs/massa-web3';
import clientStore from '$lib/store/client';
import { get } from 'svelte/store';
import { getDatastore } from '$lib/services/datastore.js';
import type { RouteParams } from './$types';
import { isVerified } from '$lib/utils/methods';
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
};

const client = get(clientStore);

export async function load({ params }: { params: RouteParams }): Promise<AddressInfo> {
	const address = params.slug;

	const notFoundError = error(404, 'Address not found');
	const keys = await getDatastore(address).catch((err) => {
		console.error(err);
		throw notFoundError;
	});

	const entries = await client
		.publicApi()
		.getDatastoreEntries(keys.map((k) => ({ address, key: strToBytes(k) })))
		.then((res) =>
			res
				.filter((entry) => entry.final_value)
				.map((entry, i) => ({
					value: entry.final_value as Uint8Array,
					key: keys[i]
				}))
		)
		.catch((err) => {
			console.error(err);
			throw error(404, 'Address invalid');
		});

	return {
		address,
		entries,
		isVerified: isVerified(address),
		isToken: ERC20_KEYS.every((key) => entries.some((entry) => entry.key === key))
	};
}
