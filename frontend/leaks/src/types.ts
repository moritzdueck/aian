type SemanticType = 'aapp' | 'acab' | 'acty' | 'aggp' | 'amas' | 'amph' | 'anab' | 'anim' | 'anst' | 'antb' | 'arch' | 'bacs' | 'bact' | 'bdsu' | 'bdsy' | 'bhvr' | 'biof' | 'bird' | 'blor' | 'bmod' | 'bodm' | 'bpoc' | 'bsoj' | 'celc' | 'celf' | 'cell' | 'cgab' | 'chem' | 'chvf' | 'chvs' | 'clas' | 'clna' | 'clnd' | 'cnce' | 'comd' | 'crbs' | 'diap' | 'dora' | 'drdd' | 'dsyn' | 'edac' | 'eehu' | 'elii' | 'emod' | 'emst' | 'enty' | 'enzy' | 'euka' | 'evnt' | 'famg' | 'ffas' | 'fish' | 'fndg' | 'fngs' | 'food' | 'ftcn' | 'genf' | 'geoa' | 'gngm' | 'gora' | 'grpa' | 'grup' | 'hcpp' | 'hcro' | 'hlca' | 'hops' | 'horm' | 'humn' | 'idcn' | 'imft' | 'inbe' | 'inch' | 'inpo' | 'inpr' | 'irda' | 'lang' | 'lbpr' | 'lbtr' | 'mamm' | 'mbrt' | 'mcha' | 'medd' | 'menp' | 'mnob' | 'mobd' | 'moft' | 'mosq' | 'neop' | 'nnon' | 'npop' | 'nusq' | 'ocac' | 'ocdi' | 'orch' | 'orga' | 'orgf' | 'orgm' | 'orgt' | 'ortf' | 'patf' | 'phob' | 'phpr' | 'phsf' | 'phsu' | 'plnt' | 'podg' | 'popg' | 'prog' | 'pros' | 'qlco' | 'qnco' | 'rcpt' | 'rept' | 'resa' | 'resd' | 'rnlw' | 'sbst' | 'shro' | 'socb' | 'sosy' | 'spco' | 'tisu' | 'tmco' | 'topp' | 'virs' | 'vita' | 'vtbt';

export interface Entity {
    id: number;
    candidate: string;
    cui: string;
    start: number;
    end: number;
    score: number;
    semtype: string;
    text_id: number;
    active?: boolean
}

export interface Node {
    id: number;
    start: number;
    end: number;
    score: number;
    text: string;
    cui: string;
    semtype: SemanticType;
}

export interface RelationAnnotationStatus {
    annotationState: 'none' | 'head' | 'tail' | 'type';
    headEntity: Node | undefined;
    tailEntity: Node | undefined;
}

export type {SemanticType};
