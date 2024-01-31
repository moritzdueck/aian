import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { category10 } from "../utils/color";

export let relationTypes = writable([] as {name: string, key: string}[]);
export let relations = writable([] as {head: number, tail: number, type: string, docId: number}[]);
export let colorMap = writable({} as {[key: string]: string});


relationTypes.subscribe((relations) => {   
        let relationKeys = relations.map((relation) => relation.key);
        let newColorMap = {} as {[key: string]: string};

``        
        let colorScheme = category10;
        let i = 0;
        for (let key of relationKeys) {
            if (!newColorMap[key]){
                newColorMap[key] = colorScheme[i];
                i++;
            }
        }

        colorMap.set(newColorMap);

    });


export let defaultRelationTypes = [
    {name: 'causes', key: 'causes'},
    {name: 'treats', key: 'treats'},
    {name: 'diagnoses', key: 'diagnoses'},
    {name: 'reveals', key: 'reveals'},
    {name: 'investigates', key: 'investigates'},
    {name: 'prevents', key: 'prevents'},
    {name: 'location', key: 'location'},
    {name: 'indicates', key: 'indicates'},
] 

if (browser){
    const relationTypesFromLocalStorage = browser && localStorage.relationTypes;
    relationTypes.set(relationTypesFromLocalStorage && JSON.parse(relationTypesFromLocalStorage) || defaultRelationTypes)
    relationTypes.subscribe((value) => localStorage.relationTypes = JSON.stringify(value || []));

    const relationsFromLocalStorage = browser && localStorage.relations;
    
    relations.set(relationsFromLocalStorage && JSON.parse(relationsFromLocalStorage) || [])
    relations.subscribe((value) => localStorage.relations = JSON.stringify(value || []));
}

export const semanticTypes: {[key: string]: {x: string, name: string}} = {
    "aapp": {
        "x": "T116",
        "name": "Amino Acid, Peptide, or Protein"
    },
    "acab": {
        "x": "T020",
        "name": "Acquired Abnormality"
    },
    "acty": {
        "x": "T052",
        "name": "Activity"
    },
    "aggp": {
        "x": "T100",
        "name": "Age Group"
    },
    "amas": {
        "x": "T087",
        "name": "Amino Acid Sequence"
    },
    "amph": {
        "x": "T011",
        "name": "Amphibian"
    },
    "anab": {
        "x": "T190",
        "name": "Anatomical Abnormality"
    },
    "anim": {
        "x": "T008",
        "name": "Animal"
    },
    "anst": {
        "x": "T017",
        "name": "Anatomical Structure"
    },
    "antb": {
        "x": "T195",
        "name": "Antibiotic"
    },
    "arch": {
        "x": "T194",
        "name": "Archaeon"
    },
    "bacs": {
        "x": "T123",
        "name": "Biologically Active Substance"
    },
    "bact": {
        "x": "T007",
        "name": "Bacterium"
    },
    "bdsu": {
        "x": "T031",
        "name": "Body Substance"
    },
    "bdsy": {
        "x": "T022",
        "name": "Body System"
    },
    "bhvr": {
        "x": "T053",
        "name": "Behavior"
    },
    "biof": {
        "x": "T038",
        "name": "Biologic Function"
    },
    "bird": {
        "x": "T012",
        "name": "Bird"
    },
    "blor": {
        "x": "T029",
        "name": "Body Location or Region"
    },
    "bmod": {
        "x": "T091",
        "name": "Biomedical Occupation or Discipline"
    },
    "bodm": {
        "x": "T122",
        "name": "Biomedical or Dental Material"
    },
    "bpoc": {
        "x": "T023",
        "name": "Body Part, Organ, or Organ Component"
    },
    "bsoj": {
        "x": "T030",
        "name": "Body Space or Junction"
    },
    "celc": {
        "x": "T026",
        "name": "Cell Component"
    },
    "celf": {
        "x": "T043",
        "name": "Cell Function"
    },
    "cell": {
        "x": "T025",
        "name": "Cell"
    },
    "cgab": {
        "x": "T019",
        "name": "Congenital Abnormality"
    },
    "chem": {
        "x": "T103",
        "name": "Chemical"
    },
    "chvf": {
        "x": "T120",
        "name": "Chemical Viewed Functionally"
    },
    "chvs": {
        "x": "T104",
        "name": "Chemical Viewed Structurally"
    },
    "clas": {
        "x": "T185",
        "name": "Classification"
    },
    "clna": {
        "x": "T201",
        "name": "Clinical Attribute"
    },
    "clnd": {
        "x": "T200",
        "name": "Clinical Drug"
    },
    "cnce": {
        "x": "T077",
        "name": "Conceptual Entity"
    },
    "comd": {
        "x": "T049",
        "name": "Cell or Molecular Dysfunction"
    },
    "crbs": {
        "x": "T088",
        "name": "Carbohydrate Sequence"
    },
    "diap": {
        "x": "T060",
        "name": "Diagnostic Procedure"
    },
    "dora": {
        "x": "T056",
        "name": "Daily or Recreational Activity"
    },
    "drdd": {
        "x": "T203",
        "name": "Drug Delivery Device"
    },
    "dsyn": {
        "x": "T047",
        "name": "Disease or Syndrome"
    },
    "edac": {
        "x": "T065",
        "name": "Educational Activity"
    },
    "eehu": {
        "x": "T069",
        "name": "Environmental Effect of Humans"
    },
    "elii": {
        "x": "T196",
        "name": "Element, Ion, or Isotope"
    },
    "emod": {
        "x": "T050",
        "name": "Experimental Model of Disease"
    },
    "emst": {
        "x": "T018",
        "name": "Embryonic Structure"
    },
    "enty": {
        "x": "T071",
        "name": "Entity"
    },
    "enzy": {
        "x": "T126",
        "name": "Enzyme"
    },
    "euka": {
        "x": "T204",
        "name": "Eukaryote"
    },
    "evnt": {
        "x": "T051",
        "name": "Event"
    },
    "famg": {
        "x": "T099",
        "name": "Family Group"
    },
    "ffas": {
        "x": "T021",
        "name": "Fully Formed Anatomical Structure"
    },
    "fish": {
        "x": "T013",
        "name": "Fish"
    },
    "fndg": {
        "x": "T033",
        "name": "Finding"
    },
    "fngs": {
        "x": "T004",
        "name": "Fungus"
    },
    "food": {
        "x": "T168",
        "name": "Food"
    },
    "ftcn": {
        "x": "T169",
        "name": "Functional Concept"
    },
    "genf": {
        "x": "T045",
        "name": "Genetic Function"
    },
    "geoa": {
        "x": "T083",
        "name": "Geographic Area"
    },
    "gngm": {
        "x": "T028",
        "name": "Gene or Genome"
    },
    "gora": {
        "x": "T064",
        "name": "Governmental or Regulatory Activity"
    },
    "grpa": {
        "x": "T102",
        "name": "Group Attribute"
    },
    "grup": {
        "x": "T096",
        "name": "Group"
    },
    "hcpp": {
        "x": "T068",
        "name": "Human-caused Phenomenon or Process"
    },
    "hcro": {
        "x": "T093",
        "name": "Health Care Related Organization"
    },
    "hlca": {
        "x": "T058",
        "name": "Health Care Activity"
    },
    "hops": {
        "x": "T131",
        "name": "Hazardous or Poisonous Substance"
    },
    "horm": {
        "x": "T125",
        "name": "Hormone"
    },
    "humn": {
        "x": "T016",
        "name": "Human"
    },
    "idcn": {
        "x": "T078",
        "name": "Idea or Concept"
    },
    "imft": {
        "x": "T129",
        "name": "Immunologic Factor"
    },
    "inbe": {
        "x": "T055",
        "name": "Individual Behavior"
    },
    "inch": {
        "x": "T197",
        "name": "Inorganic Chemical"
    },
    "inpo": {
        "x": "T037",
        "name": "Injury or Poisoning"
    },
    "inpr": {
        "x": "T170",
        "name": "Intellectual Product"
    },
    "irda": {
        "x": "T130",
        "name": "Indicator, Reagent, or Diagnostic Aid"
    },
    "lang": {
        "x": "T171",
        "name": "Language"
    },
    "lbpr": {
        "x": "T059",
        "name": "Laboratory Procedure"
    },
    "lbtr": {
        "x": "T034",
        "name": "Laboratory or Test Result"
    },
    "mamm": {
        "x": "T015",
        "name": "Mammal"
    },
    "mbrt": {
        "x": "T063",
        "name": "Molecular Biology Research Technique"
    },
    "mcha": {
        "x": "T066",
        "name": "Machine Activity"
    },
    "medd": {
        "x": "T074",
        "name": "Medical Device"
    },
    "menp": {
        "x": "T041",
        "name": "Mental Process"
    },
    "mnob": {
        "x": "T073",
        "name": "Manufactured Object"
    },
    "mobd": {
        "x": "T048",
        "name": "Mental or Behavioral Dysfunction"
    },
    "moft": {
        "x": "T044",
        "name": "Molecular Function"
    },
    "mosq": {
        "x": "T085",
        "name": "Molecular Sequence"
    },
    "neop": {
        "x": "T191",
        "name": "Neoplastic Process"
    },
    "nnon": {
        "x": "T114",
        "name": "Nucleic Acid, Nucleoside, or Nucleotide"
    },
    "npop": {
        "x": "T070",
        "name": "Natural Phenomenon or Process"
    },
    "nusq": {
        "x": "T086",
        "name": "Nucleotide Sequence"
    },
    "ocac": {
        "x": "T057",
        "name": "Occupational Activity"
    },
    "ocdi": {
        "x": "T090",
        "name": "Occupation or Discipline"
    },
    "orch": {
        "x": "T109",
        "name": "Organic Chemical"
    },
    "orga": {
        "x": "T032",
        "name": "Organism Attribute"
    },
    "orgf": {
        "x": "T040",
        "name": "Organism Function"
    },
    "orgm": {
        "x": "T001",
        "name": "Organism"
    },
    "orgt": {
        "x": "T092",
        "name": "Organization"
    },
    "ortf": {
        "x": "T042",
        "name": "Organ or Tissue Function"
    },
    "patf": {
        "x": "T046",
        "name": "Pathologic Function"
    },
    "phob": {
        "x": "T072",
        "name": "Physical Object"
    },
    "phpr": {
        "x": "T067",
        "name": "Phenomenon or Process"
    },
    "phsf": {
        "x": "T039",
        "name": "Physiologic Function"
    },
    "phsu": {
        "x": "T121",
        "name": "Pharmacologic Substance"
    },
    "plnt": {
        "x": "T002",
        "name": "Plant"
    },
    "podg": {
        "x": "T101",
        "name": "Patient or Disabled Group"
    },
    "popg": {
        "x": "T098",
        "name": "Population Group"
    },
    "prog": {
        "x": "T097",
        "name": "Professional or Occupational Group"
    },
    "pros": {
        "x": "T094",
        "name": "Professional Society"
    },
    "qlco": {
        "x": "T080",
        "name": "Qualitative Concept"
    },
    "qnco": {
        "x": "T081",
        "name": "Quantitative Concept"
    },
    "rcpt": {
        "x": "T192",
        "name": "Receptor"
    },
    "rept": {
        "x": "T014",
        "name": "Reptile"
    },
    "resa": {
        "x": "T062",
        "name": "Research Activity"
    },
    "resd": {
        "x": "T075",
        "name": "Research Device"
    },
    "rnlw": {
        "x": "T089",
        "name": "Regulation or Law"
    },
    "sbst": {
        "x": "T167",
        "name": "Substance"
    },
    "shro": {
        "x": "T095",
        "name": "Self-help or Relief Organization"
    },
    "socb": {
        "x": "T054",
        "name": "Social Behavior"
    },
    "sosy": {
        "x": "T184",
        "name": "Sign or Symptom"
    },
    "spco": {
        "x": "T082",
        "name": "Spatial Concept"
    },
    "tisu": {
        "x": "T024",
        "name": "Tissue"
    },
    "tmco": {
        "x": "T079",
        "name": "Temporal Concept"
    },
    "topp": {
        "x": "T061",
        "name": "Therapeutic or Preventive Procedure"
    },
    "virs": {
        "x": "T005",
        "name": "Virus"
    },
    "vita": {
        "x": "T127",
        "name": "Vitamin"
    },
    "vtbt": {
        "x": "T010",
        "name": "Vertebrate"
    }
}

export const semanticGroups: {[key: string]: string} = {
    "Activity": "Activities & Behaviors",
    "Behavior": "Activities & Behaviors",
    "Daily or Recreational Activity": "Activities & Behaviors",
    "Event": "Activities & Behaviors",
    "Governmental or Regulatory Activity": "Activities & Behaviors",
    "Individual Behavior": "Activities & Behaviors",
    "Machine Activity": "Activities & Behaviors",
    "Occupational Activity": "Activities & Behaviors",
    "Social Behavior": "Activities & Behaviors",
    "Anatomical Structure": "Anatomy",
    "Body Location or Region": "Anatomy",
    "Body Part, Organ, or Organ Component": "Anatomy",
    "Body Space or Junction": "Anatomy",
    "Body Substance": "Anatomy",
    "Body System": "Anatomy",
    "Cell": "Anatomy",
    "Cell Component": "Anatomy",
    "Embryonic Structure": "Anatomy",
    "Fully Formed Anatomical Structure": "Anatomy",
    "Tissue": "Anatomy",
    "Amino Acid, Peptide, or Protein": "Chemicals & Drugs",
    "Antibiotic": "Chemicals & Drugs",
    "Biologically Active Substance": "Chemicals & Drugs",
    "Biomedical or Dental Material": "Chemicals & Drugs",
    "Chemical": "Chemicals & Drugs",
    "Chemical Viewed Functionally": "Chemicals & Drugs",
    "Chemical Viewed Structurally": "Chemicals & Drugs",
    "Clinical Drug": "Chemicals & Drugs",
    "Element, Ion, or Isotope": "Chemicals & Drugs",
    "Enzyme": "Chemicals & Drugs",
    "Hazardous or Poisonous Substance": "Chemicals & Drugs",
    "Hormone": "Chemicals & Drugs",
    "Immunologic Factor": "Chemicals & Drugs",
    "Indicator, Reagent, or Diagnostic Aid": "Chemicals & Drugs",
    "Inorganic Chemical": "Chemicals & Drugs",
    "Nucleic Acid, Nucleoside, or Nucleotide": "Chemicals & Drugs",
    "Organic Chemical": "Chemicals & Drugs",
    "Pharmacologic Substance": "Chemicals & Drugs",
    "Receptor": "Chemicals & Drugs",
    "Vitamin": "Chemicals & Drugs",
    "Classification": "Concepts & Ideas",
    "Conceptual Entity": "Concepts & Ideas",
    "Functional Concept": "Concepts & Ideas",
    "Group Attribute": "Concepts & Ideas",
    "Idea or Concept": "Concepts & Ideas",
    "Intellectual Product": "Concepts & Ideas",
    "Language": "Concepts & Ideas",
    "Qualitative Concept": "Concepts & Ideas",
    "Quantitative Concept": "Concepts & Ideas",
    "Regulation or Law": "Concepts & Ideas",
    "Spatial Concept": "Concepts & Ideas",
    "Temporal Concept": "Concepts & Ideas",
    "Drug Delivery Device": "Devices",
    "Medical Device": "Devices",
    "Research Device": "Devices",
    "Acquired Abnormality": "Disorders",
    "Anatomical Abnormality": "Disorders",
    "Cell or Molecular Dysfunction": "Disorders",
    "Congenital Abnormality": "Disorders",
    "Disease or Syndrome": "Disorders",
    "Experimental Model of Disease": "Disorders",
    "Finding": "Disorders",
    "Injury or Poisoning": "Disorders",
    "Mental or Behavioral Dysfunction": "Disorders",
    "Neoplastic Process": "Disorders",
    "Pathologic Function": "Disorders",
    "Sign or Symptom": "Disorders",
    "Amino Acid Sequence": "Genes & Molecular Sequences",
    "Carbohydrate Sequence": "Genes & Molecular Sequences",
    "Gene or Genome": "Genes & Molecular Sequences",
    "Molecular Sequence": "Genes & Molecular Sequences",
    "Nucleotide Sequence": "Genes & Molecular Sequences",
    "Geographic Area": "Geographic Areas",
    "Age Group": "Living Beings",
    "Amphibian": "Living Beings",
    "Animal": "Living Beings",
    "Archaeon": "Living Beings",
    "Bacterium": "Living Beings",
    "Bird": "Living Beings",
    "Eukaryote": "Living Beings",
    "Family Group": "Living Beings",
    "Fish": "Living Beings",
    "Fungus": "Living Beings",
    "Group": "Living Beings",
    "Human": "Living Beings",
    "Mammal": "Living Beings",
    "Organism": "Living Beings",
    "Patient or Disabled Group": "Living Beings",
    "Plant": "Living Beings",
    "Population Group": "Living Beings",
    "Professional or Occupational Group": "Living Beings",
    "Reptile": "Living Beings",
    "Vertebrate": "Living Beings",
    "Virus": "Living Beings",
    "Entity": "Objects",
    "Food": "Objects",
    "Manufactured Object": "Objects",
    "Physical Object": "Objects",
    "Substance": "Objects",
    "Biomedical Occupation or Discipline": "Occupations",
    "Occupation or Discipline": "Occupations",
    "Health Care Related Organization": "Organizations",
    "Organization": "Organizations",
    "Professional Society": "Organizations",
    "Self-help or Relief Organization": "Organizations",
    "Biologic Function": "Phenomena",
    "Environmental Effect of Humans": "Phenomena",
    "Human-caused Phenomenon or Process": "Phenomena",
    "Laboratory or Test Result": "Phenomena",
    "Natural Phenomenon or Process": "Phenomena",
    "Phenomenon or Process": "Phenomena",
    "Cell Function": "Physiology",
    "Clinical Attribute": "Physiology",
    "Genetic Function": "Physiology",
    "Mental Process": "Physiology",
    "Molecular Function": "Physiology",
    "Organism Attribute": "Physiology",
    "Organism Function": "Physiology",
    "Organ or Tissue Function": "Physiology",
    "Physiologic Function": "Physiology",
    "Diagnostic Procedure": "Procedures",
    "Educational Activity": "Procedures",
    "Health Care Activity": "Procedures",
    "Laboratory Procedure": "Procedures",
    "Molecular Biology Research Technique": "Procedures",
    "Research Activity": "Procedures",
    "Therapeutic or Preventive Procedure": "Procedures",
}