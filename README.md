
## Docker
First start docker to run the postgres database

```
docker-compose -f db-stack.yml up
```

## Running the backend

```
cd backend
python server.py
```

## Running the frontend

```
cd frontend/leaks
npm run dev
```
