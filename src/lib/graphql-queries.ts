import type { Page, Post, Lang, ProcessedPage } from "../types/types";
import { JSDOM } from "jsdom";

const GRAPHQL_ENDPOINT = "https://www.apuntesdispersos.com/graphql";
const DEFAULT_TIMEOUT = 60000; // 60 seconds
const MAX_RETRIES = 3;

// Main function to execute GraphQL queries
async function executeQuery<T>(
  query: string,
  variables = {},
  retries = MAX_RETRIES
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors.map((e: any) => e.message).join(", "));
      }

      return result.data;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, i))
      );
    }
  }
  throw new Error(`Failed after ${retries} attempts`);
}

// Function to get pages
export async function getPages(lang: Lang): Promise<Page[]> {
  const query = `
    query GetPages($lang: LanguageCodeFilterEnum!) {
      pages(first: 100, where: { language: $lang }) {
        nodes {
          id
          title
          slug
          uri
        }
      }
    }
  `;

  const { pages } = await executeQuery<{ pages: { nodes: Page[] } }>(query, {
    lang: lang.toUpperCase(),
  });
  return pages.nodes;
}

// Function to get posts
export async function getPosts(lang: Lang): Promise<Post[]> {
  const query = `
    query GetPosts($lang: LanguageCodeFilterEnum!) {
      posts(first: 100, where: { language: $lang }) {
        nodes {
          id
          title
          slug
          uri
          date
          excerpt
        }
      }
    }
  `;
  const data = await executeQuery<{ posts: { nodes: Post[] } }>(query, {
    lang: lang.toUpperCase(),
  });
  return data.posts.nodes;
}

// Function to get home page content
export async function getHomePageContent(
  lang: Lang
): Promise<{ title: string; content: string }> {
  const query = `
    query GetHomePageContent($lang: LanguageCodeEnum!) {
      pages(where: { language: $lang, status: PUBLISH }, first: 1) {
        nodes {
          title
          content
        }
      }
    }
  `;

  const data = await executeQuery<{
    pages: { nodes: Array<{ title: string; content: string }> };
  }>(query, { lang: lang.toUpperCase() });
  return data.pages.nodes[0] || { title: "", content: "" };
}

// Function to get a post by slug
export async function getPostBySlug(slug: string, lang: Lang): Promise<Post> {
  const query = `
    query GetPostBySlug($slug: ID!, $lang: LanguageCodeEnum!) {
      post(id: $slug, idType: SLUG) {
        id
        title
        slug
        uri
        date
        content
        excerpt
        language {
          code
        }
      }
    }
  `;
  const data = await executeQuery<{ post: Post }>(query, {
    slug,
    lang: lang.toUpperCase(),
  });
  return data.post;
}

// Function to get a page by slug
export async function getPageBySlug(slug: string): Promise<Page> {
  const query = `
    query GetPageBySlug($slug: ID!) {
      page(id: $slug, idType: URI) {
        id
        title
        slug
        uri
        content
      }
    }
  `;

  const data = await executeQuery<{ page: Page }>(query, { slug });
  return data.page;
}

/// Function to get all pages with specific content blocks
export async function getAllPages(): Promise<ProcessedPage[]> {
  const query = `
    query GetAllPages {
      pages(first: 1000) {
        nodes {
          id
          title
          slug
          uri
          language {
            slug
          }
          content
        }
      }
    }
  `;
  try {
    const data = await executeQuery<{ pages: { nodes: Page[] } }>(query);

    return data.pages.nodes.map((page) => {
      let images: ProcessedPage["images"] = [];
      let paragraphs: string[] = [];
      let headers: string[] = [];

      if (page.content) {
        const dom = new JSDOM(page.content);
        const doc = dom.window.document;

        images = Array.from(doc.querySelectorAll("img")).map((img) => ({
          src: img.getAttribute("src") || "",
          alt: img.getAttribute("alt") || "",
          width: parseInt(img.getAttribute("width") || "0", 10),
          height: parseInt(img.getAttribute("height") || "0", 10),
        }));
        paragraphs = Array.from(doc.querySelectorAll("p")).map(
          (p) => p.innerHTML || ""
        );
        headers = Array.from(
          doc.querySelectorAll("h1, h2, h3, h4, h5, h6")
        ).map((h) => h.innerHTML || "");
      }

      return {
        ...page,
        images,
        paragraphs,
        headers,
      };
    });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return [];
  }
}
// Function to get all page slugs
export async function getAllPageSlugs(): Promise<string[]> {
  const query = `
    query GetAllPageSlugs {
      pages(first: 1000) {
        nodes {
          slug
        }
      }
    }
  `;

  const data = await executeQuery<{ pages: { nodes: { slug: string }[] } }>(
    query
  );
  return data.pages.nodes.map((page) => page.slug);
}

// Function to get all page URIs
export async function getAllPageURIs(): Promise<string[]> {
  const query = `
    query GetAllPageURIs {
      pages(first: 1000) {
        nodes {
          uri
        }
      }
    }
  `;

  const data = await executeQuery<{ pages: { nodes: { uri: string }[] } }>(
    query
  );
  return data.pages.nodes
    .map((page) => page.uri.replace(/^\/|\/$/g, ""))
    .filter((uri) => uri !== "");
}

// Function to get all post slugs
export async function getAllPostSlugs(): Promise<string[]> {
  const query = `
    query GetAllPostSlugs {
      posts(first: 1000) {
        nodes {
          slug
        }
      }
    }
  `;

  const data = await executeQuery<{ posts: { nodes: { slug: string }[] } }>(
    query
  );
  return data.posts.nodes.map((post) => post.slug);
}

// Function to get a page by URI
export async function getPageByURI(uri: string): Promise<Page | null> {
  console.log(`Fetching page for URI: ${uri}`);
  const query = `
    query GetPageByURI($uri: ID!) {
      pageBy(uri: $uri) {
        id
        title
        uri
        content
        excerpt
        language {
          slug
        }
        featuredImage {
          node {
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
      }
    }
  `;

  try {
    const data = await executeQuery<{ pageBy: Page | null }>(query, { uri });
    console.log(`Successfully fetched page for URI: ${uri}`);
    return data.pageBy;
  } catch (error) {
    console.error(`Failed to fetch page for URI: ${uri}`, error);
    return null;
  }
}
