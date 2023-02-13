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