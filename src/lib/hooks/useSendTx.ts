import type { ICallData, IEvent } from '@massalabs/massa-web3';
import { get, writable } from 'svelte/store';
import clientStore from '$lib/store/client';
import { toast } from '@zerodevx/svelte-toast';
import { EventDecoder } from '@dusalabs/sdk';
import { fetchEvents } from '$lib/services/datastore';
import { CHAIN_NAME, MASSA_CHAIN_ID } from '$lib/utils/config';

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

const useSendTx = () => {
	let massaClient = get(clientStore);
	clientStore.subscribe((client) => {
		if (client) massaClient = client;
	});

	const { subscribe, set, update } = writable(defaultState);

	const send = async (data: ICallData) => {
		console.log(data);
		update((state) => ({ ...state, pending: true }));
		try {
			if (!massaClient || !massaClient.wallet().getBaseAccount())
				throw new Error('Massa client is not initialized');

			const walletChainId = (await massaClient.publicApi().getNodeStatus()).chain_id;
			if (walletChainId !== MASSA_CHAIN_ID)
				throw new Error(`Invalid network. Please switch to ${CHAIN_NAME} in your wallet`);

			const txId = await massaClient.smartContracts().callSmartContract(data);
			update((state) => ({ ...state, txId }));

			const submitToast = toast.push('Tx pending...', {
				initial: 0
			});

			const { isError, events } = await fetchEvents(txId);

			const eventsMsg = events.map((event) => event.data);
			const errorMsg = isError ? EventDecoder.decodeError(eventsMsg[eventsMsg.length - 1]) : null;
			update((state) => ({ ...state, pending: false, events, error: errorMsg }));
			console.log(isError, eventsMsg);
			if (errorMsg) throw new Error(errorMsg);

			toast.pop(submitToast);
			toast.push('Tx confirmed!', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(72,187,120,0.9)',
					'--toastBarBackground': '#2F855A'
				}
			});
		} catch (error: any) {
			const errorMsg = EventDecoder.decodeError(error.message).split('"')[0];
			update((state) => ({ ...state, pending: false, error: errorMsg }));

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
		if (state.txId) console.log(state);
	});

	return {
		subscribe,
		send
	};
};

export default useSendTx;
