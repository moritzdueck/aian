
<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
    import type { Node, RelationAnnotationStatus } from '../../types';
	import { tool } from '../../stores/toolbar';
	import { semanticTypes, relationTypes } from '../../stores/relations';

    export let entityNode: Node;
    export let state: RelationAnnotationStatus;

    export let desktop = false;
	export let mouse = { x: 0, y: 0 };

	$: {
		if(showConnection()){
			handleMousemove(mouse);
		}
	}

    let hovered = false;

    let line: SVGElement | undefined = undefined;
    let lineSettings = {
		left: 0,
		top: 0,
		width: 0,
		height: 0,
		x1: 0,
		y1: 0,
		x2: 0,
		y2: 0
	};

    const dispatch = createEventDispatcher();

    function showConnection() {		
        return (state.headEntity?.id == entityNode?.id) && !state.tailEntity;
    }


    function handleMousemove(m: { x: number; y: number }) {

		const spanX = line?.parentElement?.getBoundingClientRect().left;
		const spanY = line?.parentElement?.getBoundingClientRect().top;

		const spanWidth = line?.parentElement?.getBoundingClientRect().width;
		const spanHeight = line?.parentElement?.getBoundingClientRect().height;

		const lineX = line?.getBoundingClientRect().left;
		const lineY = line?.getBoundingClientRect().top;

		if (!(spanX && spanY && spanWidth && spanHeight && lineX && lineY)) {
			return;
		}

		let spanCenterX = spanX + spanWidth / 2;
		let spanCenterY = spanY + spanHeight / 2;

		lineSettings.width = Math.abs(m.x - spanCenterX);
		lineSettings.height = Math.abs(m.y - spanCenterY);

		if (m.x >= spanCenterX && m.y >= spanCenterY) {
			//  o
			//    m
			lineSettings.left = spanWidth / 2;
			lineSettings.top = spanHeight / 2;

			lineSettings.x1 = 0;
			lineSettings.y1 = 0;

			lineSettings.x2 = lineSettings.width;
			lineSettings.y2 = lineSettings.height;
		} else if (m.x >= spanCenterX && m.y <= spanCenterY) {
			//    m
			//  o
			lineSettings.left = spanWidth / 2;
			lineSettings.top = -lineSettings.height + spanHeight / 2;

			lineSettings.x1 = 0;
			lineSettings.y1 = lineSettings.height;

			lineSettings.x2 = lineSettings.width;
			lineSettings.y2 = 0;
		} else if (m.x <= spanCenterX && m.y <= spanCenterY) {
			//  m
			//    o
			lineSettings.left = -lineSettings.width + spanWidth / 2;
			lineSettings.top = -lineSettings.height + spanHeight / 2;

			lineSettings.x1 = 0;
			lineSettings.y1 = 0;

			lineSettings.x2 = lineSettings.width;
			lineSettings.y2 = lineSettings.height;
		} else {
			//    o
			//  m
			lineSettings.left = -lineSettings.width + spanWidth / 2;
			lineSettings.top = spanHeight / 2;

			lineSettings.x1 = 0;
			lineSettings.y1 = lineSettings.height;

			lineSettings.x2 = lineSettings.width;
			lineSettings.y2 = 0;
		}
	}

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<span
	class="entity"
	class:selected={state.headEntity == entityNode || state.tailEntity == entityNode}
	role="button"
	tabindex="0"
	id="ent-{entityNode.id}"
	on:mouseenter={() => (desktop ? (hovered = true) : null)}
	on:mouseleave={() => (desktop ? (hovered = false) : null)}
	on:click|self={() => dispatch('click')}
>
	{entityNode.text}

	{#if hovered && !showConnection() && !($tool === 'delete')}
		<div class="entity-details">
			<p class="font-bold text-xs">{entityNode.cui}</p>
			<p class="m-2">{semanticTypes[entityNode.semtype].name}</p>
		</div>
	{/if}

	{#if state.annotationState === 'type' && state.tailEntity === entityNode}
		{#if desktop}
			<div class="card card-compact w-64 bg-base-100 shadow-xl relation-type-select">
				<div class="card-body">
					<p class="font-bold">Select the relation type</p>

					<div class="join join-vertical relation-type-options">
						{#each $relationTypes as relationType}
							<button
								on:click={() => dispatch('relationTypeSelect', {type: relationType.key})}
								class="btn btn-sm join-item">{relationType.name}</button
							>
						{/each}
					</div>
				</div>

				<button on:click={() => dispatch('abort')} class="btn join-item">Cancel</button>
			</div>
		{:else}
			<div class="card card-compact bg-base-100 shadow-xl relation-type-select-mobile">
				<div class="card-body">
					<p class="font-bold">Select the relation type</p>

					<div class="join join-vertical relation-type-options">
						{#each $relationTypes as relationType}
							<button
								on:click={() => dispatch('relationTypeSelect', {type: relationType.key})}
								class="btn btn-sm join-item active:bg-gray-900/20">{relationType.name}</button
							>
						{/each}
					</div>
				</div>

				<button on:click={() => dispatch('abort')} class="btn join-item">Cancel</button>
			</div>
		{/if}
	{/if}

	{#if desktop && (state.headEntity?.id == entityNode?.id) && !state.tailEntity }
		<svg
			bind:this={line}
			class="connection"
			style="left: {lineSettings.left - 10}px; top: {lineSettings.top - 10}px;"
			width="{lineSettings.width + 20}px"
			height="{lineSettings.height + 20}px"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g transform="translate(10,10)">
				<circle cx={lineSettings.x1} cy={lineSettings.y1} r="10" fill="var(--light-grey)" />
				<circle cx={lineSettings.x2} cy={lineSettings.y2} r="10" fill="var(--light-grey)" />
				<line
					x1={lineSettings.x1}
					y1={lineSettings.y1}
					x2={lineSettings.x2}
					y2={lineSettings.y2}
					class="relationStroke"
				/>
			</g>
		</svg>
	{/if}
</span>

<style>
	span.entity {
		padding: 1px;
		cursor: pointer;
		user-select: none;
		position: relative;
		display: inline-block;
		outline: 1px solid var(--light-grey);
	}

	span.entity.selected {
		background-color: var(--primary-color);
		outline: 1px solid #00000000;
		border-radius: 5px;
		color: white;
	}

	.entity:hover {
		position: relative;
	}

	.entity-details {
		user-select: text;
		position: absolute;
		background-color: white;
		z-index: 1;
		border: 1px solid var(--light-grey);
		padding: 0.5rem;
	}

	.connection {
		position: absolute;
		user-select: none;
		z-index: -1;
	}

	.relationStroke {
		stroke: var(--primary-color);
		stroke-width: 4px;
	}

	.relation-type-select {
		color: black;
		position: fixed;
		left: calc((100vw - 806px) / 2);
		top: calc(20%);
		z-index: 2;
	}

	.relation-type-select-mobile {
		color: black;
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100vw;
		z-index: 2;
		max-height: calc(100vh - 50px);
		overflow: auto;
	}

	.relation-type-options {
		max-height: 300px;
		overflow: auto;
	}
</style>