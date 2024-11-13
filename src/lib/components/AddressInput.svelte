<script lang="ts">
	import { resolveMNS } from '$lib/services/datastore';
	import { baseClient } from '$lib/store/client';
	import { isAddress, debounce } from '$lib/utils/methods';
	import { Input } from './ui/input';

	interface Props {
		recipient: string;
		valid: boolean;
		checkingMNS: boolean;
	}

	let validAddress: boolean = false;
	let validMNS: boolean = false;

	let { recipient, valid = validAddress || validMNS, checkingMNS = false }: Props = $props();

	const request = debounce(async (q: string) => resolve(q), 750);

	const resolve = (q: string) => {
		console.log('resolving', q);
		if (isAddress(q)) {
			validAddress = true;
			validMNS = false;
			return;
		}

		checkingMNS = true;
		resolveMNS(q)
			.then((res) => {
				console.log({ res });
				if (res) validMNS = true;
				else validMNS = false;
			})
			.finally(() => (checkingMNS = false));
	};

	$effect(() => {
		if (recipient.length > 0) request(recipient);
	});

	$effect(() => {
		validAddress = isAddress(recipient || '');
	});
</script>

<div class="flex items-center gap-2">
	<div>
		<Input type="text" placeholder="Recipient" id="recipient" bind:value={recipient} />
		{#if !valid && recipient.length > 0}
			<p class="text-red-500 text-xs">Invalid format</p>
		{/if}
		{checkingMNS && 'checking...'}
	</div>
</div>
