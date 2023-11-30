import { writable } from "svelte/store";

export let tool = writable('add' as  'add' | 'delete');