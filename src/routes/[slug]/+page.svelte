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
		address: string;
		value: string;
	};

	let balances: BalanceEntry[];
	let properties: PropertyEntry[];

	async function getDatastore() {
		const balancesTmp: BalanceEntry[] = [];
		const propertiesTmp: PropertyEntry[] = [];

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
							if (key === 'TOTAL_SUPPLY') {
								propertiesTmp.push({
									address: key,
									value: bytesToU64(res).toString()
								});
							} else if (key === 'DECIMALS') {
								propertiesTmp.push({
									address: key,
									value: byteToU8(res).toString()
								});
							} else {
								propertiesTmp.push({
									address: key,
									value: bytesToStr(res)
								});
							}
							continue;
						}
					}
				}
			});

		balances = balancesTmp;
		properties = propertiesTmp;
	}
</script>

<h1>
	Contract address: {address}
</h1>

{#await getDatastore()}
	<p>loading...</p>
{:then}
	{#if balances.length > 0}
		<h2>Balances</h2>
		{#each balances as { address, value }}
			<p>{address}: {value}</p>
		{/each}
	{/if}
	{#if properties.length > 0}
		<h2>Properties</h2>
		{#each properties as { address, value }}
			<p>{address}: {value}</p>
		{/each}
	{/if}
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
```
