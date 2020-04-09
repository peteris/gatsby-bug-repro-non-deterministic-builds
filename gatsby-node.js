const path = require("path")

const randomDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

const MOCK_POSTS = [
  { id: 1, slug: "one", template: "template1" },
  { id: 2, slug: "two", template: "template2" },
]

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const result = await graphql(
    `
      {
        allPost(sort: { fields: last_updated, order: ASC }) {
          edges {
            node {
              template
              slug
            }
          }
        }
      }
    `
  )
  const posts = result.data.allPost.edges

  // Create blog posts pages.
  const postTemplate1 = path.resolve(`./src/templates/post-template-1.js`)
  const postTemplate2 = path.resolve(`./src/templates/post-template-2.js`)

  posts.forEach(({ node: { template, slug } }) => {
    createPage({
      path: `${slug}`,
      component: template === "template1" ? postTemplate1 : postTemplate2,
      context: {
        slug,
      },
    })
  })
}

exports.sourceNodes = ({ actions, createNodeId, createContentDigest }) => {
  const { createNode } = actions

  MOCK_POSTS.forEach(({ id, template, slug }) => {
    const myData = {
      slug,
      template,
      last_updated: randomDate(new Date(2012, 0, 1), new Date()),
    }

    const nodeContent = JSON.stringify(myData)

    const nodeMeta = {
      id: createNodeId(`post-${id}`),
      parent: null,
      children: [],
      internal: {
        type: `Post`,
        mediaType: `text/html`,
        content: nodeContent,
        contentDigest: createContentDigest(myData),
      },
    }

    const node = Object.assign({}, myData, nodeMeta)
    createNode(node)
  })
}
