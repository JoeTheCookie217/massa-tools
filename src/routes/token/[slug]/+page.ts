import { error } from '@sveltejs/kit';
import { byteToU8, bytesToStr, strToBytes } from '@massalabs/massa-web3';
import { bytesToBigInt, isVerified, toDatastoreInput } from '$lib/utils/methods';
import clientStore from '$lib/store/client';
import { get } from 'svelte/store';
import { ERC20_KEYS, type BalanceEntry, type Properties, type ERC20_KEY } from '$lib/utils/types';
import { getDatastore } from '$lib/services/datastore';
import type { RouteParams } from './$types';
import { MAX_PER_REQUEST } from '$lib/utils/config';

type TokenInfo = {
	balances: BalanceEntry[];
	properties: Properties;
	isVerified?: boolean;
};

const client = get(clientStore);

export async function load({ params }: { params: RouteParams }): Promise<TokenInfo> {
	const address = params.slug;

	const balanceKeys = await getDatastore(address)
		.then((res) => res.filter((entry) => entry.startsWith('BALANCE')))
		.catch((err) => {
			console.error(err);
			return [];
		});
	const keys = [...new Set([...ERC20_KEYS, ...balanceKeys.slice(0, MAX_PER_REQUEST)])];

	const r = await client
		.publicApi()
		.getDatastoreEntries(toDatastoreInput(address, keys))
		.catch((err) => {
			console.error(err);
			throw error(404, 'Token invalid');
		});

	const balanceEntries = r.filter(
		(entry, i) => keys[i].startsWith('BALANCE') && entry.candidate_value
	);
	const balances: BalanceEntry[] = balanceEntries
		.map((entry) => ({
			address: keys[r.indexOf(entry)].slice(7),
			value: bytesToBigInt(entry.candidate_value!)
		}))
		.sort((a, b) => Number(b.value - a.value));

	const erc20entries = r.filter(
		(entry, i) => ERC20_KEYS.includes(keys[i] as ERC20_KEY) && entry.candidate_value
	);

	const find = (key: ERC20_KEY) => erc20entries.find((entry) => keys[r.indexOf(entry)] === key);
	const symbolEntry = find('SYMBOL');
	const nameEntry = find('NAME');
	const ownerEntry = find('OWNER');
	const totalSupplyEntry = find('TOTAL_SUPPLY');
	const decimalsEntry = find('DECIMALS');

	if (!symbolEntry || !nameEntry || !ownerEntry || !totalSupplyEntry || !decimalsEntry)
		throw error(404, 'ERC20 not found');
	const symbol = bytesToStr(symbolEntry.candidate_value!);
	const name = bytesToStr(nameEntry.candidate_value!);
	const owner = bytesToStr(ownerEntry.candidate_value!);
	const totalSupply = bytesToBigInt(totalSupplyEntry.candidate_value!);
	const decimals = byteToU8(decimalsEntry.candidate_value!);
	const mintable = await functionExists(address, 'mint');
	const burnable = await functionExists(address, 'burn');

	const properties: Properties = {
		address,
		holders: balanceKeys.length,
		symbol,
		name,
		owner,
		totalSupply,
		decimals,
		mintable,
		burnable
	};

	return {
		balances,
		properties,
		isVerified: isVerified(address)
	};
}

const functionExists = async (targetAddress: string, targetFunction: string) => {
	return client
		.smartContracts()
		.readSmartContract({
			maxGas: 100_000_000n,
			parameter: [],
			targetAddress,
			targetFunction
		})
		.then(() => true)
		.catch((err) => {
			if (err.message.includes('Missing export')) return false;
			return true;
		});
};
