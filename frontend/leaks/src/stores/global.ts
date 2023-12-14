import { writable } from "svelte/store";

export let textId = writable('' as string);
export let page = writable(0 as number);