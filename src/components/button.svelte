<script lang="ts">
	export let text: string;
	export let onClick: () => void;
</script>

<button on:click={onClick} class="bg-purple-300 text-gray-800 ml-1.5 p-1.5 rounded-md"
	>{text}</button
>
