import { error } from '@sveltejs/kit';
import { byteToU8, bytesToStr, strToBytes } from '@massalabs/massa-web3';
import { bytesToBigInt } from '$lib/utils/methods';
import clientStore from '$lib/store/client';
import { get } from 'svelte/store';
import type { BalanceEntry, Properties } from '$lib/utils/types';
import { getDatastore } from '$lib/services/datastore.js';
import type { RouteParams } from './$types';

type TokenInfo = {
	balances: BalanceEntry[];
	properties: Properties;
};

const erc20Keys = ['DECIMALS', 'SYMBOL', 'NAME', 'TOTAL_SUPPLY', 'OWNER'];
const client = get(clientStore);

export async function load({ params }: { params: RouteParams }): Promise<TokenInfo> {
	const address = params.slug;

	const notFoundError = error(404, 'Address not found');
	const balanceKeys = await getDatastore(address)
		.then((res) => res.filter((entry) => entry.startsWith('BALANCE')))
		.catch((err) => {
			console.error(err);
			throw notFoundError;
		});
	const keys = [...new Set([...erc20Keys, ...balanceKeys.slice(0, 100)])];
	console.log(keys);

	const r = await client
		.publicApi()
		.getDatastoreEntries(keys.map((k) => ({ address, key: strToBytes(k) })))
		.catch((err) => {
			console.error(err);
			throw error(404, 'Token invalid');
		});

	const balanceEntries = r.filter((entry, i) => keys[i].startsWith('BALANCE') && entry.final_value);
	const balances: BalanceEntry[] = balanceEntries
		.map((entry) => ({
			address: keys[r.indexOf(entry)].slice(7),
			value: bytesToBigInt(entry.final_value!)
		}))
		.sort((a, b) => Number(b.value - a.value));

	const erc20entries = r.filter((entry, i) => erc20Keys.includes(keys[i]) && entry.final_value);
	const symbolEntry = erc20entries.find((entry) => keys[r.indexOf(entry)] === 'SYMBOL');
	const nameEntry = erc20entries.find((entry) => keys[r.indexOf(entry)] === 'NAME');
	const ownerEntry = erc20entries.find((entry) => keys[r.indexOf(entry)] === 'OWNER');
	const totalSupplyEntry = erc20entries.find((entry) => keys[r.indexOf(entry)] === 'TOTAL_SUPPLY');
	const decimalsEntry = erc20entries.find((entry) => keys[r.indexOf(entry)] === 'DECIMALS');

	if (!symbolEntry || !nameEntry || !ownerEntry || !totalSupplyEntry || !decimalsEntry)
		throw error(404, 'ERC20 not found');
	const symbol = bytesToStr(symbolEntry.final_value!);
	const name = bytesToStr(nameEntry.final_value!);
	const owner = bytesToStr(ownerEntry.final_value!);
	const totalSupply = bytesToBigInt(totalSupplyEntry.final_value!);
	const decimals = byteToU8(decimalsEntry.final_value!);
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

	console.log(properties, balances);
	return {
		balances,
		properties
	};
}

const functionExists = async (address: string, functionName: string) => {
	return client
		.smartContracts()
		.readSmartContract({
			maxGas: 100_000_000n,
			parameter: [],
			targetAddress: address,
			targetFunction: functionName
		})
		.then(() => true)
		.catch((err) => {
			if (err.message.includes('Missing export')) return false;
			return true;
		});
};
