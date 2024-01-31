<script lang="ts">
	import { entityChange, getCandidates } from '../stores/document';
	import type { Entity, Node, RelationAnnotationStatus } from '../types';
	import GenericTextView from './GenericTextView.svelte';
	import EntityEntity from './textView/EntityEntity.svelte';

	type DisplayEntity = Entity & { 
		textSnippet?: string
		windowSize?: number
	}

	let candidates = [] as DisplayEntity[];
	let activeNode = -1;
	export let data: { abstract: string; text: string; title: string; } | undefined = undefined;
	export let entities: Entity[] = [];


	let state: RelationAnnotationStatus = {
		headEntity: undefined,
		tailEntity: undefined,
		annotationState: 'none'
	};

	let preliminaryRelation: { head: number; tail: number } | undefined = undefined;

	entityChange.subscribe(() => {
		candidates = [];
	});

	function showEntityOptions(node: Node) {
		activeNode = node.id;
		candidates = getCandidates(node.id);
		for (let candidate of candidates) {
			let windewSize = Math.min(candidate.start, 20);
			candidate.textSnippet = data?.text.substring(candidate.start - windewSize, candidate.end + windewSize);
			candidate.windowSize = windewSize;
		}
	}


</script>

<main>
	<GenericTextView {data} {entities} on:loaded={() => {}}>
		<EntityEntity
			slot="entity"
			let:node
			let:desktop
			let:m
			{state}
			{desktop}
			candidates={activeNode == node.id ? candidates : []}
			entityNode={node}
			mouse={m}
			on:click={() => showEntityOptions(node)}
		></EntityEntity>
		
	</GenericTextView>
</main>
