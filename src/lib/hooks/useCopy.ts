const useCopy = (text: string, delay = 500) => {
	let copied = false;
	console.log('useCopy', text);

	const copy = () => {
		console.log('copy');
		navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => (copied = false), delay);
	};

	return {
		copy,
		copied
	};
};

export default useCopy;
