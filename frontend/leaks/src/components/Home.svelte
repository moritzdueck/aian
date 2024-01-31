<script lang="ts">
	import '../app.css';
	import Toolbar from '../components/Toolbar.svelte';
	import { textId, page, mode } from '../stores/global';
	import MediaQuery from './MediaQuery.svelte';
	import Relations from './Relations.svelte';
	import Results from './Results.svelte';
	import Review from './Review.svelte';
	import TextsOverview from './TextsOverview.svelte';
	import RelationView from './RelationView.svelte';
	import EntitiesView from './EntitiesView.svelte';
	import { MODE, getEntitiesById, getTextById } from '../api';
	import type { Entity } from '../types';
	import { entityChange, readEntities, setInitial } from '../stores/document';
	import SectionChart from './SectionChart.svelte';

	export const prerender = true;

	let container;
	let data: { abstract: string; text: string; title: string; } | undefined = undefined;
	let activeEntities = [] as Entity[];
	let allEntities = [] as Entity[];

	textId.subscribe((id) => load(id));


	async function load(id: string){
		if(id){
			data = await getTextById(id, MODE);
			const entities = await getEntitiesById(id, MODE);

			if (entities){
				allEntities = entities;
				setInitial(entities);
				activeEntities = readEntities();
			}
			return false;
		}
	}

	entityChange.subscribe(() => {
		activeEntities = [...readEntities()];
	});

</script>

<main>
	<MediaQuery query="(min-width: 1024px)" let:matches>
		<div class="toolbar"><Toolbar showRelationSettings="{!matches}" /></div>
		{#if $page === 0}
			<TextsOverview />
		{/if}

		{#if $page === 1}
			<div class="mt-[50px]">
				<Results />
			</div>
		{/if}

		{#if $page === 2}
			{#if matches}
				<div class="split-view">
					<div class="text-annotation" bind:this={container}>
						{#if $mode === 'relation'}
							<RelationView textId={$textId} {data} entities={activeEntities} />
						{:else if $mode === 'entity'}
							<EntitiesView {data} entities={activeEntities} />
						{/if}
					</div>
					<div class="relations">
						<Relations textId={$textId} />
					</div>
				</div>
			{:else}
				<div class="text-annotation" bind:this={container}>
					{#if $mode === 'relation'}
							<RelationView textId={$textId} {data} entities={activeEntities} />
					{:else if $mode === 'entity'}
						<EntitiesView  {data} entities={activeEntities} />
					{/if}
				</div>
			{/if}
		{/if}

		{#if $page === 3}
			<Relations textId={$textId} />
		{/if}


		{#if $page === 4}
			<Review textId={$textId} text={data} entities={allEntities}/>
		{/if}

		{#if $page === 5}
			<div class="mt-[50px]">
				<SectionChart/>
			</div>
		{/if}
	</MediaQuery>
</main>

<style>
	.toolbar {
		position: fixed;
		width: 100%;
		z-index: 3;
		top: 0;
		height: 50px;
	}

	.split-view {
		display: grid;
		grid-template-columns: 1fr 550px;
	}

	@media (max-width: 1024px) {
		.split-view {
			grid-template-columns: 1fr 0px;
		}

		.relations {
			display: none;
		}
	}

	.relations {
		width: 550px;
		position: fixed;
		top: 50px;
		height: calc(100vh - 50px);
		right: 0;
		background-color: var(--surface2);
		overflow: auto;
		overflow-y: scroll !important;
		-webkit-overflow-scrolling: touch;
		max-height: calc(100vh-50px);
	}

	.text-annotation {
		position: relative;
		top: 50px;
		max-height: 100vh;
	}
</style>
