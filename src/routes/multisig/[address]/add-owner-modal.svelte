<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import useSendTx from '$lib/hooks/useSendTx';
	import { buildSubmit } from './methods';
	import { Args } from '@massalabs/massa-web3';
	import AddressInput from '$lib/components/AddressInput.svelte';

	interface Props {
		multisigAddress: string;
	}
	let { multisigAddress }: Props = $props();

	let addOwnerAddress: string = $state('');
	let valid: boolean = $state(false);
	const disabled = $derived(!addOwnerAddress || !valid);

	const { send } = useSendTx();

	const addOwner = () => {
		const submitData = buildSubmit(
			multisigAddress,
			multisigAddress,
			'addOwner',
			0n,
			Uint8Array.from(new Args().addString(addOwnerAddress).serialize())
		);
		send(submitData);
	};

	let open = $state(false);
	const onOpenChange = (e: boolean | undefined) => {
		if (e) open = e;
	};
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Trigger>
		<Button variant="outline">Add</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add Owner</Dialog.Title>
			<Dialog.Description>Description</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="flex justify-center">
			<AddressInput bind:recipient={addOwnerAddress} bind:valid />
			<Button variant="outline" on:click={addOwner} {disabled}>Add Owner</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
