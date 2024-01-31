import { getEntities, getText } from "./data/data";
import staticDocs from "./data/documents";
import type { Entity } from "./types";


export const MODE: 'static' | 'server' = 'server'

const cache = new Map<string, any>()

export async function getTextById(text_id: string, mode: string): Promise<{ abstract: string; text: string; title: string } | undefined>{
    if(cache.has(text_id)){
        return cache.get(text_id)
    }
    
    if(mode === 'static'){
        return getText(text_id)
    }

    const response = await fetch(window.location.origin.substring(0, window.location.origin.length - 5)+':5003/texts/' + text_id);
	const text = await response.json();
   
    cache.set(text_id, text)

    return text
}

export async function getEntitiesById(text_id: string, mode: string): Promise<Entity[] | undefined>{
    if(mode === 'static'){
        return getEntities(text_id)
    }

    const entitiesResponse = await fetch(window.location.origin.substring(0, window.location.origin.length - 5)+':5003/entities/' + text_id);
	return await entitiesResponse.json();
}

export async function getDocuments(mode: string): Promise<any[] | undefined>{
    if(mode === 'static'){
        return staticDocs
    }

    const response = await fetch(window.location.origin.substring(0, window.location.origin.length - 5)+':5003/texts');
    return await response.json();
}

export async function getTermEnvironment(mode: string, cui: string): Promise<any> {
    if(mode === 'static'){
        return []
    }
    
    const response = await fetch(window.location.origin.substring(0, window.location.origin.length - 5)+':5003/explore/' + cui);
    return await response.json();
    
}

export async function getSnippet(mode: string, text_id: string, startI: number, endI: number, cui: string): Promise<{snippet: string, start: number, end: number, entities: {start: number, end: number}[]}> {
    if(mode === 'static'){
        return {snippet: '', start: 0, end: 0, entities: []}
    }

    const response = await fetch(window.location.origin.substring(0, window.location.origin.length - 5)+':5003/snippet', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            text_id: text_id,
            start: startI,
            end: endI,
            cui: cui
        })
    });
    const {text, start, entities} = await response.json();
    return ({snippet: text, start: startI - start, end: endI - start, entities: entities.map((e: any) => ({start: e[0] - start, end: e[1] - start}))});
}