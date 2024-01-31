<script lang="ts">
	import { relations } from '../stores/relations';
	import type { Entity } from '../types';
    import {onMount} from "svelte";

	export let textId: string = '1';
	export let text: { abstract: string; text: string; title: string } | undefined;
	export let entities: Entity[] | undefined = [];

    let showDetails: boolean[] = [];

    let relationsInText: any[] = [];

    onMount(() => {
        relations.subscribe(rels => {

            relationsInText  = rels.filter(r => r.docId === Number.parseInt(textId))
                .map(r => ({
                    headEntity: entities?.find(e => e.id === r.head),
                    tailEntity: entities?.find(e => e.id === r.tail),
                    type: r.type,
                    rel: r,
                }))
                .map(r => ({
                    sections: r.headEntity.start < r.tailEntity.start
                        ? [r.headEntity.start -100, r.headEntity.start, r.headEntity.end, r.tailEntity.start, r.tailEntity.end, r.tailEntity.end + 100]
                        : [r.tailEntity.start -100, r.tailEntity.start, r.tailEntity.end, r.headEntity.start, r.headEntity.end, r.headEntity.end + 100],
                    head: text?.text.substring(r.headEntity.start, r.headEntity.end),
                    tail: text?.text.substring(r.tailEntity.start, r.tailEntity.end),
                    type: r.type,
                    rel: r.rel,
                }))
        })
    })

    function deleteRelation(relation: any) {
        relations.update(rels => rels.filter(r => r !== relation));
    }
</script>

<div class="review">
	{#each relationsInText as relation, index}
		<div class="relation-for-review">
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div on:click={() => showDetails = true}>
                <span class="head">{relation.head}</span>
                <span>{relation.type}</span>
                <span class="tail">{relation.tail}</span>
            </div>
            <div class="delete-button">
                <button class="btn btn-xs btn-ghost btn-danger" on:click={() => deleteRelation(relation.rel)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>                 
                </button>
            </div>

            {#if showDetails}
                <div class="border-top">
                    <span>...{text?.text.substring(relation.sections[0], relation.sections[1])}</span>
                    <span class="entity">{text?.text.substring(relation.sections[1], relation.sections[2])}</span>
                    <span>{text?.text.substring(relation.sections[2], relation.sections[3])}</span>
                    <span class="entity">{text?.text.substring(relation.sections[3], relation.sections[4])}</span>
                    <span>{text?.text.substring(relation.sections[4], relation.sections[5])}...</span>
                </div>
            {/if}
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
    border: 1px solid var(--light-grey);
    padding: 5px;
    display: grid;
    grid-template-columns: 1fr 80px;
}

.delete-button {
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

.head, .tail, .entity {
    color: var(--primary-color);
    font-weight: bold;
}


.border-top {
    border-top: 1px solid var(--light-grey);
    padding-top: 10px;
    margin-top: 10px;
}
</style>
