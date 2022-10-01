const axios = require('axios');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const { exec } = require('child_process');
const fs = require('fs');

let url = process.argv[2];

const kebabCase = s => s
  .replace(/([a-z])([A-Z])/g, "$1-$2")
  .replace(/[\s_]+/g, '-')
  .replace(/[^a-zA-Z0-9]/g, '-')
  .toLowerCase();

axios.get(url).then(res => {
  let doc = new JSDOM(res.data);
  let reader = new Readability(doc.window.document);
  let article = reader.parse();
  let title = article.title;
  let s = "";
  s += `<h1>${title}</h1>`;
  s += article.content;

  let fileLocation = `${process.env.HOME}/monorepo/papers/papers/_papers-to-sort/${kebabCase(title)}.html`;

  fs.writeFileSync(fileLocation, s);
  exec(`pandoc "${fileLocation}" -o "${fileLocation}" --self-contained --template=${process.env.HOME}/.readability-template.html --metadata title="${title}"`);
});
