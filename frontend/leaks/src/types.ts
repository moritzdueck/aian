export interface Entity {
    id: number;
    candidate: string;
    cui: string;
    start: number;
    end: number;
    score: number;
    semtype: string;
    text_id: number;
}