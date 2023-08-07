<script lang="ts">
	import { providers as getProviders } from '@massalabs/wallet-provider';
	import '../app.css';

	const getConnectedAddress = async () => {
		const providers = await getProviders();
		console.log(providers);
		return '0x123';
	};
</script>

<header class="flex justify-around p-2">
	<h1>
		<a href="/">Massa Labs</a>
	</h1>
	<nav>
		<a href="/">Explorer</a>
		<a href="/create">Create</a>
	</nav>
</header>

<slot />

<footer>
	<p>
		2023
		<a href="https://massalabs.com">Massa Labs</a>
	</p>
</footer>
