<script lang="ts">
	import type { IClient } from '@massalabs/massa-web3';
	import { clientStore } from '../../store/account';
	import Button from '../../components/button.svelte';

	const stakingAddress = 'AS12148EJam1pa9F9FtfvbWVyLaGtxf9Zocer2HvEDJxuPGumUQAT';

	let massaClient: IClient | null = null;
	clientStore.subscribe((c) => {
		if (c) massaClient = c;
	});

	const deposit = () => {
		if (!massaClient) return;

		massaClient
			.smartContracts()
			.callSmartContract({
				targetAddress: stakingAddress,
				functionName: 'deposit',
				parameter: [],
				coins: 0n,
				maxGas: 100_000_000n,
				fee: 0n
			})
			.then((txId) => {
				console.log(txId);
			})
			.catch((e) => {
				console.log(e);
			});
	};

	const withdraw = () => {
		if (!massaClient) return;

		massaClient
			.smartContracts()
			.callSmartContract({
				targetAddress: stakingAddress,
				functionName: 'withdraw',
				parameter: [],
				coins: 0n,
				maxGas: 100_000_000n,
				fee: 0n
			})
			.then((txId) => {
				console.log(txId);
			})
			.catch((e) => {
				console.log(e);
			});
	};
</script>

<div class="flex">
	<Button onClick={deposit} text="Deposit" />
	<Button onClick={withdraw} text="Withdraw" />
</div>
