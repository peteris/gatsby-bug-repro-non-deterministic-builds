## Gatsby issue: non-deterministic hashes for incremental builds

### To reproduce

1. Build the site with the `GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES` flag on

```
$ GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES=true npm run build -- --log-pages
```

Observe pages being emitted:

```
➜ GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES=true npm run build -- --log-pages

> gatsby-starter-hello-world@0.1.0 build /Volumes/Projects/bug-repro
> gatsby build "--log-pages"

success open and validate gatsby-configs - 0.015s
success load plugins - 0.026s
success onPreInit - 0.003s
success initialize cache - 0.006s
success copy gatsby files - 0.060s
success onPreBootstrap - 0.010s
success createSchemaCustomization - 0.004s
success source and transform nodes - 0.015s
success building schema - 0.140s
success createPages - 0.028s
success createPagesStatefully - 0.027s
success onPreExtractQueries - 0.002s
success update schema - 0.018s
success extract queries from components - 0.010s
success write out requires - 0.004s
success write out redirect data - 0.002s
success onPostBootstrap - 0.002s
⠀
info bootstrap finished - 3.174 s
⠀
success Building production JavaScript and CSS bundles - 2.043s
success Rewriting compilation hashes - 0.004s
success run queries - 2.146s - 3/3 1.40/s
success Building static HTML for pages - 0.217s - 3/3 13.81/s
success Delete previous page data - 0.001s
success onPostBuild - 0.001s
info Done building in 5.571871769 sec
info Built pages:
Updated page: /one
Updated page: /two
Updated page: /
```

2. Run the build again a few times.

Since no code or content has changed (we generate a random `last_updated` date but do not query for it), the build hash should not change and no pages should be emitted.

However, sometimes it *does* change. This is due to the fact that the pages are not always emitted in the same order, causing the keys in `.cache/async-requires.js` to be written in a different order and producing a different hash for the module, and the build:

```
// BUILD 1

// prefer default export if available
const preferDefault = m => m && m.default || m

exports.components = {
  "component---src-templates-post-template-1-js": () => import("./../src/templates/post-template-1.js" /* webpackChunkName: "component---src-templates-post-template-1-js" */),
  "component---src-templates-post-template-2-js": () => import("./../src/templates/post-template-2.js" /* webpackChunkName: "component---src-templates-post-template-2-js" */),
  "component---src-pages-index-js": () => import("./../src/pages/index.js" /* webpackChunkName: "component---src-pages-index-js" */)
}

// BUILD 2

// prefer default export if available
const preferDefault = m => m && m.default || m

exports.components = {
  "component---src-templates-post-template-2-js": () => import("./../src/templates/post-template-2.js" /* webpackChunkName: "component---src-templates-post-template-2-js" */),
  "component---src-templates-post-template-1-js": () => import("./../src/templates/post-template-1.js" /* webpackChunkName: "component---src-templates-post-template-1-js" */),
  "component---src-pages-index-js": () => import("./../src/pages/index.js" /* webpackChunkName: "component---src-pages-index-js" */)
}
```