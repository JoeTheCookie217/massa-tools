import { Args, bytesToU256, strToBytes } from '@massalabs/massa-web3';
import type { Allowance } from '$lib/utils/types';
import { get } from 'svelte/store';
import clientStore from '$lib/store/client';
import { IERC20, parseEther } from '@dusalabs/sdk';

const maxGas = 100_000_000n;
const baseClient = get(clientStore);

export const fetchMasBalance = (account: string): Promise<bigint> =>
	baseClient
		.publicApi()
		.getAddresses([account])
		.then((e) => parseEther(e[0].final_balance))
		.catch((err) => {
			console.log(err.message);
			return 0n;
		});

export const fetchTokenBalance = (address: string, account: string): Promise<bigint> =>
	new IERC20(address, baseClient).balanceOf(account);

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
				const amount = r.final_value ? bytesToU256(r.final_value) : 0n;
				const spender = keys[i].slice(owner.length);
				return {
					owner,
					spender,
					amount
				};
			});
		});
};
