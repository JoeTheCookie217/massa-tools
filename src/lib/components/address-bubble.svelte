<script lang="ts">
	const stringHexNumber = (x: string) =>
		(parseInt(parseInt(x, 36).toExponential().slice(2, -5), 10) & 0xffffff)
			.toString(16)
			.toUpperCase();

	export let address: string;
</script>

<div class="rounded-full p-4" style={`background-color: #${stringHexNumber(address)}`}>
	{'.' + address.slice(-3)}
</div>
