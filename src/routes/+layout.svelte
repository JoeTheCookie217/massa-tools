<script lang="ts">
	// import { providers as getProviders } from '@massalabs/wallet-provider';
	import '../app.css';

	// const getConnectedAddress = async () => {
	// 	const providers = await getProviders();
	// 	console.log(providers);
	// 	return '0x123';
	// };
</script>

<main class="h-screen flex flex-col">
	<header class="flex justify-around items-center p-2">
		<h1>
			<a class="text-2xl" href="/">Massa Tools</a>
		</h1>
		<nav class="flex gap-4">
			<a href="/explorer">Explorer</a>
			<a href="/create">Create</a>
			<a href="/multisig">Multisig</a>
			<a href="/staking">Staking</a>
		</nav>
	</header>

	<section class="grow grid place-items-center">
		<slot />
	</section>

	<footer class="text-center p-2">
		<p>
			Made with ❤️ by
			<a href="https://github.com/JoeTheCookie217">JoeTheCookie217</a>
		</p>
	</footer>
</main>
