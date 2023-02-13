---
title: Introduction to MeiLi Search with Docker
cover: https://mpolinowski.github.io/assets/images/photo-kt443t6d_64hdh43hfh6dgjdfhg4_d-c0f91ee25552813b6bd5cf30c355f362.jpg
---


<!-- TOC -->

- [Setup MeiLi Search with Docker](#setup-meili-search-with-docker)
- [Add Documents](#add-documents)
- [Search Documents](#search-documents)
- [CLI Search Client](#cli-search-client)
- [Rest API](#rest-api)

<!-- /TOC -->


<!-- * [React Frontend for MeiLi Search]()
* [Gatsby.js Frontend for MeiLi Search]() -->


In [this guide](https://docs.meilisearch.com/learn/cookbooks/docker.html#download-meilisearch-with-docker) you will learn how to use Docker to download and run Meilisearch, configure its behavior, and manage your Meilisearch data.


## Setup MeiLi Search with Docker

Use the docker pull command to download the latest [Meilisearch image](https://hub.docker.com/r/getmeili/meilisearch):



```bash
docker pull getmeili/meilisearch:latest
```


After completing the previous step, use docker run to launch the Meilisearch image. To persist the data I will create a `meili` directory and mount it into the container:


```bash
sudo mkdir /opt/meili_data
sudo chown myuser:myuser /opt/meili_data
```


```bash
docker run -it --rm \
  -p 7700:7700 \
  -v /opt/meili_data:/meili_data \
  getmeili/meilisearch:latest
```


```bash
888b     d888          d8b 888 d8b                                            888
8888b   d8888          Y8P 888 Y8P                                            888
88888b.d88888              888                                                888
888Y88888P888  .d88b.  888 888 888 .d8888b   .d88b.   8888b.  888d888 .d8888b 88888b.
888 Y888P 888 d8P  Y8b 888 888 888 88K      d8P  Y8b     "88b 888P"  d88P"    888 "88b
888  Y8P  888 88888888 888 888 888 "Y8888b. 88888888 .d888888 888    888      888  888
888   "   888 Y8b.     888 888 888      X88 Y8b.     888  888 888    Y88b.    888  888
888       888  "Y8888  888 888 888  88888P'  "Y8888  "Y888888 888     "Y8888P 888  888

Config file path:       "none"
Database path:          "./data.ms"
Server listening on:    "http://0.0.0.0:7700"
Environment:            "development"
Commit SHA:             "5e12af88e2575a42f53bb3907aea42d7cd4b8b20"
Commit date:            "2023-02-01T11:07:46+00:00"
Package version:        "1.0.0"
```


But I am receiving the following warning:


```bash
No master key was found. The server will accept unidentified requests. A master key of at least 16 bytes will be required when switching to a production environment. We generated a new secure master key for you (you can safely use this token):

>> --master-key RhTX1pLPSKSn7KW9yf9u_MNKC0v1YKkmx2Sc6qSwbLQ <<

Restart Meilisearch with the argument above to use this new and secure master key.
```


Ok :)


```bash
docker run -it --rm \
  -p 7700:7700 \
  -v /opt/meili_data:/meili_data \
  -e MEILI_MASTER_KEY='RhTX1pLPSKSn7KW9yf9u_MNKC0v1YKkmx2Sc6qSwbLQ' \
  getmeili/meilisearch:latest
```


```bash
A master key has been set. Requests to Meilisearch won't be authorized unless you provide an authentication key.
```


## Add Documents

For this quick start, I will be using a collection of movies - a dataset provided in the [MeiLi Docs](https://docs.meilisearch.com/movies.json). Move the downloaded file into your working directory. The REST API can be used with cURL:


```bash
curl \
  -X POST 'http://localhost:7700/indexes/movies/documents?primaryKey=id' \
  -H 'Content-Type: application/json' \
  --data-binary @movies.json
```


But let's try using Python for fun - start by installing `pip3 install meilisearch`. The following script will not work though - just as the cURL request above - since we set up authentication:


```py
import meilisearch
import json

client = meilisearch.Client('http://localhost:7700')

json_file = open('movies.json')
movies = json.load(json_file)
client.index('movies').add_documents(movies)
```


The __Master Key__ should not be used for regular operations. So we first need to retrieve the __API Key__ from MeiLi Search:


```py
import meilisearch
import json

MASTER_KEY='RhTX1pLPSKSn7KW9yf9u_MNKC0v1YKkmx2Sc6qSwbLQ'

client = meilisearch.Client('http://localhost:7700', MASTER_KEY)
print(client.get_keys())
```


The response I get here is:


```json
{"results": [{"name": "Default Search API Key", "description": "Use it to search from the frontend", "key": "0f96f66dcbc8f4d6e512592ec6e0f9e0b091de34a89147f244a93e3ab0709b7f", "uid": "9690e16c-9941-4dcf-addd-469e514e3226", "actions": ["search"], "indexes": ["*"], "expiresAt": null, "createdAt": "2023-02-10T06:18:07.098683943Z", "updatedAt": "2023-02-10T06:18:07.098683943Z"}, {"name": "Default Admin API Key", "description": "Use it for anything that is not a search operation. Caution! Do not expose it on a public frontend", "key": "992c6bd8233077bc83e537993ca3598aeb0e1113b0f89c0778d9523500aa6df2", "uid": "8e6bf9f2-3500-46b4-a875-76d695ac3ae1", "actions": ["*"], "indexes": ["*"], "expiresAt": null, "createdAt": "2023-02-10T06:18:07.095128284Z", "updatedAt": "2023-02-10T06:18:07.095128284Z"}], "offset": 0, "limit": 20, "total": 2}
```


So I am receiving two additional keys here beside the master key generated earlier:


| Key | Description | Value |
| -- | -- | -- |
| __Master Key__ | Used to setup MeiLi Search and generate the API keys below. | `RhTX1pLPSKSn7KW9yf9u_MNKC0v1YKkmx2Sc6qSwbLQ` |
| __Default Search API Key__ | Use it to search from the frontend. | `0f96f66dcbc8f4d6e512592ec6e0f9e0b091de34a89147f244a93e3ab0709b7f` |
| __Default Admin API Key__ | Use it for anything that is not a search operation. Caution! Do not expose it on a public frontend. | `992c6bd8233077bc83e537993ca3598aeb0e1113b0f89c0778d9523500aa6df2` |


We can extract those two keys with:


```py
client_auth = meilisearch.Client('http://localhost:7700', MASTER_KEY)
api_keys = client_auth.get_keys()

SEARCH_KEY = api_keys["results"][0]["key"]
ADMIN_KEY = api_keys["results"][1]["key"]

print("Search Key:", search_key, "Admin Key:", admin_key)
```

With the authentication part dealt with, let's add our data:


```py
client_admin = meilisearch.Client('http://localhost:7700', ADMIN_KEY)

json_file = open('movies.json')
movies = json.load(json_file)
client_admin.index('movies').add_documents(movies)
```


## Search Documents

Now with Meilisearch set up, we can start searching with the search API key:


```py
client_search = meilisearch.Client('http://localhost:7700', SEARCH_KEY)
results = client_search.index('movies').search('Casablanca')
print(results)
```


```json
{"hits": [{"id": 289, "title": "Casablanca", "overview": "In Casablanca, Morocco in December 1941, a cynical American expatriate meets a former lover, with unforeseen complications.", "genres": ["Drama", "Romance"], "poster": "https://image.tmdb.org/t/p/w500/5K7cOHoay2mZusSLezBOY0Qxh8a.jpg", "release_date": -855187200}, {"id": 26940, "title": "A Night in Casablanca", "overview": "The Marx Brothers are employed at a hotel in postwar Casablanca, where a ring of Nazis is trying to recover a cache of stolen treasure.", "genres": ["Comedy"], "poster": "https://image.tmdb.org/t/p/w500/cXMT6KVIXEa9UI8ojEnBBYundrY.jpg", "release_date": -746236800}, {"id": 14208, "title": "The Librarian: Return to King Solomon's Mines", "overview": "After retrieving the Crystal Skull in Utah, Flynn Carsen receives a map in the mail with the secret location of King Solomon's Mines. When the scroll is stolen, Judson explains the power of the Key of Solomon's book and assigns Flynn to retrieve the map. The map is useless without the legend piece to decipher it, which is located in Volubilis near the Roman ruins in Morocco. Flynn heads to Casablanca to the ruins where he is chased by a group of mercenaries leaded by General Samir. They too want to find the location of King Solomon's mines. Flynn teams-up with Professor Emily Davenport working in the dig and they escape from General Samir and his men. While traveling to Gedi, they save the local Jomo from death and the trio faces a dangerous journey through the wild Africa.", "genres": ["Fantasy", "Action", "Adventure"], "poster": "https://image.tmdb.org/t/p/w500/jK4BhFw9uNS6BKfAVlxX6Bnkj0J.jpg", "release_date": 1157760000}], "query": "Casablanca", "processingTimeMs": 1, "limit": 20, "offset": 0, "estimatedTotalHits": 3}
```


## CLI Search Client

```py
import meilisearch
import json

MASTER_KEY='RhTX1pLPSKSn7KW9yf9u_MNKC0v1YKkmx2Sc6qSwbLQ'

# get API keys
client_auth = meilisearch.Client('http://localhost:7700', MASTER_KEY)
api_keys = client_auth.get_keys()

SEARCH_KEY = api_keys['results'][0]['key']

# search index
print("INFO :: Welcome to MeiLi Search!", '\n')
search_query = input("INPUT :: Please enter a name of a movie you want to search for: ")
client_search = meilisearch.Client('http://localhost:7700', SEARCH_KEY)
print("INFO :: MeiLi Search results for:", search_query, '\n')
results = client_search.index('movies').search(search_query)


for result in results['hits']:
  print(result['title'].upper(), '||', result['overview'], '\n')
```


## Rest API

List indices:


```bash
curl \
  -X GET 'http://localhost:7700/indexes?limit=3' \
  -H 'Authorization: Bearer RhTX1pLPSKSn7KW9yf9u_MNKC0v1YKkmx2Sc6qSwbLQ'
```


Create an index:


```bash
curl \
  -X POST 'http://localhost:7700/indexes' \
  -H 'Authorization: Bearer RhTX1pLPSKSn7KW9yf9u_MNKC0v1YKkmx2Sc6qSwbLQ' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "uid": "my_blog",
    "primaryKey": "id"
  }'
```


Delete an index:


```bash
curl \
  -X DELETE 'http://localhost:7700/indexes/movies' \
  -H 'Authorization: Bearer RhTX1pLPSKSn7KW9yf9u_MNKC0v1YKkmx2Sc6qSwbLQ'
```