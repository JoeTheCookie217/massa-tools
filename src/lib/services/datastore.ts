import { Args, EventPoller, bytesToStr, bytesToU256 } from '@massalabs/massa-web3';
import type { Allowance } from '$lib/utils/types';
import { get } from 'svelte/store';
import clientStore from '$lib/store/client';
import { IBaseContract, IERC20, parseUnits } from '@dusalabs/sdk';
import { pollAsyncEvents, type IEventPollerResult, eventsFilter } from './events';
import { CHAIN_NAME, MNS_RESOLVER } from '$lib/utils/config';

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

export const getDatastore = (address: string) =>
	baseClient
		.publicApi()
		.getAddresses([address])
		.then((r) => r[0].final_datastore_keys);

export const parseDatastore = (keys: number[][]): string[] =>
	keys.map((v) => String.fromCharCode(...v)).sort((a, b) => a.localeCompare(b));

export const getBigDatastore = async (address: string, prefix: string) => {
	const url = `https://indexer-${CHAIN_NAME}-dusa.up.railway.app/datastore-keys?address=${address}&prefix=${prefix}`;
	return fetch(url).then((res) => res.json());
};

export const fetchTokenAllowances = async (
	address: string,
	owner: string
): Promise<Allowance[]> => {
	const prefix = 'ALLOWANCE' + owner;
	const keys = await getDatastore(address)
		.then((entries) => parseDatastore(entries).filter((e) => e.startsWith(prefix)))
		.catch((err) => {
			console.log('err', err);
			getBigDatastore(address, prefix);
		})
		.catch(() => null);
	if (!keys) return Promise.reject();

	return new IBaseContract(address, baseClient).extract(keys).then((res) => {
		return res.map((r, i) => {
			const amount = r ? bytesToU256(r) : 0n;
			const spender = keys[i].slice(prefix.length);
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

export const resolveMNS = async (slug: string): Promise<string> => {
	return baseClient
		.mnsResolver()
		.resolve(slug)
		.catch(() =>
			new IBaseContract(MNS_RESOLVER, baseClient)
				.read({
					targetFunction: 'dnsResolve',
					parameter: new Args().addString(slug)
				})
				.then((r) => bytesToStr(r.returnValue))
		);
};
