import type { ICallData, Client } from '@massalabs/massa-web3';
import { writable } from 'svelte/store';
import clientStore from '$lib/store/client';
import { toast } from '@zerodevx/svelte-toast';

type TState = {
	txId: string | null;
	pending: boolean;
	error: string | null;
};
const defaultState: TState = {
	txId: null,
	pending: false,
	error: null
};

export function sendTx() {
	let massaClient: Client | null = null;
	clientStore.subscribe((client) => {
		if (client) massaClient = client;
	});

	const { subscribe, set } = writable(defaultState);

	const send = async (callData: ICallData) => {
		set({ pending: true, error: null, txId: null });
		try {
			if (!massaClient) throw new Error('Massa client is not initialized');
			const txId = await massaClient.smartContracts().callSmartContract(callData);
			set({ pending: false, error: null, txId });

			toast.push('Tx submitted!', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(72,187,120,0.9)',
					'--toastBarBackground': '#2F855A'
				}
			});
			return txId;
		} catch (error: any) {
			const errorSplit = error.message.split('error: ');
			const errorMsg = errorSplit[errorSplit.length - 1].split(' at')[0];
			set({ pending: false, error: errorMsg, txId: null });

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

	return {
		subscribe,
		send
	};
}
