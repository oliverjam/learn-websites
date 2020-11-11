# Eleventy reference

This is a quick list of Eleventy features you probably want to use.

## Concepts

Eleventy is a "static site generator" (SSG). It will turn any recognised "template" files into HTML files (injecting any data they need). These generated HTML files will be in a `_site/` folder (by default) that you can deploy to a static host.

## [Templates](https://www.11ty.dev/docs/templates/)

A template is the source for a page. It can be as simple as a static HTML/markdown file that gets copied to the final site unchanged. It can also be a dynamic JS file that generates an HTML string based on data. (It can also be a bunch of other different template formats like Nunjucks or Handlebars).

### Examples

Both of these templates would create the same output `_site/index.html` file.

```md
<!-- index.md -->

# My page

This is a page
```

```js
// index.11ty.js

exports.render = () => {
  return `
    <h1>My page</h1>
    <p>This is a page</p>
  `;
};
```

### Non-page files

By default Eleventy turns all recognised templates into pages. If you want to avoid this you can put files in an `_includes/` directory. This is where things like sub-components, layouts etc should live.

## [Layouts](https://www.11ty.dev/docs/layouts/)

Templates can have shared "layouts", which are like higher-level templates that wrap the template content. This is where you would put shared stuff like HTML boilerplate, links to CSS files etc.

### Example

Create a layout file in the `_includes/` directory:

```js
// _includes/base.11ty.js

exports.render = (data) => {
  return `
    <!doctype html>
    <html lang="en">
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
        </nav>
        ${data.content}
      </body>
    </html>
  `;
};
```

Set that layout in a template's data:

```md
---
layout: base
---

# Home page
```

## [Data](https://www.11ty.dev/docs/data/)

Data is structured information associated with templates (but not part of the templates' content). E.g. the date of a blog post, the layout a template should use, the title of a specific page etc.

### Setting data

#### Template-level data

Templates can set (and use) dynamic data. Most template languages use Yaml "frontmatter" blocks to set data:

```md
---
layout: base
title: Home
---

# Home page
```

JavaScript template must export a `data` object to set data:

```js
// index.11ty.js

exports.data = {
  layout: "base",
  title: "Home",
};

exports.render = () => `<h1>Home page</h1>`;
```

#### Directory-level data

You can set data for an entire directory at once using a "data file". This is a JSON file with the same name as a directory. All the properties set in this file will apply to all templates within the directory.

For example for this file structure:

```sh
blog/
├── blog.json
└── my-first-post.md
└── my-second-post.md
```

And this `blog.json`:

```json
{
  "layout": "blog-layout",
  "tags": "blog"
}
```

Both the blog post templates will have the same layout and tags set. This helps reduce duplication when you have a collection of lots of the same type of template.

#### Global data

You can set data for _every_ template in a project by creating a `_data/` folder at the top-level and putting JSON files inside. E.g.

```sh
_data_/
├── site.json
└── dogs.json
```

Every template in this project would be able to access `data.site` and `data.dogs` properties.

#### JS data files

You can use JavaScript for data files by added the `.11tydata.js` extension. This allows you to export an async function that can e.g. fetch data from an API.

```js
// posts.11tydata.js

module.exports = () => {
  // if your blog posts were stored on Airtable
  return fetch("https://airtable.com/1234/my-posts").then((res) => res.json());
};
```

This API response data would then be available in templates as `data.posts`.

### Using data

JavaScript templates can access data from the data object which is passed to the `render` function. This object contains _all_ data for that template (including directory-level and global data).

```js
// index.11ty

exports.render = (data) => {
  // use data from the global _data/site.json
  const address = data.site.address;
  return `
    <footer>${address}</footer>
  `;
};
```

## [Permalinks](https://www.11ty.dev/docs/permalinks/)

Usually a template's file path determines its final location in the `_site/` directory. E.g. `blog/post-one.md` will output `_site/blog/post-one/index.html`. You can override this by setting a `permalink` data property. Eleventy will use this as the final path instead.

E.g. if we had a `home.md` that we wanted to use as the homepage:

```md
---
permalink: /
---

# Home page
```

## [Collections](https://www.11ty.dev/docs/collections/)

Collections are a way to group related templates. For example you may want to easily access all blog posts so you can list them on your homepage.

Create a collection by setting a `tags` data property on each template. Collections are available in other templates as `data.collections[collectionName]`.

E.g. if we set `tags: "blog"` in all our blog post templates we could access them all in `index.11ty.js`:

```js
// index.11ty.js

exports.render = (data) => {
  const posts = data.collections.blog;
  return `
    <ul>
      ${posts.map((post) => `<li>${post.title}</li>`).join("")}
    </ul>
  `;
};
```

You can set more than one tag to put templates into multiple collections. E.g. `tags: ["blog", "other"]`.

## [Configuration](https://www.11ty.dev/docs/config/)

You can configure Eleventy by creating an `.eleventy.js` file at the root of your project. This must export a function that receives a config object. You can use the config object to e.g. add plugins.

Your function can return an object of new config values too. This is how you can e.g. change the input directory (if you wanted all your files to live in a `src/` folder).

```js
// .eleventy.js
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(syntaxHighlight);
  return {
    dir: {
      input: "src",
    },
  },
}
```

Note: changing config often requires you to restart your dev server to pick up the changes.

## [Assets](https://www.11ty.dev/docs/copy/)

By default Eleventy only "passes through" templates. Any unrecognised files (e.g. regular JS/CSS/images) won't be copied to the final `_site/` directory.

You can configure Eleventy to pass through other files by adding them in your config.

```js
// .eleventy.js

module.exports = (eleventyConfig) => {
  // pass through a single file
  eleventyConfig.addPassthroughCopy("style.css");
  // pass through an entire "assets" dir untouched
  eleventyConfig.addPassthroughCopy("assets");
};
```

This config would copy `style.css` to `_site/style.css` and the entire `assets/` directory to `_site/assets/`. So you'd be able to reference these in your templates like this:

```html
<link href="/style.css" />
<link href="/assets/other-styles.css" />
<script src="/assets/dom.js"></script>
```
