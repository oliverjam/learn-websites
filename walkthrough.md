# Walkthrough

This is a more detailed step-by-step that takes you from making a static HTML file to using Eleventy to generate a website.

## Part 1: hand-written pages

Creating a website can be as simple as writing some HTML and giving it to a static host like Netlify.

### The first page

1. Create a new directory
1. Create an `index.html` file
1. Add some HTML (e.g. `<h1>Home page</h1>`)

If you like you can go to netlify.com/drop and upload this folder. It'll be live within a second or so.

If you just want to view locally you can either use VS Code's Live Server extension, or start a quick server with:

```bash
npx serve .
```

### The second page

1. Create an `about.html` file
1. Add some (different) HTML (e.g. `<h1>About page</h1>`)

If you're running a local server (or re-deployed to Netlify) you should be able to see this page at `/about`.

### Adding complexity

We are missing a bunch of HTML boilerplate (i.e. the doctype, `<html>` and `<body>` tags etc). Browsers will try to add these if they're missing but it's best to include them.

We should also include a nav with links to each page so it's easy to jump between them.

1. Amend your HTML files to include a doctype, plus `<html>` and `<body>` tags
1. You can type `!` then hit `tab` to automatically insert this in VS Code
1. Add a `<nav>` containing links to both pages

You should now be able to see links on both pages that let you navigate your small site.

### Duplication

Unfortunately this technique won't scale. Every time we want to add a new page to the site we have to remember to edit the nav in _every_ other HTML file.

What if we want to include dynamic content like a date or content from a CMS?

We can fix these problems by _generating_ our pages instead of writing them by hand.

Since we're going to be centralising the shared markup you can remove the HTML boilerplate and nav from both files (so they just contain their unique content again).

## Part 2: page generation

A "static site generator" (SSG) doesn't have to be complicated. It can be as simple as a Node script that collects your HTML files, adds the duplicated content, then writes the new generated HTML to a "build" folder that you can deploy.

Let's write a script to build our current site. Don't worry about understanding this perfectly—we're not actually going to use it for anything real, it's just a learning exercise.

First we need a script file to run.

1. Create a `build.js` file
1. Add `console.log("building");` so we can check it works
1. Run `node build.js` in your terminal and you should see your log

Next we need to create our "build" folder where the generated files will live. We're going to be using the built-in filesystem module (`fs`) a lot. For simplicity we'll stick to the synchronous versions of each method so we don't have to worry about callbacks or promises.

```js
const fs = require("fs");

fs.mkdirSync("build", { recursive: true });
```

The `recursive` option tells Node not to error if the folder already exists (which it will after we've run the build at least once).

You can test this by running `node build.js` in your terminal. You should see a "build" folder appear.

Next we need a list of all the files in the current directory, since we're going to need to use their content to generate new ones.

```js
const files = fs.readdirSync(".");
console.log(files);
```

Run your script again and you should see all the files/directories in the current directory logged in an array.

Now we need to loop over this array and run some code for each `.html` file (since we should only generate pages for those).

```js
files.forEach((filename) => {
  if (filename.endsWith(".html")) {
    console.log(filename);
  }
});
```

Run your script again and you should see just the HTML files logged.

Let's handle writing new copies of these files to the build folder first—we'll worry about adding the shared markup in after we've got that working.

We need to read the original file's content as a string, then write a new file with that same content.

```js
files.forEach((filename) => {
  if (filename.endsWith(".html")) {
    const content = fs.readFileSync(filename);
    // output to /dist/${filename}
    const outputPath = path.join("dist", filename);
    fs.writeFileSync(outputPath, content);
    console.log(`${filename} -> dist/${filename}`);
  }
});
```

Run your build script again and you should see a log for each file. You should also see copies of both files appear in the `dist/` directory.

Finally we want to wrap each file's content in our HTML boilerplate and add the navigation. We can do this with a template literal.

```js
const content = fs.readFileSync(filename);
const outputPath = path.join("dist", filename);
const outputContent = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Our site</title>
  </head>
  <body>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
    </nav>
    ${content}
  </body>
</html>
    `;
fs.writeFileSync(outputPath, outputContent);
console.log(`${filename} -> dist/${filename}`);
```

Run your script one last time and you should see full HTML files created with all the extra stuff.

This is a great way to understand what exactly a static-site generator does, but it's not something we want to have to maintain ourselves.

Luckily there's a great Node-based SSG called Eleventy that we can use instead.

## Eleventy

Eleventy is an unopinionated static-site generator written in Node. It supports lots of different template types and data formats, and is focused on a single goal—generating HTML files.

### Quick start

Let's see how quickly we can use it to build our current site. Run this command in your terminal:

```sh
npx @11ty/eleventy build
```

You should see a new directory created named `_site/`. This is the default "build" folder for Eleventy (we'll see how to configure defaults later).

The `_site/` directory should contain your `index.html` and `about.html` files. By default Eleventy just copies HTML straight through untouched.

### Using markdown

Since our pages are very simple content it would be nice to author them in a simpler language: markdown. Eleventy supports this out of the box.

Change your file extensions to `.md` and replace the `<h1>`s with `#`s. Re-run `npx @11ty/eleventy build` and you should still see the HTML files in `_site/`. Eleventy processes the markdown into HTML then writes the files.

### Setting the project up

This isn't a super sustainable way to work though. We should create a `package.json`:

```sh
npm init -y
```

then install Eleventy as a dependency:

```sh
npm install @11ty/eleventy
```

and finally add dev and build scripts to our `package.json`:

```json
"scripts": {
  "build": "eleventy build",
  "dev": "eleventy build --serve",
}
```

Now `npm run build` will just create the `_site` directory, whilst `npm run dev` will create it and start up a dev server that auto-reloads when you make changes.

### Layouts

We're still missing all the shared stuff our previous build script added to our pages. Eleventy has a feature called "layouts" for this.

An Eleventy layout is a special page that wraps \_other pages. They have to live in a special directory named `_includes` (by default). This is where you put things that shouldn't be turned into HTML pages.

In order to create a layout we need to be able to "dynamically" generate pages. E.g. we need a way for Eleventy to give our layout each page's content and insert that into our HTML boilerplate.

Eleventy supports dedicated "dynamic" templating languages like Nunjucks and Handlebars. However you can even use JS to generate dynamic pages (using variables, loops etc). Since we don't want to learn a whole new templating language we'll stick to JS.

JS templates have to be distinguished from "normal" JS files, so by default you must make the extension `.11ty.js`. Let's create a layout at `_includes/base.11ty.js`:

```js
exports.render = () => {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Our site</title>
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
        </nav>
        content goes here?
      </body>
    </html>
  `;
};
```

When Eleventy finds a page that uses this layout it runs the exported `render` function. Whatever the function returns is used as the content for the final page that gets generated.

We still need to include our page content (e.g. the `<h1>Home page</h1>` or `<h1>About page</h1>`).

Eleventy will call our function with a data object containing loads of information about our site. This includes a `content` property that is a string of whatever the specific page content is.

```js
exports.render = (data) => {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Our site</title>
      </head>
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

Finally we need to set the layout for each of our pages.

### Data

Pages can have associated "data" that provides additional structured information that is needed to generate HTML. For most templating languages this is set using "frontmatter". This is Yaml formatted data separated on both sides by `---`.

Let's add some data to our `index.md` that sets the base layout we created above:

```md
---
layout: base
---

# Home page
```

Now our generated `_site/index.html` file should have all the extra stuff from the base layout.

We can also use data to pass information from a page to the layout. For example each page needs to have a unique `<title>` set in the `<head>`. We can set a title property in the frontmatter:

```md
---
layout: base
title: Home
---

# Home page
```

Then we can use that data in our layout:

```js
exports.render = (data) => {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.title} | My website</title>
      </head>
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

Don't forget to add the `layout` and `title` data to any other pages you've made.

### Collections

Let's add some blog posts to our site. Eleventy makes this easy: it's the same as all the other pages.

Create a `blog/` folder containing a couple of markdown files containing example content. Remember to set the layout and title data for each post.

You should now be able to access your posts at `/blog/your-file-name/`. The HTML pages are generated, but the only way to access them is to go directly to the URL. Ideally we want to list our posts on the homepage so users can click straight through to the one they want to read.

We can use Eleventy's "collections" to group pages together in our `data` object. We'll put each blog post into the same collection by setting `tags: blog` in their frontmatter data.

All collections are available on the `data` object. We can see this by logging them in our `base.11ty.js` layout: `console.log(data.collections.blog)`. You should see an array of objects representing each blog page.

We can iterate over this array to render a link to each blog post:

```js
exports.render = (data) => {
  const posts = data.collections.blog;
  let postItems = "";
  for (let post of posts) {
    postItems += `<li><a href="${post.url}">${post.data.title}</a></li>`;
  }
  // ... render the <li>s in your UI somehow
};
```
