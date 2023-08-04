<script lang="ts">
	let address: string;
</script>

<input bind:value={address} />
<button>
	<a href="/{address}"> Lookup address</a>
</button>
