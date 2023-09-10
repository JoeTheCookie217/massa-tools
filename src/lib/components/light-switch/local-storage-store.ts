// Source: https://github.com/joshnuss/svelte-local-storage-store
// https://github.com/joshnuss/svelte-local-storage-store/blob/master/index.ts
// Represents version v0.4.0 (2023-01-18)
import type { Writable } from 'svelte/store';
import { BROWSER } from 'esm-env';
import { get, writable as internal } from 'svelte/store';

declare type Updater<T> = (value: T) => T;
declare type StoreDict<T> = { [key: string]: Writable<T> };

/* eslint-disable @typescript-eslint/no-explicit-any */
const stores: StoreDict<any> = {};

export function localStorageStore<T>(key: string, initialValue: T): Writable<T> {
	function updateStorage(key: string, value: T) {
		if (!BROWSER) return;

		localStorage.setItem(key, JSON.stringify(value));
	}

	if (!stores[key]) {
		const store = internal(initialValue, (set) => {
			const json = BROWSER ? localStorage.getItem(key) : null;

			if (json) {
				set(<T>JSON.parse(json));
			}

			if (BROWSER) {
				const handleStorage = (event: StorageEvent) => {
					if (event.key === key) set(event.newValue ? JSON.parse(event.newValue) : null);
				};

				window.addEventListener('storage', handleStorage);

				return () => window.removeEventListener('storage', handleStorage);
			}
		});

		const { subscribe, set } = store;

		stores[key] = {
			set(value: T) {
				updateStorage(key, value);
				set(value);
			},
			update(updater: Updater<T>) {
				const value = updater(get(store));

				updateStorage(key, value);
				set(value);
			},
			subscribe
		};
	}

	return stores[key];
}
