<script lang="ts">
	let address: string;
</script>

<div>
	<input bind:value={address} />
	<button>
		<a href="/{address}">Search address</a>
	</button>
</div>
