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
          <a href="/blog">Blog</a>
        </nav>
        ${data.content}
      </body>
    </html>
  `;
};
