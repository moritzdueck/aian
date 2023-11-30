import psycopg2

PGHOST='localhost'
PGDATABASE='leaks'
PGUSER='postgres'
PGPASSWORD='example'


class Database:

    def __init__(self):
        self.connection = None
    

    def connect(self):    

        if self.connection is None:
            self.connection = psycopg2.connect(
                host=PGHOST,
                database=PGDATABASE,
                user=PGUSER,
                password=PGPASSWORD,
            )
            self.create_relations_if_not_exist()

    
    def create_relations_if_not_exist(self):
        conn = self.connection
        
        if conn is None:
            return

        with conn:
            with conn.cursor() as cur:
                cur.execute("""
                            CREATE TABLE IF NOT EXISTS relations (
                                id SERIAL PRIMARY KEY, 
                                fktext INT, 
                                fkentity1 INT, 
                                fkentity2 INT, 
                                relation TEXT, 
                                core REAL,
                            FOREIGN KEY (fktext) REFERENCES texts(id),
                            FOREIGN KEY (fkentity1) REFERENCES entities(id),
                            FOREIGN KEY (fkentity2) REFERENCES entities(id),
                            UNIQUE(fktext, fkentity1, fkentity2)
                            );
                            """)


    def get_texts_as_dict(self):
        """This function returns all texts as a list of dictionaries"""
        conn = self.connection
        if conn is None:
            return []

        texts = []
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, pmid, title FROM texts")
                rows = cur.fetchall()

                print("rows", rows)
                texts = []

                for row in rows:
                    texts.append({
                        "id": row[0],
                        "pmid": row[1],
                        "title": row[2],
                    })

        return texts


    def get_text_as_dict(self, text_id):
        """This function returns a text as a dictionary with all its fields"""
        conn = self.connection
        if conn is None:
            return {}
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, pmid, title, abstract, text FROM texts WHERE id = %s", (text_id,))
                row = cur.fetchone()
                if row is None:
                    return {}
                
                return {
                    "id": row[0],
                    "pmid": row[1],
                    "title": row[2],
                    "abstract": row[3],
                    "text": row[4],
                }


    def get_entities_as_dict(self, text_id):
        """This function returns a text as a dictionary with all its fields"""
        conn = self.connection
        if conn is None:
            return []
        entities = []
        with conn:
            with conn.cursor() as cur:
                cur.execute('SELECT id, fktext, candidate, score, cui, semtype, start, "end" FROM entities WHERE fktext = %s', (text_id,))
                rows = cur.fetchall()
                for row in rows:
                    entities.append({
                        "id": row[0],
                        "text_id": row[1],
                        "candidate": row[2],
                        "score": row[3],
                        "cui": row[4],
                        "semtype": row[5],
                        "start": row[6],
                        "end": row[7],
                    })

        return entities
