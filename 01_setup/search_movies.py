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