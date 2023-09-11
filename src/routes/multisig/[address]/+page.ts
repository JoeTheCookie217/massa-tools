import { fetchMasBalance, getDatastore } from '$lib/services/datastore';
import { Transaction } from '$lib/services/serialize.js';
import clientStore from '$lib/store/client';
import {
	strToBytes,
	bytesToI32,
	byteToBool,
	Args,
	bytesToSerializableObjectArray
} from '@massalabs/massa-web3';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { RouteParams } from './$types';

const client = get(clientStore);

type MultisigInfo = {
	address: string;
	balance: bigint;
	required: number;
	owners: string[];
	transactions: Transaction[];
};

export async function load({ params }: { params: RouteParams }): Promise<MultisigInfo> {
	const address = params.address;

	const balance = await fetchMasBalance(address);

	const datastore = await getDatastore(address);
	const OWNER_PREFIX = 'is_owner::';
	const TX_PREFIX = 'transactions::';
	const ownerKeys = datastore.filter((entry) => entry.startsWith(OWNER_PREFIX));
	const txKeys = datastore.filter((entry) => entry.startsWith(TX_PREFIX));

	const { required, owners, transactions } = await client
		.publicApi()
		.getDatastoreEntries([
			{
				address,
				key: strToBytes('required')
			},
			...ownerKeys.map((key) => ({
				address,
				key: strToBytes(key)
			})),
			...txKeys.map((key) => ({
				address,
				key: strToBytes(key)
			}))
		])
		.then((result) => {
			const requiredRes = result[0].final_value;
			if (!requiredRes) throw error(404, 'Multisig invalid');
			const required = bytesToI32(requiredRes);

			const ownersRes = result.slice(1, ownerKeys.length + 1);
			const owners = [];
			for (let i = 0; i < ownersRes.length; i++) {
				const res = ownersRes[i].final_value;
				if (res) {
					if (byteToBool(res)) {
						const caller = ownerKeys[i].slice(OWNER_PREFIX.length);
						owners.push(caller);
					}
				}
			}

			const txRes = result.slice(ownerKeys.length + 1);
			const transactions: Transaction[] = [];
			for (let i = 0; i < txRes.length; i++) {
				const res = txRes[i].final_value;
				if (res) {
					const tx = new Transaction().deserialize(res, 0);
					transactions.push(tx.instance);
				}
			}

			return { required, owners, transactions: transactions };
		})
		.catch(() => {
			throw error(404, 'Multisig not found');
		});

	// const transactions = await client
	// 	.smartContracts()
	// 	.readSmartContract({
	// 		targetAddress: address,
	// 		targetFunction: 'getTransactions',
	// 		parameter: [],
	// 		maxGas: 100_000_000n
	// 	})
	// 	.then((res) => {
	// 		console.log(res);
	// 		return bytesToSerializableObjectArray(res.returnValue, Transaction);
	// 	});
	console.log(transactions);

	return { balance, required, owners, address, transactions };
}
