import { fetchMasBalance, getDatastore } from '$lib/services/datastore';
import { Transaction } from '@dusalabs/sdk';
import clientStore from '$lib/store/client';
import { strToBytes, bytesToI32, byteToBool, bytesToU64 } from '@massalabs/massa-web3';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { RouteParams } from './$types';
import { parseBalance, toDatastoreInput, tokenAddresses } from '$lib/utils/methods';
import { CHAIN_ID } from '$lib/utils/config';

const client = get(clientStore);

type Approval = {
	address: string;
	support: boolean;
};

export type FullTransaction = { tx: Transaction; approvals: Approval[] };

type MultisigInfo = {
	address: string;
	balance: bigint;
	required: number;
	upgradeDelay: number;
	executionDelay: number;
	owners: string[];
	transactions: FullTransaction[];
	erc20Balances: bigint[];
};

export async function load({ params }: { params: RouteParams }): Promise<MultisigInfo> {
	const address = params.address;
	const balance = await fetchMasBalance(address);

	const datastore = await getDatastore(address);
	const OWNER_PREFIX = 'is_owner::';
	const TX_PREFIX = 'transactions::';
	const APPROVAL_PREFIX = 'approved::';
	const ownerKeys = datastore.filter((entry) => entry.startsWith(OWNER_PREFIX));
	const txKeys = datastore.filter((entry) => entry.startsWith(TX_PREFIX));
	const approvalsKeys = datastore.filter((entry) => entry.startsWith(APPROVAL_PREFIX));
	const erc20BalancesKeys = tokenAddresses.map((token) => ({
		address: token[CHAIN_ID].address,
		key: strToBytes(`BALANCE${address}`)
	}));

	const r = await client
		.publicApi()
		.getDatastoreEntries([
			{ address, key: strToBytes('required') },
			{ address, key: strToBytes('delay') },
			{ address, key: strToBytes('upgradeable_period') },
			...toDatastoreInput(address, ownerKeys),
			...toDatastoreInput(address, txKeys),
			...toDatastoreInput(address, approvalsKeys),
			...erc20BalancesKeys
		])
		.then((result) => {
			const requiredRes = result[0].final_value;
			if (!requiredRes) throw error(404, 'Multisig invalid');
			const required = bytesToI32(requiredRes);

			const executionDelayRes = result[1].final_value;
			if (!executionDelayRes) throw error(404, 'Multisig invalid');
			const executionDelay = Number(bytesToU64(executionDelayRes));

			const upgradeDelayRes = result[2].final_value;
			if (!upgradeDelayRes) throw error(404, 'Multisig invalid');
			const upgradeDelay = Number(bytesToU64(upgradeDelayRes));

			let len = ownerKeys.length + 3;
			const ownersRes = result.slice(3, len);
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

			const txRes = result.slice(len, len + txKeys.length);
			const transactions: FullTransaction[] = [];
			for (let i = 0; i < txRes.length; i++) {
				const res = txRes[i].final_value;
				console.log(res);
				if (res) {
					const tx = new Transaction().deserialize(res, 0);
					transactions.push({ tx: tx.instance, approvals: [] });
				}
			}
			len += txKeys.length;

			const approvalsRes = result.slice(len, len + approvalsKeys.length);
			for (let i = 0; i < approvalsRes.length; i++) {
				const res = approvalsRes[i].final_value;
				// const regexPattern = /${APPROVAL_PREFIX}(\d+)(AS1|AU1)(.*)/;
				const regexPattern = new RegExp(`${APPROVAL_PREFIX}(\\d+)(AS1|AU1)(.*)`);
				const match = approvalsKeys[i].match(regexPattern);

				if (res && match) {
					const approval: Approval = { address: match[2] + match[3], support: byteToBool(res) };
					transactions[Number(match[1])].approvals.push(approval);
				}
			}
			len += approvalsKeys.length;

			const resBalances = result.slice(-erc20BalancesKeys.length);
			const erc20Balances = resBalances.map((entry, i) => parseBalance(entry.candidate_value));

			return { required, owners, transactions, erc20Balances, upgradeDelay, executionDelay };
		})
		.catch((err) => {
			console.log(err);
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

	return { ...r, address, balance };
}
