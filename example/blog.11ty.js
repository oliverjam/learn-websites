exports.data = {
  layout: "base",
  title: "Blog",
};

exports.render = (data) => {
  const posts = data.collections.blog;
  const lastThreePosts = posts.slice(-3).reverse();
  let postItems = "";
  for (let post of lastThreePosts) {
    postItems += `<li><a href="${post.url}">${post.data.title}</a></li>`;
  }
  return `
    <h1>My blog</h1>
    <ul>
      ${postItems}
    </ul>      
  `;
};
