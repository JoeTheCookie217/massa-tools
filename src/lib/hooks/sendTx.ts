import { type ICallData, type IEvent, withTimeoutRejection } from '@massalabs/massa-web3';
import { get, writable } from 'svelte/store';
import clientStore from '$lib/store/client';
import { toast } from '@zerodevx/svelte-toast';
import { pollAsyncEvents } from '$lib/services/events';
import { EventDecoder } from '@dusalabs/sdk';

type TState = {
	txId: string | null;
	pending: boolean;
	error: string | null;
	events: IEvent[];
};
const defaultState: TState = {
	txId: null,
	pending: false,
	error: null,
	events: []
};

export function sendTx() {
	let massaClient = get(clientStore);
	clientStore.subscribe((client) => {
		if (client) massaClient = client;
	});

	const { subscribe, set, update } = writable(defaultState);

	const send = async (data: ICallData) => {
		update((state) => ({ ...state, pending: true }));
		try {
			if (!massaClient || !massaClient.wallet().getBaseAccount())
				throw new Error('Massa client is not initialized');

			const txId = await massaClient.smartContracts().callSmartContract(data);
			update((state) => ({ ...state, txId }));

			const submitToast = toast.push('Tx pending...', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(72,187,120,0.9)',
					'--toastBarBackground': '#2F855A'
				},
				initial: 0
			});

			const { isError, eventPoller, events } = await withTimeoutRejection(
				pollAsyncEvents(massaClient, txId),
				45_000
			);
			eventPoller.stopPolling();

			const eventsMsg = events.map((event) => event.data);
			console.log(isError, eventsMsg);
			if (isError) throw new Error(eventsMsg[eventsMsg.length - 1]);
			toast.pop(submitToast);
			toast.push('Tx confirmed!', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(72,187,120,0.9)',
					'--toastBarBackground': '#2F855A'
				}
			});
		} catch (error: any) {
			const errorMsg = EventDecoder.decodeError(error.message);
			update((state) => ({ ...state, error: errorMsg }));

			toast.pop();
			toast.push(errorMsg, {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgb(180, 80, 75)',
					'--toastBarBackground': '#FF4136'
				}
			});
			throw error;
		}
	};

	subscribe((state) => {
		console.log(state);
	});

	return {
		subscribe,
		send
	};
}
