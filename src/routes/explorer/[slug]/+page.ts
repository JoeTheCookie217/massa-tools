import { error } from '@sveltejs/kit';
import { byteToU8, bytesToStr, strToBytes } from '@massalabs/massa-web3';
import { bytesToNumber } from '$lib/utils/methods';
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

	let balances: BalanceEntry[] = [];
	let properties: Properties = { address } as Properties;

	await client
		.publicApi()
		.getDatastoreEntries(keys.map((k) => ({ address, key: strToBytes(k) })))
		.then((r) => {
			for (let i = 0; i < r.length; i++) {
				const key = keys[i];
				const res = r[i].final_value;
				if (res) {
					if (key.startsWith('BALANCE')) {
						const balance = bytesToNumber(res);
						if (balance === 0n) continue;

						balances.push({
							address: key.slice(7),
							value: balance
						});
						continue;
					}
					if (erc20Keys.includes(key)) {
						switch (key) {
							case 'SYMBOL':
								properties.symbol = bytesToStr(res);
								break;
							case 'NAME':
								properties.name = bytesToStr(res);
								break;
							case 'OWNER':
								properties.owner = bytesToStr(res);
								break;
							case 'TOTAL_SUPPLY':
								properties.totalSupply = bytesToNumber(res);
								break;
							case 'DECIMALS':
								properties.decimals = byteToU8(res);
								break;
							default:
								break;
						}
					}
				}
			}
		})
		.catch((err) => {
			console.error(err);
			throw error(404, 'Token invalid');
		});

	if (Object.keys(properties).length === 0) throw error(404, 'ERC20 not found');

	await functionExists(address, 'mint').then((res) => (properties.mintable = res));
	await functionExists(address, 'burn').then((res) => (properties.burnable = res));
	balances = balances.sort((a, b) => Number(b.value - a.value));

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
