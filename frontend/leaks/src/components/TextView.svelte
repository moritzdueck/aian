<script lang="ts">
	import { onMount } from 'svelte';
	import { relationTypes, semanticTypes, relations, type SemanticType } from '../stores/relations';
	import { tool } from '../stores/toolbar';

	export let textId: string = '1';
	export let container: HTMLElement | undefined = undefined;

	let data: { abstract: string; text: string; title: string } | undefined = undefined;

	let entities: Entity[] = [];
	let texts = [{ start: 0, text: '' }];
	let nodes: Node[] = [];

	let preliminaryRelation: { head: number; tail: number } | undefined = undefined;

	let activeIndex = -1;

	let headEntity: Node | undefined = undefined;
	let tailEntity: Node | undefined = undefined;
	let showConnection = false;
	let annotationState: 'head' | 'tail' | 'type' = 'head';

	let line: SVGElement | undefined = undefined;

	let m = { x: 0, y: 0 };
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

	interface Entity {
		id: number;
		candidate: string;
		cui: string;
		start: number;
		end: number;
		score: number;
		semtype: string;
		text_id: number;
	}

	interface Node {
		id: number;
		start: number;
		end: number;
		text: string;
		cui: string;
		semtype: SemanticType;
	}

	function onEntityClick(index: number) {
		return () => {
			if ($tool === 'add') {
				onEntityAnnotation(index)();
			}
		};
	}

	function redoRelations() {
		let container = document.getElementById('annotations-container');

		if (container) {
			container.querySelectorAll('.existing-connection').forEach((el) => el.remove());
			const svg = createRelationSvg();
			for (let relation of $relations) {
				addRelationInDom(svg, relation.head, relation.tail);
			}
			if (preliminaryRelation)
				addRelationInDom(
					svg,
					preliminaryRelation.head,
					preliminaryRelation.tail,
					'var(--primary-color)'
				);
		}
	}

	function createRelationSvg() {
		let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', '100%');
		svg.setAttribute('height', '100%');
		svg.style.width = '100%';
		svg.style.height = '100%';
		svg.style.position = 'absolute';
		svg.style.top = (container!.scrollTop - 50).toString() + 'px';
		svg.style.left = '0';
		svg.style.zIndex = $tool === 'delete' ? '1' : '-1';
		svg.classList.add('existing-connection');

		return svg;
	}

	function addRelationInDom(
		svg: SVGElement,
		entityId1: number,
		entityId2: number,
		color: string = 'var(--light-gray)'
	) {
		let node1 = document.getElementById('ent-' + entityId1);
		let node2 = document.getElementById('ent-' + entityId2);

		let container = document.getElementById('annotations-container');

		if (node1 && node2 && container) {
			let rect1 = node1.getBoundingClientRect();
			let rect2 = node2.getBoundingClientRect();

			let rect1CenterX = rect1.left + rect1.width / 2;
			let rect1CenterY = rect1.top + rect1.height / 2;

			let rect2CenterX = rect2.left + rect2.width / 2;
			let rect2CenterY = rect2.top + rect2.height / 2;

			let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

			let circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			circle1.setAttribute('cx', rect1CenterX.toString());
			circle1.setAttribute('cy', rect1CenterY.toString());
			circle1.setAttribute('r', '10');
			circle1.setAttribute('fill', color);

			let circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			circle2.setAttribute('cx', rect2CenterX.toString());
			circle2.setAttribute('cy', rect2CenterY.toString());
			circle2.setAttribute('r', '10');
			circle2.setAttribute('fill', color);

			let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			line.setAttribute('x1', rect1CenterX.toString());
			line.setAttribute('y1', rect1CenterY.toString());
			line.setAttribute('x2', rect2CenterX.toString());
			line.setAttribute('y2', rect2CenterY.toString());
			line.setAttribute('stroke', color);
			line.setAttribute('stroke-width', '4');

			g.appendChild(line);

			if ($tool === 'delete') {
				console.log('adding delete area');

				let deleteArea = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				deleteArea.setAttribute('x1', rect1CenterX.toString());
				deleteArea.setAttribute('y1', rect1CenterY.toString());
				deleteArea.setAttribute('x2', rect2CenterX.toString());
				deleteArea.setAttribute('y2', rect2CenterY.toString());
				deleteArea.setAttribute('stroke', '#ff8787');
				deleteArea.setAttribute('stroke-width', '10');
				deleteArea.style.zIndex = '3';
				deleteArea.style.cursor = 'pointer';

				deleteArea.addEventListener('click', () => {
					$relations = $relations.filter(
						(relation) => !(relation.head === entityId1 && relation.tail === entityId2)
					);
					redoRelations();
				});

				g.append(deleteArea);
			}

			g.appendChild(circle1);
			g.appendChild(circle2);

			svg.appendChild(g);

			container.prepend(svg);
		}
	}

	function handleMousemove(event: MouseEvent) {
		m.x = event.clientX;
		m.y = event.clientY;

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

	function onEntityAnnotation(index: number) {
		return () => {
			if (headEntity === undefined) {
				headEntity = nodes[index];
				showConnection = true;
				annotationState = 'tail';
			} else if (tailEntity === undefined) {
				tailEntity = nodes[index];
				annotationState = 'type';

				showConnection = false;
				preliminaryRelation = { head: headEntity.id, tail: tailEntity.id };

				redoRelations();

				lineSettings.width = 0;
				lineSettings.height = 0;
			}
		};
	}

	function onAnnotationTypeSelect(type: string) {
		if (headEntity && tailEntity) {
			annotationState = 'head';
			$relations = [
				...$relations,
				{ head: headEntity.id, tail: tailEntity.id, type: type, docId: parseInt(textId) }
			];
			preliminaryRelation = undefined;
			redoRelations();

			headEntity = undefined;
			tailEntity = undefined;
			showConnection = false;
		}
	}

	function abortAnnotation() {
		annotationState = 'head';
		preliminaryRelation = undefined;
		headEntity = undefined;
		tailEntity = undefined;
		showConnection = false;
		redoRelations();
	}

	async function fetchData(textId: string) {
		if (textId) {
			const response = await fetch('http://127.0.0.1:5003/texts/' + textId);
			data = await response.json();

			const entitiesResponse = await fetch('http://127.0.0.1:5003/entities/' + textId);
			entities = await entitiesResponse.json();
			entities.sort((a, b) => (a.start > b.start ? 1 : -1));

			console.log(entities.length);
			// iterate over all entities, take the start position and the end position and only add it if the next start position is bigger than the end position
			entities = entities.filter(
				(entity, index) => !entities[index + 1] || entities[index + 1].start > entity.end
			);

			console.log(entities.length);
			
			

			let text = (data?.text || '');

			// replace non-ascci characters
			text = text.replace(/[^\x00-\x7F]/g, '');

			texts = [{ start: 0, text: text }];

			entities.forEach((entity) => {
				const result = addEntityInText(texts, nodes, entity);
				texts = result.texts;
				nodes = result.nodes;
			});
		}

		setTimeout(redoRelations, 1000);
	}

	onMount(() => {
		fetchData(textId);

		setTimeout(() => {
			console.log(container);
			window.addEventListener('resize', redoRelations);
			container!.addEventListener('scroll', redoRelations);
			tool.subscribe((tool) => {
				redoRelations();
			});
		}, 1000);
	});
</script>

<main on:mousemove={handleMousemove}>
	{#if data}
		<div class="flex align-items-center justify-center">
			<div class="text-container" id="annotations-container">
				<h1 class="font-bold my-4 text-xl">{data.title}</h1>
				{#each texts as { start, text }, index}
					<span>{text}</span>
					{#if index < texts.length - 1}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<span
							class="entity"
							role="button"
							tabindex="0"
							id="ent-{nodes[index].id}"
							on:mouseenter={() => (activeIndex = index)}
							on:mouseleave={() => (activeIndex = -1)}
							on:click|self={onEntityClick(index)}
							>{nodes[index].text}

							{#if activeIndex === index && !showConnection && !($tool === 'delete')}
								<div class="entity-details">
									<p class="font-bold text-xs">{nodes[index].cui}</p>
									<p class="m-2">{semanticTypes[nodes[index].semtype].name}</p>
								</div>
							{/if}

							{#if annotationState === 'type' && tailEntity === nodes[index]}'
								<div class="card card-compact w-64 bg-base-100 shadow-xl relation-type-select">
									<div class="card-body">
										<p class="font-bold">Select the relation type</p>

										<div class="join join-vertical relation-type-options">
											{#each $relationTypes as relationType}
												<button
													on:click={() => onAnnotationTypeSelect(relationType.key)}
													class="btn btn-sm btn-ghost join-item">{relationType.name}</button
												>
											{/each}
										</div>
									</div>

									<button on:click={() => abortAnnotation()} class="btn join-item">Cancel</button>
								</div>
							{/if}

							{#if headEntity == nodes[index] && showConnection}
								<svg
									bind:this={line}
									class="connection"
									style="left: {lineSettings.left - 10}px; top: {lineSettings.top - 10}px;"
									width="{lineSettings.width + 20}px"
									height="{lineSettings.height + 20}px"
									xmlns="http://www.w3.org/2000/svg"
								>
									<g transform="translate(10,10)">
										<circle
											cx={lineSettings.x1}
											cy={lineSettings.y1}
											r="10"
											fill="var(--light-gray)"
										/>
										<circle
											cx={lineSettings.x2}
											cy={lineSettings.y2}
											r="10"
											fill="var(--light-gray)"
										/>
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
					{/if}
				{/each}
			</div>
		</div>
	{:else}
		<p>No text loaded yet...</p>
	{/if}
</main>

<style>
	span.entity {
		border: 1px solid #dddddd00;
		padding: 1px;
		cursor: pointer;
		user-select: none;
		position: relative;
		display: inline-block;
	}

	.entity:hover {
		border: 1px solid var(--primary-color);
		position: relative;
	}

	.entity-details {
		user-select: text;
		position: absolute;
		background-color: white;
		z-index: 1;
		border: 1px solid var(--light-gray);
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

	.text-container {
		padding: 50px;
		max-width: 1000px;
	}

	.relation-type-select {
		position: fixed;
		left: calc((100vw - 806px) / 2);
		top: calc(20%);
		z-index: 2;
	}

	.relation-type-options {
		max-height: 300px;
		overflow: auto;
	}
</style>
