const crypto = require("crypto");
const remark = require("remark");
const remarkHtml = require("remark-html");
const remarkRecommended = require("remark-preset-lint-recommended");

const transformMarkdown = markdown => {
  const html = remark()
    .use(remarkRecommended)
    .use(remarkHtml)
    .processSync(markdown)
    .toString();

  return {
    html,
    markdown
  };
};

const transformFrontmatter = frontmatter => ({
  ...frontmatter,
  features: frontmatter.features.map(feature => ({
    ...feature,
    description: transformMarkdown(feature.description)
  }))
});

exports.onCreateNode = ({ node, getNode, boundActionCreators }) => {
  const { createNode } = boundActionCreators;

  const newType = "MarkdownTransformedFrontmatter";
  const targetType = "MarkdownRemark";

  if (node.internal.type === targetType) {
    const {
      frontmatter,
      internal: { contentDigest }
    } = node;

    createNode({
      ...node,
      frontmatter: transformFrontmatter(frontmatter),
      id: `${node.id} >>> ${newType}`,
      internal: {
        contentDigest,
        type: newType
      }
    });
  }
};
