import {
	EventPoller,
	type IEvent,
	type Client,
	type IEventFilter,
	ON_MASSA_EVENT_DATA,
	ON_MASSA_EVENT_ERROR
} from '@massalabs/massa-web3';

interface IEventPollerResult {
	isError: boolean;
	eventPoller: EventPoller;
	events: IEvent[];
}

const MASSA_EXEC_ERROR = 'massa_execution_error';

export const pollAsyncEvents = async (
	web3Client: Client,
	opId: string
): Promise<IEventPollerResult> => {
	const eventsFilter: IEventFilter = {
		start: null,
		end: null,
		original_caller_address: null,
		original_operation_id: opId,
		emitter_address: null,
		is_final: null
	};

	const eventPoller = EventPoller.startEventsPolling(eventsFilter, 1000, web3Client);

	return new Promise((resolve, reject) => {
		eventPoller.on(ON_MASSA_EVENT_DATA, (events: Array<IEvent>) => {
			const errorEvents: IEvent[] = events.filter((e) => e.data.includes(MASSA_EXEC_ERROR));
			if (errorEvents.length > 0) {
				return resolve({
					isError: true,
					eventPoller,
					events: errorEvents
				});
			}

			if (events.length > 0) {
				return resolve({
					isError: false,
					eventPoller,
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
