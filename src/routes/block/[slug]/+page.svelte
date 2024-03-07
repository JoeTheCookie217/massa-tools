<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import { page } from '$app/stores';

	const blockHash = $page.params.slug;
	const query = trpc.getBlock.query({ blockHash });
</script>

{#if $query.isSuccess}
	<p>{JSON.stringify($query.data, null, 4)}</p>
{:else if $query.isError}
	<p>{$query.error.message}</p>
{:else}
	<p>Loading...</p>
{/if}
