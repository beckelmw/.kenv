import "@johnlindquist/kit";

export default async (filePath, content) => {
  const GITHUB_TOKEN = await env("GITHUB_TOKEN");
  const GITHUB_OWNER = await env("GITHUB_OWNER");
  const GARDEN_REPO = await env("GARDEN_REPO");

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GARDEN_REPO}/contents/${filePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        // https://developer.mozilla.org/en-US/docs/Glossary/Base64#solution_1_%E2%80%93_escaping_the_string_before_encoding_it
        content: btoa(unescape(encodeURIComponent(content))),
        message: `Added ${filePath}`,
      }),
    }
  );

  if (!res.ok) {
    const txt = await res.text();
    show(txt);
  } else {
    return await res.json();
  }
};
