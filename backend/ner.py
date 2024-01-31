from re import L, T, sub
import pandas as pd
import urllib.request
import json
import subprocess
import db as db
import logging

import psycopg2
from psycopg2 import sql


LOGGER = logging.getLogger(__name__)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
LOGGER.addHandler(handler)
LOGGER.setLevel(logging.INFO)


class PmcAPI:

    def __init__(self):
        return

    def get_dict_from_web_json(self, article_id):
        with urllib.request.urlopen("https://www.ncbi.nlm.nih.gov/research/bionlp/RESTful/pmcoa.cgi/BioC_json/"+article_id+"/unicode") as url:
            data = json.loads(url.read().decode())
            return data

    def remove_non_ascii(self, s: str) -> str:
        return "".join(c for c in s if ord(c) < 128)

    def get_title(self, article):
        return [x["text"] for x in article["documents"][0]["passages"] if x["infons"]["section_type"] == "TITLE"][0]

    def get_abstract(self, article):
        try:
            return [self.remove_non_ascii(x["text"]) for x in article["documents"][0]["passages"] if x["infons"]["type"] == "abstract"][0]
        except:
            return ""

    def get_text(self, article):
        return ("".join([self.remove_non_ascii(x["text"]) for x in article["documents"][0]["passages"] if x["infons"]["type"] == "paragraph"]))


class MetaMap:

    def __init__(self, data_dir: str = "data/", meta_map_dir: str = "/Users/moritzduck/workspaces/metamap-mac/public_mm/"):
        self.data_dir = data_dir
        self.meta_map_dir = meta_map_dir
        return

    def init_meta_map(self):
        skrmedpostctl_process = subprocess.Popen([self.meta_map_dir + "/bin/skrmedpostctl", "start"], stdout=subprocess.PIPE)
        output = skrmedpostctl_process.communicate()[0]
        if "Starting" in str(output):
            LOGGER.info("skrmedpostctl is running")
        else:
            LOGGER.debug(output)
            LOGGER.warn("skrmedpostctl is not running")

        wsdserverctl_process = subprocess.Popen([self.meta_map_dir + "/bin/wsdserverctl", "start"], stdout=subprocess.PIPE)
        output = wsdserverctl_process.communicate()[0]
        if "Starting" in str(output):
            LOGGER.info("wsdserverctl is running")
        else:
            LOGGER.debug(output)
            LOGGER.warn("wsdserverctl is not running")


    def process_file(self, file: str):

        with open(self.data_dir + file, "a") as f:
            f.write("\n")
        try:
            command = self.meta_map_dir + '/bin/metamap --silent --JSONf 2 -b -c -V USAbase {file} {output}'.format(
                file=self.data_dir + file, output=self.data_dir + file.replace(".txt", ".json"))
            output = subprocess.check_output(command, shell=True)
        except:
            print("error with file: ", file)

        with open(self.data_dir + file.replace(".txt", ".json")) as f:
            data = json.load(f)
            return self.process_json_output(data)

    def process_json_output(self, data):
        entities = []
        for utt in data["AllDocuments"][0]["Document"]["Utterances"]:
            for phrase in utt["Phrases"]:
                for mapping in phrase["Mappings"]:
                    for candidate in mapping["MappingCandidates"]:

                        startpos = int(candidate["ConceptPIs"][0]["StartPos"])
                        length = int(candidate["ConceptPIs"][0]["Length"])

                        mapping_start = startpos
                        mapping_end = mapping_start + length

                        cui = candidate["CandidateCUI"]
                        semtype = candidate["SemTypes"][0]
                        score = candidate["CandidateScore"]

                        candidate_matched = candidate["CandidateMatched"]
                        preferred = candidate["CandidatePreferred"]
                        matched = candidate["MatchedWords"]

                        entities.append(
                            (candidate_matched, score, cui, semtype, mapping_start, mapping_end))

        
        
        df = pd.DataFrame(entities, columns=['candidate', 'score', 'cui', 'semtype', 'start', 'end'])
        df = df.drop_duplicates(subset=['start', 'end', 'cui', 'semtype'], keep='first')

        # for all entries with the same start, end pair, sort by score and only keep up to 5
        df = df.groupby(['start', 'end']).apply(lambda x: x.sort_values(['score'], ascending=False)).reset_index(drop=True)
        df = df.groupby(['start', 'end']).head(5)
        df.sort_values(by=['start', 'score'], inplace=True)

        entities = df.values.tolist()
        return entities


class NER:

    def __init__(self, data_dir: str = "data/", debug: bool = False, init: bool = True, save_to_db: bool = True):
        if debug:
            LOGGER.setLevel(logging.DEBUG)

        self.pmc_api = PmcAPI()
        self.database = db.Database()
        if save_to_db:
            self.database.start()
        self.meta_map = MetaMap(data_dir=data_dir)
        if init:
            self.meta_map.init_meta_map()
        self.data_dir = data_dir
        return

    def process_texts(self, pmc_ids: list, clean: bool = False):
        """This function takes a list of texts and returns a list of dictionaries with the entities"""

        entities = []
        for i in range(len(pmc_ids)):
            pmc_id = pmc_ids[i]
            try:
                article = self.pmc_api.get_dict_from_web_json(str(pmc_id))
                title = self.pmc_api.get_title(article)
                abstract = self.pmc_api.get_abstract(article)
                text = self.pmc_api.get_text(article)
                
                LOGGER.debug("title: " + title)
                LOGGER.debug("abstract: " + abstract)

                self.database.insert_text(pmc_id, title, abstract, text)

                with open(self.data_dir + str(pmc_id) + ".txt", "w") as f:
                    f.write(abstract + " " + text)

                entities = self.meta_map.process_file(str(pmc_id) + ".txt")
                LOGGER.debug("entities[0]: "+ str(entities[0]))
                self.database.insert_entities(pmc_id, entities)

            except Exception as e:
                LOGGER.warn("error with pmid: " + pmc_id)
                LOGGER.exception("error: " + str(e))
                continue

            if clean:
                    subprocess.call(["rm", self.data_dir + str(pmc_id) + ".txt"])
                    subprocess.call(["rm", self.data_dir + str(pmc_id) + ".json"])

        return entities
