<script>
	import { page } from '$app/stores';
	import { WalletClient } from '@massalabs/massa-web3';

	let privateKey = '';
	let address = '';

	async function getAddress() {
		console.log(privateKey);
		let wallet = await WalletClient.getAccountFromSecretKey(privateKey);
		if (wallet && wallet.address) address = wallet.address;
		console.log(address);
	}
</script>

<h1>
	{$page.params.slug}
</h1>
<h2>Address: {address}</h2>
