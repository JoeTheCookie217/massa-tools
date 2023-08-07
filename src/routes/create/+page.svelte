<script lang="ts">
	import { deploySC } from '@massalabs/massa-sc-deployer';
	import { publicApi } from '../../utils/client';

	async function deploy() {
		// await deploySC(
		// 	publicApi,
		// 	BOB,
		// 	[
		// 		{
		// 			data: readFileSync(path.join(__dirname, 'build', 'main.wasm')),
		// 			coins: fromMAS(0.1),
		// 			args: new Args()
		// 				.addString(ALICE.address as string)
		// 				.addString(digest)
		// 				.addString(publicKey)
		// 				.addString(signature.base58Encoded)
		// 		} as ISCData
		// 	],
		// 	0n,
		// 	4_200_000_000n,
		// 	true
		// );
	}
</script>

<h1>Create ERC20</h1>
