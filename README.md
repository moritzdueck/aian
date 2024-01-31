# Medical Text Annotation Tool

This repo contains a prototype for collecting relation annotations in texts:

<img src='https://github.com/moritzdueck/aian/assets/24496543/3e7c43cb-92f0-4c29-a348-c8f69f1d72e3' width='200'>

## Instructions

Run locally by
1. intialising a database using docker: `docker-compose -f db-stack.yml up`
2. run the frontend with
   - `cd frontend`
   - `npm install`
   - `npm run dev`
3. run the backend with
   - `cd backend`
   - create a conda environment with `conda create --name leaks --file './requirements.txt'`
   - `conda activate leaks`
   - `python server.py`

The machine learning experiments can be found in `notebooks/GettingStarted.ipynb` and can be run using the conda environment created above.



