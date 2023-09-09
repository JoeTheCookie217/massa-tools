<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let address: string;
</script>

<div>
	<Label for="address">Multisig Address</Label>
	<Input
		type="text"
		id="address"
		placeholder="AS12a1HN9WreQYmxucyLGQ3TSm3s8QYdF72VHG3mJHPLJHakwscFT"
		bind:value={address}
	/>
</div>
<a href="/multisig/create">
	<Button variant="link">Don't have a multisig wallet? Create one</Button>
</a>
