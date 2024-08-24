import type { Page, Post, Lang, ProcessedPage } from "../types/types";
import { JSDOM } from "jsdom";

const GRAPHQL_ENDPOINT = "https://www.apuntesdispersos.com/graphql";
const DEFAULT_TIMEOUT = 120000; // 120 seconds
const MAX_RETRIES = 3;

// Define a type for the GraphQL response
interface GraphQLResponse<T> {
  data: T;
  errors?: { message: string }[];
}

// Main function to execute GraphQL queries
// Main function to execute GraphQL queries
async function executeQuery<T>(
  query: string,
  variables: Record<string, any> = {},
  retries = MAX_RETRIES
): Promise<T> {
  // Convertir los códigos de idioma a mayúsculas
  const processedVariables = Object.entries(variables).reduce(
    (acc, [key, value]) => {
      if (key === "lang" || key.toLowerCase().includes("language")) {
        acc[key] = typeof value === "string" ? value.toUpperCase() : value;
      } else {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, any>
  );
  console.log("Processed variables:", processedVariables); // Añadir este log
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1}: Starting fetch to ${GRAPHQL_ENDPOINT}`);

      const fetchPromise = fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: processedVariables }),
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Fetch timeout")), DEFAULT_TIMEOUT)
      );

      const response: Response = await Promise.race([
        fetchPromise,
        timeoutPromise,
      ]);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<T> = await response.json();

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors.map((e) => e.message).join(", "));
      }

      return result.data;
    } catch (error) {
      // ... (el resto del manejo de errores permanece igual)
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
    lang: lang,
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
    lang: lang,
  });
  return data.posts.nodes;
}

export async function getHomePageContent(
  lang: Lang
): Promise<{ title: string; content: string } | null> {
  const query = `
    query GetHomePageByLang($lang: LanguageCodeFilterEnum!) {
      pages(where: { language: $lang }) {
        nodes {
          id
          title
          content
          isFrontPage
          language {
            slug
          }
        }
      }
    }
  `;

  try {
    const data = await executeQuery<{
      pages: {
        nodes: Array<{
          id: string;
          title: string;
          content: string;
          isFrontPage: boolean;
          language: { slug: string };
        }>;
      };
    }>(query, { lang }); // Removido .toLowerCase()

    const homePage = data?.pages.nodes.find(
      (page) => page.isFrontPage && page.language.slug === lang.toLowerCase()
    );

    if (homePage) {
      return {
        title: homePage.title,
        content: homePage.content,
      };
    } else {
      console.warn(`No home page content found for language: ${lang}`);
      return null;
    }
  } catch (error) {
    console.error(
      `Error fetching home page content for language ${lang}:`,
      error
    );
    return null;
  }
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
    lang: lang,
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

export async function getPageByURI(uri: string): Promise<Page | null> {
  const query = `
    query GetPageByURI($uri: String!) {
      pageBy(uri: $uri) {
        id
        title
        content
        uri
        slug
        language {
          slug
        }
      }
    }
  `;

  try {
    const data = await executeQuery<{ pageBy: Page | null }>(query, { uri });
    return data.pageBy;
  } catch (error) {
    console.error("Error fetching page by URI:", error);
    return null;
  }
}
