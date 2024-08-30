import type { Page, Post, Lang, ProcessedPage } from "../types/types";
import { JSDOM } from "jsdom";

const GRAPHQL_ENDPOINT = "https://www.apuntesdispersos.com/graphql";
const DEFAULT_TIMEOUT = 120000; // 120 seconds
const MAX_RETRIES = 20;

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
  const processedVariables = {
    ...variables,
    lang: variables.lang?.toUpperCase(),
  };
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
          uri
          title
          slug
          uri
          isFrontPage
          content
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
export async function getAllPagesLang(lang: Lang): Promise<Page[]> {
  const query = `
    query GetPages($lang: LanguageCodeFilterEnum!) {
      pages(first: 100, where: { language: $lang }) {
        nodes {
          id
          uri
          title
          slug
          uri
          isFrontPage
        }
      }
    }
  `;

  const { pages } = await executeQuery<{ pages: { nodes: Page[] } }>(query, {
    lang: lang,
  });

  return pages.nodes;
}
