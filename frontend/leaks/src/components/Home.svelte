<script>
	import '../app.css';
	import Toolbar from '../components/Toolbar.svelte';
	import { textId, page } from '../stores/global';
	import MediaQuery from './MediaQuery.svelte';
	import Relations from './Relations.svelte';
	import Results from './Results.svelte';
	import Review from './Review.svelte';
	import TextView from './TextView.svelte';
	import TextsOverview from './TextsOverview.svelte';

	export const prerender = true;

	$: showTools = $page === 2;
	let container;
</script>

<main>
	<MediaQuery query="(min-width: 1024px)" let:matches>
		<div class="toolbar"><Toolbar showTools="{showTools}" showRelationSettings="{!matches}" /></div>
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
						<TextView textId={$textId} {container} />
					</div>
					<div class="relations">
						<Relations textId={$textId} />
					</div>
				</div>
			{:else}
				<div class="text-annotation" bind:this={container}>
					<TextView textId={$textId} />
				</div>
			{/if}
		{/if}

		{#if $page === 3}
			<Relations textId={$textId} />
		{/if}


		{#if $page === 4}
			<Review textId={$textId}/>
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
