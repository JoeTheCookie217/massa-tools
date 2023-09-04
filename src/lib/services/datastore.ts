import { Args, bytesToU64, strToBytes } from '@massalabs/massa-web3';
import type { Allowance } from '$lib/utils/types';
import { get } from 'svelte/store';
import networkStore from '$lib/store/network';

const maxGas = 100_000_000n;
const baseClient = get(networkStore);

export const fetchTokenBalance = (address: string, account: string): Promise<bigint> =>
	baseClient
		.smartContracts()
		.readSmartContract({
			targetAddress: address,
			targetFunction: 'balanceOf',
			parameter: new Args().addString(account).serialize(),
			maxGas
		})
		.then((e) => bytesToU64(e.returnValue))
		.catch(() => 0n);

export const getDatastore = (address: string) =>
	baseClient
		.publicApi()
		.getAddresses([address])
		.then((r) =>
			r[0].final_datastore_keys
				.map((v) => String.fromCharCode(...v))
				.sort((a, b) => a.localeCompare(b))
		);

export const fetchTokenAllowances = async (
	address: string,
	owner: string
): Promise<Allowance[]> => {
	const keys = await getDatastore(address)
		.then((entries) => {
			const filteredEntries = entries.filter((e) => e.startsWith(owner));
			return filteredEntries;
		})
		.catch(() => [] as string[]);
	if (!keys) return Promise.reject();

	return baseClient
		.publicApi()
		.getDatastoreEntries(keys.map((k) => ({ address, key: strToBytes(k) })))
		.then((res) => {
			return res.map((r, i) => {
				const amount = r.final_value ? bytesToU64(r.final_value) : 0n;
				const spender = keys[i].slice(owner.length);
				return {
					owner,
					spender,
					amount
				};
			});
		});
};
