<script lang="ts">
	import { onMount } from 'svelte';
	import { getEntitiesById, getTextById, MODE } from '../api';
	import { relations } from '../stores/relations';
	import type { Entity } from '../types';

	export let textId: string = '1';

	let text: { abstract: string; text: string; title: string } | undefined;
	let entities: Entity[] | undefined = [];

    $: relationsInText = $relations.filter(r => r.docId === Number.parseInt(textId));

	onMount(() => {
		fetchData(textId);
	});

	async function fetchData(textId: string) {
		if (textId) {
			text = await getTextById(textId, MODE);
			entities = await getEntitiesById(textId, MODE);
		}
	}

    function deleteRelation(relation: any) {
        relations.update(rels => rels.filter(r => r !== relation));
    }
</script>

<div class="review">
	{#each relationsInText as relation}
		<div class="relation-for-review">
            <div>
                <span class="head">{entities?.find(e => e.id === relation.head)?.candidate}</span>
                <span>{relation.type}</span>
                <span class="tail">{entities?.find(e => e.id === relation.tail)?.candidate}</span>
            </div>
            <div class="delete-button">
                <button class="btn btn-xs btn-ghost btn-danger" on:click={() => deleteRelation(relation)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>                 
                </button>
            </div>
		</div>
	{/each}
</div>

<style>
.review {
    margin-top: 50px;
    padding: 20px;
}

.relation-for-review {
    margin-bottom: 10px;
    border: 1px solid black;
    padding: 5px;
    display: grid;
    grid-template-columns: 1fr 80px;
}

.delete-button {
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

.head {
    color: var(--green);
    font-weight: bold;
}

.tail {
    color: var(--red);
    font-weight: bold;
}
</style>
