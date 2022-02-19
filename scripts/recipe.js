// Menu: Recipe
// Description: Write a quick recipe
// Author: Bill Beckelman
// Shortcut: command option r
// Twitter: @beckelmw

const dateFns = await npm("date-fns");
const filenamify = await npm("filenamify");
const prettier = await npm("prettier");

const recipeDirectory = await env(
  "RECIPE_DIRECTORY",
  `Where do you want your recipes to be saved?`
);

const ingredients = await textarea({ placeholder: "Ingredients" });
const instructions = await textarea({ placeholder: "Instructions" });
const introduction = await textarea({ placeholder: "Introduction" });

const today = dateFns.format(new Date(), "yyyy-MM-dd");
const title = await arg({
  placeholder: "What do you want to name this recipe?",
  hint: "Liver and onions",
});

function createList(txt) {
  return txt
    .split("\n")
    .map((l) => `- ${l}`)
    .join("\n");
}

const md = `---
title: ${title}
date: ${today}
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

const filename = filenamify(`${title.toLowerCase().replace(/ /g, "-")}.md`, {
  replacement: "-",
});

await writeFile(path.join(recipeDirectory, filename), prettyMd);
