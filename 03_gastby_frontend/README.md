# Introduction to MeiLi Search with Docker 

A lightning-fast search engine that fits effortlessly into your apps, websites, and workflow.


<!-- TOC -->

- [Introduction to MeiLi Search with Docker](#introduction-to-meili-search-with-docker)
  - [Installation](#installation)
    - [Configuration](#configuration)
  - [Build the Frontend](#build-the-frontend)

<!-- /TOC -->


[MeiLi Search](https://docs.meilisearch.com/learn/getting_started/quick_start.html) is an open-source search engine. And [Instant Meilisearch](https://github.com/meilisearch/instant-meilisearch) is the search client that you should use to make MeiLi Search work with [InstantSearch](https://github.com/algolia/instantsearch.js). InstantSearch, an open-source project developed by Algolia, is the tool that renders all the components needed to start searching in your front-end application.


> If you did not setup the MeiLi backend - [please do this first](https://mpolinowski.github.io/docs/DevOps/Elasticsearch/2023-02-10--meili-rusty-elastic-docker/2023-02-10/).




## Installation

Start by scaffolding a Gatsby.js app and install the instant search dependencies:

```bash
npm install -g gatsby-cli
gatsby new
cd path-to-my-gatsby-site
npm install gatsby-plugin-meilisearch react-instantsearch-dom instantsearch.css @meilisearch/instant-meilisearch
```


### Configuration

To make the plugin work, open the `gatsby-config.js` configuration file located at the root of your Gatsby project. All the configuration takes place in that file:


```js
plugins: [
      {
        resolve: require.resolve(`gatsby-plugin-meilisearch`),
        options: {
          host: process.env.GATSBY_MEILI_HTTP_ADDR || 'http://localhost:7700',
          apiKey: process.env.GATSBY_MEILI_MASTER_KEY || 'RhTX1pLPSKSn7KW9yf9u_MNKC0v1YKkmx2Sc6qSwbLQ',
          batchSize: 1,
          indexes: [
            {
              indexUid: process.env.GATSBY_MEILI_INDEX_NAME || 'my_blog',
              settings: {
                searchableAttributes: ['title'],
              },
              transformer: data =>
                data.allMdx.edges.map(({ node }) => ({
                  ...node,
                  title: node.frontmatter.title,
                  cover: node.frontmatter.cover,
                })),
              query: `
                query MyQuery {
                  allMdx {
                    edges {
                      node {
                        id
                        slug
                        frontmatter {
                          title
                          cover
                        }
                        tableOfContents
                      }
                    }
                  }
                }
              `,
            },
        ],
      },
    }
  ],
}
```

The file above has the MeiLi variables hardcoded - you can also put them into a `.env` file in your Gatsby root and they will be picked up from there.


The Plugin is using the Gatsby GraphQL API to query all your blog entries and generates a search index `my_blog` for you on build time!


## Build the Frontend

Now we can change the content of `src/App.js` to start building our MeiLi user interface - __Note__: I will start by using the __Master Key__ to interact with the MeiLi Search API - this needs to be changed later:


```js
import React from 'react'
import { InstantSearch, Hits, SearchBox } from 'react-instantsearch-dom'
import { Link } from 'gatsby'
import 'instantsearch.css/themes/algolia-min.css'
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch'

const SERVER_ADDRESS =
  process.env.GATSBY_MEILI_HTTP_ADDR || 'http://localhost:7700'
const API_KEY = process.env.GATSBY_MEILI_MASTER_KEY || 'RhTX1pLPSKSn7KW9yf9u_MNKC0v1YKkmx2Sc6qSwbLQ'
const INDEX_NAME = process.env.GATSBY_MEILI_INDEX_NAME || 'my_blog'

const searchClient = instantMeiliSearch(SERVER_ADDRESS, API_KEY, {
  primaryKey: 'id',
})

const App = () => (
  <div className="ais-InstantSearch">
    <h1>MeiLi Search Gatsby.js Frontend</h1>
    <h2>Search for Articles</h2>
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
    {hit.cover && (
      <img src={hit.cover} alt={hit.title || ''} style={{ maxWidth: '100%' }} />
    )}
    <Link to={`/${hit.slug || ''}`}><button style={{cursor: "pointer", width: "100%", height: 35, padding: "0 1.5rem", color: "rgb(105, 107, 108)", fontSize: 15, fontWeight: 600, fontFamily: "'Roboto', sans-serif", letterSpacing: ".8px", textAlign: "center", textDecoration: "none", verticalAlign: "middle", whiteSpace: "nowrap", outline: "none", border: "none", userSelect: "none", borderRadius: 2, transition: "all .3s ease-out", boxShadow: "0 2px 5px 0 rgba(0,0,0,0.225)", marginTop: 15}}>Go to Article</button></Link>
  </div>
)

export default App
```