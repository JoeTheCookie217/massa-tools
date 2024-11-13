<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		address: string;
		type: 'token' | 'multisig';
	}

	let { address, type }: Props = $props();

	let open = $state(true);
	const onOpenChange = (e: boolean | undefined) => {
		if (e) open = e;
	};
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Trigger />
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Token Created</Dialog.Title>
			<Dialog.Description>{address}</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="flex justify-center">
			<Button variant="link">
				<a href={`/${type}/${address}`}>Visit</a>
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
