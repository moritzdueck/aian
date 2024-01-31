<script lang="ts">
	import type { Entity, Node } from '../types';
	import MediaQuery from './MediaQuery.svelte';

	export let data: { abstract: string; text: string; title: string } | undefined = undefined;
	export let entities: Entity[] = [];
	let texts = [{ start: 0, text: '' }];
	let nodes: Node[] = [];
	let m = { x: 0, y: 0 };

	function handleMousemove(event: MouseEvent) {
		m.x = event.clientX;
		m.y = event.clientY;
	}

	function addEntityInText(
		texts: { start: number; text: string }[],
		nodes: any[],
		entity: Entity
	): { texts: { start: number; text: string }[]; nodes: any[] } {
		const chunk = texts.find(
			({ start, text }) => entity.start >= start && entity.end <= start + text.length
		);

		if (!chunk) {
			return { texts: texts, nodes: nodes };
		}

		const { start, text } = chunk;
		const before = text.slice(0, entity.start - start);
		const entityText = text.slice(entity.start - start, entity.end - start);
		const after = text.slice(entity.end - start);

		const node = {
			id: entity.id,
			start: entity.start,
			end: entity.end,
			score: entity.score,
			text: entityText,
			cui: entity.cui,
			semtype: entity.semtype
		};

		nodes.push(node);

		return {
			texts: [
				...texts.filter(({ start: tStart, text }) => tStart < start),
				{ start: start, text: before },
				{ start: entity.end, text: after },
				...texts.filter(({ start: tStart, text }) => tStart > start)
			],
			nodes: nodes
		};
	}


	$ : {

		let text = (data as any)?.text || '';
		text = text.replace(/[^\x00-\x7F]/g, '');
		texts = [{ start: 0, text: text }];

		nodes = [];

		entities.forEach((entity) => {
			const result = addEntityInText(texts, nodes, entity);
			texts = result.texts;
			nodes = result.nodes;
		});
	}

</script>

<MediaQuery query="(min-width: 1024px)" let:matches>
	<main on:mousemove={handleMousemove}>
		{#if data}
			<div class="flex align-items-center justify-center">
				<div class="text-container" id="annotations-container">
					<h1 class="font-bold my-4 text-xl">{data.title}</h1>
					{#each texts as { start, text }, index}
						<span>{text}</span>
						{#if index < texts.length - 1}
							<slot name="entity" node={nodes[index]} desktop={matches} {m} />
						{/if}
					{/each}
				</div>
			</div>
		{:else}
			<p>No text loaded yet...</p>
		{/if}
	</main>
</MediaQuery>

<style>
	.text-container {
		padding: 50px;
		max-width: 1000px;
	}

	@media (max-width: 1024px) {
		.text-container {
			padding: 25px;
		}
	}
</style>
