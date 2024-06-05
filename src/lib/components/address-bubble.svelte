<script lang="ts">
	const stringHexNumber = (x: string) =>
		(parseInt(parseInt(x, 36).toExponential().slice(2, -5), 10) & 0xffffff)
			.toString(16)
			.toUpperCase();

	export let address: string;
</script>

<div
	class="rounded-full text-sm size-16 w-16 h-16 grid place-items-center"
	style={`background-color: #${stringHexNumber(address)}`}
>
	{'.' + address.slice(-3)}
</div>
