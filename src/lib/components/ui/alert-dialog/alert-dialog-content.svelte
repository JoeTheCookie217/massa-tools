<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
	import * as AlertDialog from '.';
	import { cn, flyAndScale } from '$lib/utils';
	import { X } from 'lucide-svelte';

	type $$Props = AlertDialogPrimitive.ContentProps;

	export let transition: $$Props['transition'] = flyAndScale;
	export let transitionConfig: $$Props['transitionConfig'] = undefined;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<AlertDialog.Portal>
	<AlertDialog.Overlay />
	<AlertDialogPrimitive.Content
		{transition}
		{transitionConfig}
		class={cn(
			'fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg sm:rounded-lg md:w-full',
			className
		)}
		{...$$restProps}
	>
		<slot />
		<AlertDialogPrimitive.Cancel
			class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
		>
			<X class="h-4 w-4" />
			<span class="sr-only">Close</span>
		</AlertDialogPrimitive.Cancel>
	</AlertDialogPrimitive.Content>
</AlertDialog.Portal>
