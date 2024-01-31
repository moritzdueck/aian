<script lang="ts">
    import * as d3 from 'd3';
    import {onMount} from 'svelte';
    import {MODE, getTermEnvironment, getSnippet} from '../api';
    import {semanticGroups, semanticTypes} from '../stores/relations';
    import {forkJoin} from "rxjs";

    export let cui = 'C0919691'

    let svgNode;
    let svg;
    let data;
    let pieData = new Map();
    let colors;

    let spans: HTMLSpanElement[] = [];
    let selectedTerm = undefined as string | undefined;

    let snippets: {snippet: string, start: number, end: number, entities: {start: number, end: number}[]}[] = [];

    const NAME = 0;
    const TEXT_ID = 1;
    const CUI = 2;
    const SEM_TYPE = 3;
    const START = 4;
    const END = 5;
    const SCORE = 6;


    let filter: { group: string | undefined; type: string | undefined } = {
        group: undefined,
        type: undefined
    };

    onMount(async () => {
        svg = d3.select(svgNode!);
        data = await getTermEnvironment(MODE, cui);
        draw();
    });

    function filterByGroup(group: string | undefined) {
        filter.group = group;
        filter.type = undefined;
        draw();
    }

    function filterByType(type: string | undefined) {
        filter.type = type;
        draw();
    }

    function draw() {

        const groupData = d3.rollup(
            data!.filter((d: any) => semanticTypes[d[SEM_TYPE] as string].name == filter.type),
            (v) => ({length: v.length, values: v}),
            (d: any) => d[CUI]
        );


        if (filter.type) {
            pieData = groupData;
        } else if (filter.group) {
            pieData = d3.rollup(
                data!.filter(
                    (d: any) => semanticGroups[semanticTypes[d[SEM_TYPE] as string].name] == filter.group
                ),
                (v) => ({length: v.length}),
                (d: any) => semanticTypes[d[SEM_TYPE] as string].name
            );
        } else {
            pieData = d3.rollup(
                data!,
                (v) => ({length: v.length}),
                (d: any) => semanticGroups[semanticTypes[d[SEM_TYPE] as string].name]
            );
        }

        pieData = new Map([...pieData.entries()].sort((a, b) => b[1].length - a[1].length));

        svg.selectAll('*').remove();
        let angle = 0;

        // create one discrete color per semtype
        colors = d3.scaleOrdinal().domain(new Set(Object.values(semanticGroups))).range(d3.schemeSet2);

        let sum = [...pieData.values()].map(v => v.length).reduce((a, b) => a + b, 0);
        let cumSum = 0;

        console.log(pieData);

        let i = 0;
        // create pie chart using d3 arc
        pieData.forEach((obj, key) => {

            let value = obj.length;

            const arc = d3.arc()({
                innerRadius: 20,
                outerRadius: 50,
                startAngle: angle,
                endAngle: (value / sum) * 2 * Math.PI + angle
            });

            svg!
                .append('path')
                .classed('arc', true)
                .attr('transform', 'translate(50,50)')
                .attr('d', arc)
                .attr('fill', () => {
                    if(filter.type){
                        return i%2 === 0
                            ? colors(filter.group as string)
                            : colors(filter.group as string) + '80'
                    }
                    if(filter.group){
                        return i%2 === 0
                            ? colors(filter.group as string)
                            : colors(filter.group as string) + '80'
                    }
                    return colors(key) as string
                })
                .on('click', () => {
                    if (filter.type) {
                        loadSnippet(obj)
                        return;
                    }

                    if (filter.group) {
                        filterByType(key);
                        return;
                    }

                    filterByGroup(key);
                });

            angle += (value / sum) * 2 * Math.PI;
            i++;
        });

        // add labels
        pieData.forEach((obj, key) => {

            let value = obj.length;
            const labelArc = d3.arc();
            svg!
                .append('g')
                .attr('transform', 'translate(50,50)')
                .append('text')
                // restirct max width of text and make it multiline centered
                .attr('font-size', '3px')
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
                .attr(
                    'transform',
                    `translate(${labelArc.centroid({
                        innerRadius: 35,
                        outerRadius: 35,
                        startAngle: angle,
                        endAngle: (value / sum) * 2 * Math.PI + angle
                    })})
                    rotate(${
                        cumSum + (value / 2) < sum / 2
                            ? ((angle + (value / sum) * 2 * Math.PI + angle) / 2 / Math.PI * 180 - 90)
                            : ((angle + (value / sum) * 2 * Math.PI + angle) / 2 / Math.PI * 180 - 90) + 180
                    })
                    `
                )
                .text(filter.type? obj.values[0][NAME] : key);

            cumSum += value;

            angle += (value / sum) * 2 * Math.PI;
        });
    }

    function back() {
        if (snippets.length > 0) {
            selectedTerm = undefined;
            snippets = [];
        } else if (filter.type) {
            filter.type = undefined;
        } else if (filter.group) {
            filter.group = undefined;
        }
        draw();
    }

    async function loadSnippet(data) {
        forkJoin(data.values.map(d => getSnippet(MODE, d[TEXT_ID], d[START], d[END], cui)))
            .subscribe((res: {snippet: string, start: number, end: number, entities: {start: number, end: number}[]}[]) => {
                let newSnippets = []
                res.filter(snippet => snippet.entities.length > 0 && (snippet.snippet.length > 0)).forEach((snippet, i) => {

                    let gaps = [{start: snippet.start, end: snippet.end, type: 'highlight'}, ...snippet.entities.map(e => ({start: e.start, end: e.end, type: 'entity'}))].sort((a, b) => a.start - b.start);
                    selectedTerm = snippet.snippet.substring(snippet.start, snippet.end);

                    const filledGaps = [];
                    let previousEnd = 0;

                    for (const gap of gaps) {

                        if (gap.start < previousEnd) {
                            filledGaps[filledGaps.length - 1].type = 'highlight-entity'
                            continue;
                        } else {
                            filledGaps.push({ start: previousEnd, end: gap.start });
                            filledGaps.push(gap);
                            previousEnd = gap.end;
                        }

                    }

                    filledGaps.push({ start: previousEnd, end: snippet.snippet.length });
                    newSnippets.push({snippet: snippet.snippet, start: snippet.start, end: snippet.end, entities: snippet.entities, spans: filledGaps.map(b => ({ text: snippet.snippet.substring(b.start, b.end), type: b.type }))});
                })
                snippets = newSnippets;

            });
    }


</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="explorer" on:click={e => e.preventDefault()}>

    <div class="breadcrumbs">
        {#if filter.group}
            <span class="breadcrumb">{filter.group}</span>
        {/if}
        {#if filter.type}
            <span class="breadcrumb"> > {filter.type}</span>
        {/if}
        {#if selectedTerm}
            <span class="breadcrumb"> > {selectedTerm}</span>
        {/if}
    </div>


    <svg bind:this={svgNode} viewBox="0 0 100 100" width="100%" height="100%" style="margin-top: 100px"></svg>

    {#if pieData.size > 40 && snippets.length === 0}
        <div class="list-over-circle">
            <button class="btn btn-ghost back-button-list" on:click={() => back()}>Back</button>

            <div class="list-view">
                {#each pieData.entries() as entry, index}
                    <div class="list-view-item"
                         style="height: {(Math.log(entry[1].length + 1) * 40)}px; background-color: {index%2 === 0
                            ? colors(filter.group)
                            : colors(filter.group) + '80'}"
                         on:click={() => loadSnippet(entry[1])}>
                        <span>{entry[1].values[0][NAME]} {entry[1].values[0][CUI]}</span>
                    </div>
                {/each}
            </div>
        </div>
    {/if}


    {#if snippets.length > 0}
        <div class="snippets">
            {#each snippets as snippet}
                <div class="snippet">
                    {#each snippet.spans as span}
                        <span class="{span.type}">{span.text}</span>
                    {/each}
                </div>
            {/each}

        </div>
    {/if}

    <button class="btn btn-ghost back-button-list" on:click={() => back()}>Back</button>

</div>

<style>
    .explorer {
        max-width: 800px;
        padding: 10px;
        width: 100%;
        margin-top: 50px;
        height: 100%;
        position: relative;
    }

    .list-over-circle {
        position: absolute;
        z-index: 1;
        top: 0px;
        left: 0;
        width: 100%;
        background-color: white;
        height: calc(100vh - 80px);
        overflow: auto;
    }

    .list-view {
        margin-top: 40px;
    }

    .list-view-item {
        font-size: small;
        padding-left: 10px;
        display: flex;
        align-items: center;
    }

    .back-button-list {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 40px;
        background-color: white;
        z-index: 3;
    }

    .snippets {
        position: absolute;
        z-index: 2;
        top: 40px;
        left: 0;
        width: 100%;
        background-color: white;
        overflow: auto;
    }

    .snippet {
        padding: 10px;
        border: 1px solid black;
        margin: 10px;
    }

    .snippet:last-of-type {
        margin-bottom: 500px;
    }

    .highlight {
        background-color: yellow;
    }

    .entity {
        background-color: lightblue;
    }

    .highlight-entity {
    background: repeating-linear-gradient(
        45deg,
        yellow,
        yellow 10px,
        lightblue 10px,
        lightblue 20px
    );
    }

    .breadcrumbs {
        font-size: small;
        position: fixed;
        top: 50px;
        left: 0;
        padding-left: 10px;
        color: white;
        z-index: 4;
        background-color: #333333;
        width: 100%;
        height: 40px;
    }

</style>
