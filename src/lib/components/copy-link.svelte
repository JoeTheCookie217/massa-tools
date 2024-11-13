<script lang="ts">
	import CopyButton from './copy-button.svelte';
	import { printAddress } from '$lib/utils/methods';

	export let copyText: string;

	const path = copyText.startsWith('B1')
		? 'block'
		: copyText.startsWith('O1')
		? 'operation'
		: 'explorer';
</script>

<div>
	<a href={`/${path}/${copyText}`} class="hover:underline">
		{printAddress(copyText)}
	</a>
	<CopyButton {copyText} />
</div>
