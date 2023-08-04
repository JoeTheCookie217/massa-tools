<script lang="ts">
	import { page } from '$app/stores';
	import { byteToU8, bytesToStr, bytesToU64, strToBytes } from '@massalabs/massa-web3';
	import { client } from '../../utils/client';

	const address = $page.params.slug;
	const erc20Keys = ['DECIMALS', 'SYMBOL', 'NAME', 'TOTAL_SUPPLY', 'OWNER'];

	type BalanceEntry = {
		address: string;
		value: bigint;
	};
	type PropertyEntry = {
		decimals: number;
		name: string;
		symbol: string;
		totalSupply: bigint;
		owner: string;
	};

	let balances: BalanceEntry[];
	let properties: PropertyEntry | undefined;

	async function getDatastore() {
		const balancesTmp: BalanceEntry[] = [];
		let propertiesTmp: PropertyEntry = {} as PropertyEntry;

		const keys = await client
			.publicApi()
			.getAddresses([address])
			.then(async (res) => {
				if (!res[0]) throw new Error('No such address');
				return res[0].candidate_datastore_keys.map((key) => String.fromCharCode(...key));
			});
		await client
			.publicApi()
			.getDatastoreEntries(keys.map((k) => ({ address, key: strToBytes(k) })))
			.then((r) => {
				for (let i = 0; i < r.length; i++) {
					const key = keys[i];
					const res = r[i].final_value;
					if (res) {
						if (key.startsWith('BALANCE')) {
							balancesTmp.push({
								address: key.slice(7),
								value: bytesToU64(res)
							});
							continue;
						}
						if (erc20Keys.includes(key)) {
							switch (key) {
								case 'SYMBOL':
									propertiesTmp.symbol = bytesToStr(res);
									break;
								case 'NAME':
									propertiesTmp.name = bytesToStr(res);
									break;
								case 'OWNER':
									propertiesTmp.owner = bytesToStr(res);
									break;
								case 'TOTAL_SUPPLY':
									propertiesTmp.totalSupply = bytesToU64(res);
									break;
								case 'DECIMALS':
									propertiesTmp.decimals = byteToU8(res);
									break;
								default:
									break;
							}
						}
					}
				}
			});

		balances = balancesTmp.sort((a, b) => Number(b.value - a.value));
		properties = propertiesTmp;
	}
</script>

<h1>
	Contract address: {address}
</h1>

{#await getDatastore()}
	<p>loading...</p>
{:then}
	{#if properties}
		<h2>Properties</h2>
		<p>Symbol: {properties.symbol}</p>
		<p>Name: {properties.name}</p>
		<p>
			Total supply: {(properties.totalSupply / 10n ** BigInt(properties.decimals)).toLocaleString()}
			({properties.decimals}
			decimals)
		</p>
		<p>Owner: {properties.owner}</p>
		<p>Holders: {balances.length}</p>
		{#if balances.length > 0}
			<h2>Balances</h2>
			{#each balances as { address, value }}
				{@const balance = Number(value / 10n ** BigInt(properties.decimals))}
				{@const share =
					(balance / Number(properties.totalSupply / 10n ** BigInt(properties.decimals))) * 100}
				<p>
					{address}: {balance.toLocaleString()} ({share.toFixed(4)}%)
				</p>
			{/each}
		{/if}
	{/if}
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
```
