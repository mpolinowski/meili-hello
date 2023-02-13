# Introduction to MeiLi Search with Docker 

A lightning-fast search engine that fits effortlessly into your apps, websites, and workflow.


1. Start MeiLiSearch with (adjust the mounted dir `/opt/meili_data` to something available on your PC):

```bash
docker run -it --rm \
  -p 7700:7700 \
  -v /opt/meili_data:/meili_data \
  -e MEILI_MASTER_KEY='RhTX1pLPSKSn7KW9yf9u_MNKC0v1YKkmx2Sc6qSwbLQ' \
  getmeili/meilisearch:latest
```


2. Run `add_movies.py` to create the movies database and run a search query against it:


```bash
python 01_setup/add_movies.py
```

3. Run custom search queries through an Python CLI tool:

```bash
python 01_setup/search_movies.py
```