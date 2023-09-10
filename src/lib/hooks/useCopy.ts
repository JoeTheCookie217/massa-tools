import { writable } from 'svelte/store';

const useCopy = (delay = 1000) => {
	const copied = writable(false);

	const copy = async (text: string) => {
		await navigator.clipboard.writeText(text);
		copied.set(true);

		setTimeout(() => copied.set(false), delay);
	};

	return {
		copy,
		copied
	};
};

export default useCopy;
