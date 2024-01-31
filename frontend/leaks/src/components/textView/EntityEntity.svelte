
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
    import type { Entity, Node, RelationAnnotationStatus } from '../../types';
	import { semanticTypes } from '../../stores/relations';
	import { updateEntity } from '../../stores/document';
    export let entityNode: Node;
    export let state: RelationAnnotationStatus;

    export let desktop = false;
	export let mouse = { x: 0, y: 0 };

	type DisplayEntity = Entity & { 
		textSnippet?: string
		windowSize?: number
	}
	export let candidates = [] as DisplayEntity[];

    let hovered = false;
    const dispatch = createEventDispatcher();

	function getColor(score: number){
		const x =  (-score / 1000)

		// create color based on score
		// high scores should be green, low scores should be red, but keep the lightness in hsl
		const hue =  x * 120;
		const saturation = 100;
		const lightness = 80;

		return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
	}

	function candidateClick(node: Node, entity: Entity){
		updateEntity(node, entity);
	}

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<span
	class="entity"
	class:selected={state.headEntity == entityNode || state.tailEntity == entityNode}
	style="outline: 2px solid {getColor(entityNode.score)};"
	role="button"
	tabindex="0"
	id="ent-{entityNode.id}"
	on:mouseenter={() => (desktop ? (hovered = true) : null)}
	on:mouseleave={() => (desktop ? (hovered = false) : null)}
	on:click|self={() => dispatch('click')}
>
	<!-- <div class="flex flex-col justify-end items-center"> -->
		<!-- <div class="entity-type-in-text">{semanticTypes[entityNode.semtype].name}</div> -->
		{entityNode.text}
	<!-- </div> -->

	{#if candidates.length > 0}
		<div class="choose-entity-candidate">
			<p class="my-3 font-bold text-center">Choose entity candidate</p>
			{#each candidates as candidate}
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div class="candidate" style="background-color: {getColor(candidate.score)};" on:click={() => candidateClick(entityNode, candidate)}> 
					<div class=" ml-1 grow w-full">
						<span class="meta-comments">
							{semanticTypes[candidate.semtype].name}
						</span>
						<div class="text-context">
							<span class="context"> ...{candidate.textSnippet?.substring(0,candidate.windowSize)} </span>
							<span class="font-bold"> {candidate.textSnippet?.substring(candidate.windowSize ?? 0, candidate.textSnippet.length - (candidate.windowSize ?? 0))} </span>
							<span class="context"> {candidate.textSnippet?.substring(candidate.textSnippet.length - (candidate.windowSize ?? 0) ,candidate.textSnippet.length)}... </span>
						</div>
					</div>
					{#if candidate.id === entityNode.id}
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
					  </svg>
					{/if}
				</div>
				
			{/each}
		</div>
	{/if}
</span>

<style>
	span.entity {
		padding: 1px;
		cursor: pointer;
		position: relative;
		display: inline-block;
		outline: 1px solid var(--light-grey);
	}

	span.entity.selected {
		background-color: var(--primary-color);
		outline: none;
		border-radius: 5px;
		color: white;
	}

	.entity:hover {
		outline: 1px solid var(--primary-color);
	}

	.choose-entity-candidate {
		left: 0;
		bottom: 0;
		position: fixed;
		width: 100%;
		background-color: white;
		border: 1px solid var(--light-grey);
		border-radius: 5px;
		padding: 0 15px;
		z-index: 100;
		max-height: 50vh;
		overflow: auto;
	}

	.candidate {
		display: flex;
		background-color: white;
		padding: 5px;
		margin: 5px;
		border-radius: 5px;
		justify-content: space-between;
		font-size: small;
		font-family: monospace;
	}

	.text-context {
		/* text-wrap: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: calc(100% - 10px); */
	}

	.context {
		color: #999;
	}

	.meta-comments {
		font-size: x-small;
	}

	.entity-type-in-text {
		font-size: x-small;
		color: var(--primary-color);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

</style>