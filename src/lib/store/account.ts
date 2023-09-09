import type { IAccount } from '@massalabs/wallet-provider';
import { writable } from 'svelte/store';

const accountStore = writable<IAccount | null>(null);
export default accountStore;
