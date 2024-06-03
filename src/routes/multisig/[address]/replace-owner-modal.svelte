<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import useSendTx from '$lib/hooks/useSendTx';
	import { buildSubmit } from './methods';
	import { Args } from '@massalabs/massa-web3';

	export let multisigAddress: string;
	export let owners: string[];

	let oldOwnerAddress: string = '';
	let newOwnerAddress: string = '';
	$: disabled = !oldOwnerAddress || !newOwnerAddress;

	const { send } = useSendTx();

	const replaceOwner = () => {
		const submitData = buildSubmit(
			multisigAddress,
			multisigAddress,
			'replaceOwner',
			0n,
			Uint8Array.from(new Args().addString(oldOwnerAddress).addString(newOwnerAddress).serialize())
		);
		send(submitData);
	};

	let open = false;
	const onOpenChange = (e: boolean | undefined) => {
		if (e) open = e;
	};
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Trigger>
		<Button variant="outline">Replace Owner</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Replace Owner</Dialog.Title>
			<Dialog.Description>Description</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="flex justify-center">
			<Button variant="outline" on:click={replaceOwner}>Replace Owner</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
