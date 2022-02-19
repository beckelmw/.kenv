// Name: Plant seedling
// Description: Plant a seedling in your digital garden
// Author: Bill Beckelman

import "@johnlindquist/kit";

const GITHUB_TOKEN = await env("GITHUB_TOKEN");
const GITHUB_OWNER = await env("GITHUB_OWNER");
const GARDEN_REPO = await env("GARDEN_REPO");
const filenamify = await npm("filenamify");
const dateFns = await npm("date-fns");

const title = await arg("What do you want to name this seedling?");
const seedling = await textarea({ placeholder: "Seedling to plant" });
const area = await arg("What area of the garden?", [
  "Code",
  "Flying",
  "Recipes",
  "Hiking",
  "Family",
]);

const filename = filenamify(`${title}.md`.toLowerCase().replace(/ /g, "-"));
const today = dateFns.format(new Date(), "yyyy-MM-dd");

const md = `---
title: ${title}
created: ${today}
category: ${area.toLowerCase()}
---
${seedling}
`;

const res = await fetch(
  `https://api.github.com/repos/${GITHUB_OWNER}/${GARDEN_REPO}/contents/${area.toLowerCase()}/${filename}`,
  {
    method: "PUT",
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      accept: "application/vnd.github.v3+json",
    },
    body: JSON.stringify({
      // https://developer.mozilla.org/en-US/docs/Glossary/Base64#solution_1_%E2%80%93_escaping_the_string_before_encoding_it
      content: btoa(unescape(encodeURIComponent(md))),
      message: `Added ${filename}`,
    }),
  }
);

if (!res.ok) {
  const txt = await res.text();
  show(txt);
}

const { content } = await res.json();

await $`open ${content.html_url}`;
