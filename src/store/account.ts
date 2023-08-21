import type { IClient } from '@massalabs/massa-web3';
import type { IAccount } from '@massalabs/wallet-provider';
import { writable } from 'svelte/store';

export const accountStore = writable<IAccount | null>(null);
export const clientStore = writable<IClient | null>(null);
