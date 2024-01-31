import psycopg2
from psycopg2 import pool

PGHOST = 'localhost'
PGDATABASE = 'leaks'
PGUSER = 'postgres'
PGPASSWORD = 'example'


class Database:

    def __init__(self):
        self.connection = None
        self.create_database()
        self.create_connection_pool()

    def start(self):
        self.create_connection_pool()
        self.create_texts_if_not_exist()
        self.create_entities_if_not_exist()
        self.create_relations_if_not_exist()

    def create_database(self):
        postgres_conn = psycopg2.connect(
            host=PGHOST,
            database='postgres',
            user=PGUSER,
            password=PGPASSWORD,
        )
        postgres_conn.autocommit = True
        with postgres_conn.cursor() as cur:
            cur.execute(
                "SELECT exists(SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'leaks')")
            database_exists = cur.fetchone()
            if not database_exists:
                print("Creating database leaks")
                cur.execute('CREATE DATABASE leaks;')
            else:
                print("Database leaks exists")

        postgres_conn.close()

    def create_connection_pool(self):
        self.connection_pool = pool.SimpleConnectionPool(1, 20,
                                                    host=PGHOST,
                                                    database=PGDATABASE,
                                                    user=PGUSER,
                                                    password=PGPASSWORD,
                                                    )

    def create_texts_if_not_exist(self):
        conn = self.connection_pool.getconn()

        if conn is None:
            print("conn is None")
            return

        with conn:
            with conn.cursor() as cur:
                cur.execute("""
                            CREATE TABLE IF NOT EXISTS texts (
                                id serial PRIMARY KEY, 
                                pmid varchar, 
                                title varchar, 
                                abstract varchar, 
                                text varchar
                            );
                            """)
                cur.execute(
                    "CREATE INDEX IF NOT EXISTS pmid_index ON texts (pmid);")
                conn.commit()
        
        self.connection_pool.putconn(conn)

    def insert_text(self, pmc_id, title, abstract, text):
        conn = self.connection_pool.getconn()

        if conn is None:
            return

        with conn:
            with conn.cursor() as cur:
                cur.execute("INSERT INTO texts (pmid, title, abstract, text) VALUES (%s, %s, %s, %s)",
                            (pmc_id, title, abstract, abstract + " " + text))
                
        self.connection_pool.putconn(conn)

    def create_entities_if_not_exist(self):
        conn = self.connection_pool.getconn()

        if conn is None:
            return

        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    """CREATE TABLE IF NOT EXISTS entities (
                    id serial PRIMARY KEY, 
                    fktext INT, 
                    candidate varchar, 
                    score int, 
                    cui varchar, 
                    semtype varchar, 
                    start int, 
                    "end" int,
                    CONSTRAINT fk_text
                        FOREIGN KEY(fktext) 
                        REFERENCES texts(id)
                        ON DELETE CASCADE
                );
                """)
                conn.commit()
        
        self.connection_pool.putconn(conn)


    def insert_entities(self, pmid, entities):

        text_id = self.get_text_id_by_pmid(pmid)

        conn = self.connection_pool.getconn()

        if conn is None:
            return

        with conn:
            with conn.cursor() as cur:
                for entity in entities:
                    cur.execute('INSERT INTO entities (fktext, candidate, score, cui, semtype, start, "end") VALUES (%s, %s, %s, %s, %s, %s, %s)',
                                (text_id, entity[0], entity[1], entity[2], entity[3], entity[4], entity[5]))
        
        self.connection_pool.putconn(conn)


    def get_term_neighborhood(self, cui): 
        conn = self.connection_pool.getconn()
        
        rows = []
        with conn:
            with conn.cursor() as cur:
                cur.execute('''
                    WITH matching_entities AS (
                        SELECT * FROM entities WHERE cui='{cui}'
                    ),
                    neighbors AS (
                    SELECT candidate, fktext, cui, semtype, start, "end", score FROM entities
                        WHERE EXISTS (
                            SELECT * FROM matching_entities
                            WHERE entities.fktext = matching_entities.fktext
                            AND entities.start BETWEEN matching_entities.start-100 AND matching_entities.start+100
                        )
                        AND cui != '{cui}'
                    )
                    SELECT DISTINCT ON (fktext, start) * FROM neighbors                       
                '''.format(cui=cui, ))
                rows = cur.fetchall()
                
        self.connection_pool.putconn(conn)
        return rows

    def get_snippet(self, text_id, start, end, cui) -> dict: 
        conn = self.connection_pool.getconn()

        if conn is None:
            return {}
        
        with conn:
            with conn.cursor() as cur:
                cur.execute('''
                            SELECT text FROM texts WHERE id = %s
                            ''', (text_id, ))
                text = cur.fetchone()
                if text is None:
                    return ""
                text = text[0]

                # get text with 100 characters before and after, ending at the closest space
                snippet = text[start-150:end+150]
                offset = snippet.find(" ")
                snippet = snippet[:snippet.rfind(" ")]
                snippet = snippet[offset:]

                # get all entities in the snippet
                query = '''
                            SELECT start, "end", fktext FROM entities WHERE fktext = '{text_id}'
                            AND entities.start BETWEEN {start} AND {end}
                            AND cui = '{cui}'
                            '''.format(text_id=text_id, start=(start-100), end=(start+100), cui=cui)
                cur.execute(query)
                
                rows = cur.fetchall()
                print(query)
                print(rows)
        
        self.connection_pool.putconn(conn)
        return {"text": snippet, "start": (start-150) + offset, "entities": rows}
    

    def create_relations_if_not_exist(self):
        conn = self.connection_pool.getconn()

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
                conn.commit()

        self.connection_pool.putconn(conn)

    def get_texts_as_dict(self):
        """This function returns all texts as a list of dictionaries"""
        conn = self.connection_pool.getconn()
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


        self.connection_pool.putconn(conn)
        return texts

    def get_text_as_dict(self, text_id):
        """This function returns a text as a dictionary with all its fields"""
        conn = self.connection_pool.getconn()
        if conn is None:
            return {}
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, pmid, title, abstract, text FROM texts WHERE id = %s", (text_id,))
                row = cur.fetchone()
                if row is None:
                    return {}

        self.connection_pool.putconn(conn)

        return {
            "id": row[0],
            "pmid": row[1],
            "title": row[2],
            "abstract": row[3],
            "text": row[4],
        }
            


    def get_text_as_dict_by_pmid(self, pmid: str):
        """This function returns a text as a dictionary with all its fields"""
        conn = self.connection_pool.getconn()
        if conn is None:
            return {}
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, pmid, title, abstract, text FROM texts WHERE pmid = %s", (pmid,))
                row = cur.fetchone()
                if row is None:
                    return {}

        self.connection_pool.putconn(conn)
        return {
            "id": row[0],
            "pmid": row[1],
            "title": row[2],
            "abstract": row[3],
            "text": row[4],
        }

    def get_text_id_by_pmid(self, pmid: str):
        conn = self.connection_pool.getconn()
        if conn is None:
            return None
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM texts WHERE pmid = %s", (pmid,))
                row = cur.fetchone()
                if row is None:
                    return None

        self.connection_pool.putconn(conn)
        return int(row[0])

    def get_entities_as_dict(self, text_id):
        """This function returns a text as a dictionary with all its fields"""
        conn = self.connection_pool.getconn()
        if conn is None:
            return []
        entities = []
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    'SELECT id, fktext, candidate, score, cui, semtype, start, "end" FROM entities WHERE fktext = %s', (text_id,))
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

        self.connection_pool.putconn(conn)
        return entities
    

    def get_pmids_without_entities(self):
        conn = self.connection_pool.getconn()
        if conn is None:
            return []
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    'SELECT DISTINCT pmid FROM texts WHERE id NOT IN (SELECT DISTINCT fktext FROM entities)')
                rows = cur.fetchall()
                return [row[0] for row in rows]
            

    def clean_pmid(self, pmid: str):
        text_id = self.get_text_id_by_pmid(pmid)

        conn = self.connection_pool.getconn()
        if conn is None:
            return
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    "DELETE FROM entities WHERE fktext = %s", (text_id,))
                cur.execute("DELETE FROM texts WHERE id = %s", (text_id,))
                cur.execute(
                    "DELETE FROM relations WHERE fktext = %s", (text_id,))
                
        self.connection_pool.putconn(conn)
