import { fetchMasBalance, getDatastoreKeys, getTokenValue } from '$lib/services/datastore';
import { TokenAmount, Transaction } from '@dusalabs/sdk';
import clientStore from '$lib/store/client';
import { strToBytes, bytesToI32, byteToBool, bytesToU64 } from '@massalabs/massa-web3';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { RouteParams } from './$types';
import { parseBalance, toDatastoreInput, toFraction, tokenAddresses } from '$lib/utils/methods';
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
	erc20Values: number[];
	usdBalance: number;
};

export async function load({ params }: { params: RouteParams }): Promise<MultisigInfo> {
	const address = params.address;
	const balance = await fetchMasBalance(address);

	const datastore = await getDatastoreKeys(address);
	const OWNER_PREFIX = 'is_owner::';
	const TX_PREFIX = 'transactions::';
	const APPROVAL_PREFIX = 'approved::';
	const ownerKeys = datastore.filter((entry) => entry.startsWith(OWNER_PREFIX));
	const txKeys = datastore.filter((entry) => entry.startsWith(TX_PREFIX));
	const approvalsKeys = datastore.filter((entry) => entry.startsWith(APPROVAL_PREFIX));
	const erc20BalancesInput = tokenAddresses.map((token) => ({
		address: token.address,
		key: strToBytes(`BALANCE${address}`)
	}));
	const multisigKeys = ['required', 'delay', 'upgradeable_period'];

	const r = await client
		.publicApi()
		.getDatastoreEntries([
			...toDatastoreInput(address, multisigKeys),
			...toDatastoreInput(address, ownerKeys),
			...toDatastoreInput(address, txKeys),
			...toDatastoreInput(address, approvalsKeys),
			...erc20BalancesInput
		])
		.then(async (result) => {
			const requiredRes = result[0].candidate_value;
			if (!requiredRes) throw error(404, 'Multisig invalid');
			const required = bytesToI32(requiredRes);
			const executionDelayRes = result[1].candidate_value;
			if (!executionDelayRes) throw error(404, 'Multisig invalid');
			const executionDelay = Number(bytesToU64(executionDelayRes));
			const upgradeDelayRes = result[2].candidate_value;
			if (!upgradeDelayRes) throw error(404, 'Multisig invalid');
			const upgradeDelay = Number(bytesToU64(upgradeDelayRes));

			let len = ownerKeys.length + multisigKeys.length;
			const ownersRes = result.slice(multisigKeys.length, len);
			const owners = [];
			for (let i = 0; i < ownersRes.length; i++) {
				const res = ownersRes[i].candidate_value;
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
				const res = txRes[i].candidate_value;
				if (res) {
					const tx = new Transaction().deserialize(res, 0);
					transactions.push({ tx: tx.instance, approvals: [] });
				}
			}
			len += txKeys.length;

			const approvalsRes = result.slice(len, len + approvalsKeys.length);
			for (let i = 0; i < approvalsRes.length; i++) {
				const res = approvalsRes[i].candidate_value;
				// const regexPattern = /${APPROVAL_PREFIX}(\d+)(AS1|AU1)(.*)/;
				const regexPattern = new RegExp(`${APPROVAL_PREFIX}(\\d+)(AS1|AU1)(.*)`);
				const match = approvalsKeys[i].match(regexPattern);

				if (res && match) {
					const approval: Approval = { address: match[2] + match[3], support: byteToBool(res) };
					transactions[Number(match[1])].approvals.push(approval);
				}
			}
			len += approvalsKeys.length;

			const resBalances = result.slice(-erc20BalancesInput.length);
			const erc20Balances = resBalances.map((entry, i) => parseBalance(entry.candidate_value));

			const erc20Values = await Promise.all(tokenAddresses.map((token) => getTokenValue(token)));
			const usdBalance = erc20Values.reduce(
				(acc, val, i) =>
					acc +
					Number(
						new TokenAmount(tokenAddresses[i], erc20Balances[i])
							.multiply(toFraction(val))
							.toSignificant(2)
					),
				0
			);

			return {
				required,
				owners,
				transactions,
				erc20Balances,
				erc20Values,
				upgradeDelay,
				executionDelay,
				usdBalance
			};
		})
		.catch((err) => {
			console.log(err);
			throw error(404, 'Multisig not found');
		});

	return { ...r, address, balance };
}
