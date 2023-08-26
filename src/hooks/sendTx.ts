import type { ICallData, IClient } from '@massalabs/massa-web3';
import { writable } from 'svelte/store';
import { clientStore } from '../store/account';
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
	let massaClient: IClient | null = null;
	clientStore.subscribe((client) => {
		if (client) massaClient = client;
	});

	const { subscribe, set, update } = writable(defaultState);

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
			set({ pending: false, error: error.message, txId: null });
			throw error;
		}
	};

	return {
		subscribe,
		send
	};
}
