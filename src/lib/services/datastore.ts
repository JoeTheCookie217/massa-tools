import { EventPoller, bytesToU256 } from '@massalabs/massa-web3';
import type { Allowance } from '$lib/utils/types';
import { get } from 'svelte/store';
import clientStore from '$lib/store/client';
import { IERC20, parseUnits, Token as BaseToken } from '@dusalabs/sdk';
import { toDatastoreInput } from '$lib/utils/methods';
import { pollAsyncEvents, type IEventPollerResult, eventsFilter } from './events';
import { indexerApi } from '$lib/utils/config';
import { trpcClient } from '$lib/trpc/client';

const maxGas = 100_000_000n;
const baseClient = get(clientStore);

export const fetchMasBalance = (account: string): Promise<bigint> =>
	baseClient
		.publicApi()
		.getAddresses([account])
		.then((e) => parseUnits(e[0].final_balance, 9))
		.catch((err) => {
			console.log(err.message);
			return 0n;
		});

export const fetchTokenBalance = (address: string, account: string): Promise<bigint> =>
	new IERC20(address, baseClient).balanceOf(account);

export const getDatastoreKeys = (address: string) =>
	baseClient
		.publicApi()
		.getAddresses([address])
		.then((r) =>
			r[0].final_datastore_keys
				.map((v) => String.fromCharCode(...v))
				.sort((a, b) => a.localeCompare(b))
		);

export const getLargeDatastoreKeys = (address: string, prefix: string): Promise<string[]> =>
	fetch(`${indexerApi}/datastore-keys?address=${address}&prefix=${prefix}`).then((res) =>
		res.json()
	);
export const getBytecodeExports = (address: string): Promise<string[]> =>
	fetch(`${indexerApi}/bytecode-exports?address=${address}`).then((res) => res.json());

export const getTokenValue = (
	token: BaseToken | { address: string; decimals: number }
): Promise<number> =>
	// fetch(
	// 	`${rawTrpcApi}/token-value?tokenAddress=${token.address}&tokenDecimals=${token.decimals}`
	// ).then((res) => res.json());
	trpcClient.getTokenValue.query({ tokenAddress: token.address, tokenDecimals: token.decimals });

export const fetchTokenAllowances = async (
	address: string,
	owner: string
): Promise<Allowance[]> => {
	const keys = await getDatastoreKeys(address)
		.then((entries) => {
			const filteredEntries = entries.filter((e) => e.startsWith(owner));
			return filteredEntries;
		})
		.catch(() => [] as string[]);
	if (!keys) return Promise.reject();

	return baseClient
		.publicApi()
		.getDatastoreEntries(toDatastoreInput(address, keys))
		.then((res) => {
			return res.map((r, i) => {
				const amount = r.candidate_value ? bytesToU256(r.candidate_value) : 0n;
				const spender = keys[i].slice(owner.length);
				return {
					owner,
					spender,
					amount
				};
			});
		});
};

export const fetchEvents = async (txId: string) => {
	const eventPoller = EventPoller.startEventsPolling(
		{ ...eventsFilter, original_operation_id: txId },
		1000,
		baseClient
	);
	return pollAsyncEvents(eventPoller)
		.catch(
			(): IEventPollerResult => ({
				isError: true,
				events: []
			})
		)
		.finally(() => eventPoller.stopPolling());
};
