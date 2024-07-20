<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';

	export let tokenAddress: string;

	let open = true;
	const onOpenChange = (e: boolean | undefined) => {
		if (e) open = e;
	};
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Trigger />
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Token Created</Dialog.Title>
			<Dialog.Description>{tokenAddress}</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="flex justify-center">
			<Button variant="link">
				<a href={`/token/${tokenAddress}`} />
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
