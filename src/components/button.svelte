<script lang="ts">
	export let text: string;
	export let onClick: () => void;
	export let disabled = false;
</script>

<button
	{disabled}
	on:click={onClick}
	class={`${$$props.class} bg-purple-300 hover:bg-purple-400 text-gray-800 mx-1.5 p-1.5 rounded-md disabled:bg-gray-300 disabled:text-gray-500`}
	>{text}</button
>
