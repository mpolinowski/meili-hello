---
title: React Frontend for MeiLi Search
cover: https://mpolinowski.github.io/assets/images/photo-kt443t6d_64hdh43hfh6dgjdfhg4_d-6c1edb088dfea3a7d39f8eebb8e9dc23.jpg
---


<!-- TOC -->

- [Installation](#installation)
- [Build the Frontend](#build-the-frontend)

<!-- /TOC -->


[MeiLi Search](https://docs.meilisearch.com/learn/getting_started/quick_start.html) is an open-source search engine. And [Instant Meilisearch](https://github.com/meilisearch/instant-meilisearch) is the search client that you should use to make MeiLi Search work with [InstantSearch](https://github.com/algolia/instantsearch.js). InstantSearch, an open-source project developed by Algolia, is the tool that renders all the components needed to start searching in your front-end application.


> If you did not setup the MeiLi backend - [please do this first](https://mpolinowski.github.io/docs/DevOps/Elasticsearch/2023-02-10--meili-rusty-elastic-docker/2023-02-10/).




## Installation

Start by scaffolding a React app and install the instant search dependencies:

```bash
npx create-react-app meilisearch-starter && cd meilisearch-starter
npm install react-instantsearch-dom instantsearch.css @meilisearch/instant-meilisearch
```


## Build the Frontend

Now we can change the content of `src/App.js` to start building our MeiLi user interface - __Note__: I will start by using the __Master Key__ to interact with the MeiLi Search API - this needs to be changed later:


```js
import React from 'react'
import { InstantSearch, Hits, SearchBox } from 'react-instantsearch-dom'
import 'instantsearch.css/themes/algolia-min.css'
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch'

const SERVER_ADDRESS = 'http://localhost:7700'
const API_KEY = 'RhTX1pLPSKSn7KW9yf9u_MNKC0v1YKkmx2Sc6qSwbLQ'
const INDEX_NAME = 'movies'

const searchClient = instantMeiliSearch(SERVER_ADDRESS, API_KEY, {
  primaryKey: 'id',
})

const App = () => (
  <div className="ais-InstantSearch">
    <h1>MeiLi Search React Frontend</h1>
    <h2>Search for Movies</h2>
    <InstantSearch indexName={INDEX_NAME} searchClient={searchClient}>
      <div style={{ margin: "16px 0px"}}>
        <SearchBox />
      </div>
      <Hits hitComponent={Hit} />
    </InstantSearch>
  </div>
)

const Hit = ({ hit }) => (
  <div
    key={hit.id}
    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
  >
    {hit.title && (
      <h3 className="hit-title" style={{ marginTop: 0 }}>
        {hit.title}
      </h3>
    )}
    {hit.poster && (
      <img src={hit.poster} alt={hit.overview || ''} style={{ maxWidth: '100%' }} />
    )}
    <a href={`/${hit.id || ''}`}><button style={{cursor: "pointer", width: "100%", height: 35, padding: "0 1.5rem", color: "rgb(105, 107, 108)", fontSize: 15, fontWeight: 600, fontFamily: "'Roboto', sans-serif", letterSpacing: ".8px", textAlign: "center", textDecoration: "none", verticalAlign: "middle", whiteSpace: "nowrap", outline: "none", border: "none", userSelect: "none", borderRadius: 2, transition: "all .3s ease-out", boxShadow: "0 2px 5px 0 rgba(0,0,0,0.225)", marginTop: 15}}>Not implemented</button></a>
  </div>
)

export default App
```