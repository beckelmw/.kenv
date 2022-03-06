// Menu: Recipe
// Description: Write a quick recipe
// Author: Bill Beckelman
// Shortcut: command option r
// Twitter: @beckelmw

import "@johnlindquist/kit";
import githubUpload from "../lib/github-upload.js";

const dateFns = await npm("date-fns");
const prettier = await npm("prettier");
const slugify = await npm("@sindresorhus/slugify");

const ingredients = await textarea({ placeholder: "Ingredients" });
const instructions = await textarea({ placeholder: "Instructions" });
const introduction = await textarea({ placeholder: "Introduction" });

const today = dateFns.format(new Date(), "yyyy-MM-dd");
const title = await arg({
  placeholder: "What do you want to name this recipe?",
  hint: "Liver and onions",
});

const cuisine = await arg({
  placeholder: "What cuisine is this recipe?",
  hint: "Mexican",
});

function createList(txt) {
  return txt
    .split("\n")
    .map((l) => `- ${l}`)
    .join("\n");
}

const filename = `${slugify(title)}.md`;

const md = `---
title: ${title}
date: ${today}
cuisine: ${cuisine}
url: /recipes/${filename}
---
${introduction}

## Ingredients

${createList(ingredients)}

## Instructions

${createList(instructions)}
`;

// prettify the markdown
const prettyMd = await prettier.format(md, {
  parser: "markdown",
  arrowParens: "avoid",
  bracketSpacing: false,
  embeddedLanguageFormatting: "auto",
  htmlWhitespaceSensitivity: "css",
  insertPragma: false,
  jsxBracketSameLine: false,
  jsxSingleQuote: false,
  printWidth: 80,
  proseWrap: "always",
  quoteProps: "as-needed",
  requirePragma: false,
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: "all",
  useTabs: false,
  vueIndentScriptAndStyle: false,
});

const { content } = await githubUpload(`recipes/${filename}`, prettyMd);
await $`open ${content.html_url}`;
