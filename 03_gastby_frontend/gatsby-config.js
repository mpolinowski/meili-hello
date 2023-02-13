require('dotenv').config()

module.exports = {
  siteMetadata: {
    siteUrl: 'http://localhost',
    title: 'MeiLi Search',
  },
  plugins: [
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blog`,
        path: `${__dirname}/src/blog`,
      },
    },
    {
      resolve: 'gatsby-plugin-page-creator',
      options: {
        path: `${__dirname}/src/blog`,
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.mdx`, `.md`],
        defaultLayouts: {
          default: require.resolve('./src/components/blog-layout.js'),
        },
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 800,
            },
          },
        ],
      },
    },
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
    },
  ],
}
