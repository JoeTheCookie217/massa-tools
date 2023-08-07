import { error } from '@sveltejs/kit';
import { byteToU8, bytesToStr, bytesToU64, strToBytes } from '@massalabs/massa-web3';
import { client } from '../../utils/client';

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
	console.log(address);

	// const keys = await client
	// 		.publicApi()
	// 		.getAddresses([address])
	// 		.then(async (res) => {
	// 			if (!res[0]) throw new Error('No such address');
	// 			return res[0].candidate_datastore_keys.map((key) => String.fromCharCode(...key));
	// 		});

	// const balancesTmp: BalanceEntry[] = [];
	// 	let propertiesTmp: PropertyEntry = {} as PropertyEntry;

	// 	await client
	// 		.publicApi()
	// 		.getDatastoreEntries(keys.map((k) => ({ address, key: strToBytes(k) })))
	// 		.then((r) => {
	// 			for (let i = 0; i < r.length; i++) {
	// 				const key = keys[i];
	// 				const res = r[i].final_value;
	// 				if (res) {
	// 					if (key.startsWith('BALANCE')) {
	// 						balancesTmp.push({
	// 							address: key.slice(7),
	// 							value: bytesToU64(res)
	// 						});
	// 						continue;
	// 					}
	// 					if (erc20Keys.includes(key)) {
	// 						switch (key) {
	// 							case 'SYMBOL':
	// 								propertiesTmp.symbol = bytesToStr(res);
	// 								break;
	// 							case 'NAME':
	// 								propertiesTmp.name = bytesToStr(res);
	// 								break;
	// 							case 'OWNER':
	// 								propertiesTmp.owner = bytesToStr(res);
	// 								break;
	// 							case 'TOTAL_SUPPLY':
	// 								propertiesTmp.totalSupply = bytesToU64(res);
	// 								break;
	// 							case 'DECIMALS':
	// 								propertiesTmp.decimals = byteToU8(res);
	// 								break;
	// 							default:
	// 								break;
	// 						}
	// 					}
	// 				}
	// 			}
	// 		});

	// 	balances = balancesTmp.sort((a, b) => Number(b.value - a.value));
	// 	properties = propertiesTmp;

	return {
		balances: [],
		properties: { address } as Properties
	};

	// throw error(404, 'Smart contract not found');
}
