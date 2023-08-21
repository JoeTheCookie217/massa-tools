import { error } from '@sveltejs/kit';
import { byteToU8, bytesToStr, strToBytes } from '@massalabs/massa-web3';
import { client } from '../../utils/client';
import { bytesToNumber } from '../../utils/methods';

type BalanceEntry = {
	address: string;
	value: bigint;
};
type Properties = {
	address: string;
	decimals: number;
	name: string;
	symbol: string;
	totalSupply: bigint;
	owner: string;
};

export type MyPageLoad = {
	balances: BalanceEntry[];
	properties: Properties;
};

const erc20Keys = ['DECIMALS', 'SYMBOL', 'NAME', 'TOTAL_SUPPLY', 'OWNER'];

export async function load({ params }): Promise<MyPageLoad> {
	const address = params.slug;

	const keys = await client
		.publicApi()
		.getAddresses([address])
		.then(async (res) => {
			if (!res[0]) throw new Error('No such address');
			return res[0].candidate_datastore_keys.map((key) => String.fromCharCode(...key));
		});

	let balances: BalanceEntry[] = [];
	let properties: Properties = {} as Properties;

	await client
		.publicApi()
		.getDatastoreEntries(keys.map((k) => ({ address, key: strToBytes(k) })))
		.then((r) => {
			for (let i = 0; i < r.length; i++) {
				const key = keys[i];
				const res = r[i].final_value;
				if (res) {
					if (key.startsWith('BALANCE')) {
						balances.push({
							address: key.slice(7),
							value: bytesToNumber(res)
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
		});

	if (Object.keys(properties).length === 0) throw error(404, 'ERC20 not found');
	balances = balances.sort((a, b) => Number(b.value - a.value));
	properties.address = address;

	return {
		balances,
		properties
	};
}
