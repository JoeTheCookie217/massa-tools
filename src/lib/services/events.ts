import {
	EventPoller,
	type IEvent,
	type Client,
	type IEventFilter,
	ON_MASSA_EVENT_DATA,
	ON_MASSA_EVENT_ERROR
} from '@massalabs/massa-web3';

export interface IEventPollerResult {
	isError: boolean;
	events: IEvent[];
}

const MASSA_EXEC_ERROR = 'massa_execution_error';
export const eventsFilter: Omit<IEventFilter, 'original_operation_id'> = {
	start: null,
	end: null,
	original_caller_address: null,
	emitter_address: null,
	is_final: null
};
export const pollAsyncEvents = async (eventPoller: EventPoller): Promise<IEventPollerResult> => {
	return new Promise((resolve, reject) => {
		eventPoller.on(ON_MASSA_EVENT_DATA, (events: Array<IEvent>) => {
			const errorEvents = events.filter((e) => e.data.includes(MASSA_EXEC_ERROR));
			if (errorEvents.length > 0) {
				return resolve({
					isError: true,
					events
				});
			}

			if (events.length > 0) {
				return resolve({
					isError: false,
					events
				});
			} else {
				console.log('No events have been emitted during deployment');
			}
		});
		eventPoller.on(ON_MASSA_EVENT_ERROR, (error: Error) => {
			console.log('Event Data Error:', error);
			return reject(error);
		});
	});
};
