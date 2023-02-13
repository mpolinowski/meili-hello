import meilisearch
import json

MASTER_KEY='RhTX1pLPSKSn7KW9yf9u_MNKC0v1YKkmx2Sc6qSwbLQ'

# get API keys
client_auth = meilisearch.Client('http://localhost:7700', MASTER_KEY)
api_keys = client_auth.get_keys()

SEARCH_KEY = api_keys["results"][0]["key"]
ADMIN_KEY = api_keys["results"][1]["key"]
# print("Search Key:", search_key, "Admin Key:", admin_key)

# load data
client_admin = meilisearch.Client('http://localhost:7700', ADMIN_KEY)
json_file = open('movies.json')
movies = json.load(json_file)
client_admin.index('movies').add_documents(movies)

# try search
client_search = meilisearch.Client('http://localhost:7700', SEARCH_KEY)
results = client_search.index('movies').search('Casablanca')
print(results)