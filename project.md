# Portfolio project

We're going to build a dev portfolio/blog site using Eleventy. Most of the features you need should be in the [reference](/reference.md). Anything should be in the [Eleventy docs](https://11ty.dev/docs).

## Quick start

1. Create a new directory and initialise it `npm init -y`
1. Install Eleventy `npm i @11ty/eleventy`
1. Add npm scripts to `package.json`:
   ```json
   "scripts": {
     "build": "eleventy build",
     "dev": "eleventy build --serve",
   }
   ```
1. `npm run dev` to start a live-reloading server

## Criteria

- Multiple pages (e.g. home, about, blog)
- Blog posts generated from markdown files
- Recent posts on the home page
- All posts on the blog page
- Global navigation with links to all main pages
- Make it pretty!

### Stretch criteria

- Tag pages for blog posts (e.g. show all posts tagged with "react")
