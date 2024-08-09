import type { Page, Post } from "../types/types";

const GRAPHQL_ENDPOINT = "https://www.apuntesdispersos.com/graphql";

async function fetchWithTimeout(
  resource: string,
  options: RequestInit & { timeout?: number } = {}
) {
  const { timeout = 30000 } = options; // 30 segundos de timeout por defecto

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });

  clearTimeout(id);

  return response;
}

async function fetchGraphQLWithRetry(
  query: string,
  variables = {},
  maxRetries = 3,
  timeout = 30000
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetchWithTimeout(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
        timeout: timeout,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors.map((e: Error) => e.message).join(", "));
      }

      return result.data;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) throw error;
      // Espera exponencial entre reintentos
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, i))
      );
    }
  }
}

export async function getPages(): Promise<Page[]> {
  const query = `
    query GetPages {
      pages(first: 100) {
        nodes {
          id
          title
          slug
          uri
        }
      }
    }
  `;

  const data = await fetchGraphQLWithRetry(query);
  return data.pages.nodes;
}

export async function getPosts(): Promise<Post[]> {
  const query = `
    query GetPosts {
      posts(first: 100) {
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

  const data = await fetchGraphQLWithRetry(query);
  return data.posts.nodes;
}

export async function getHomePageContent(): Promise<{
  title: string;
  content: string;
}> {
  const query = `
    query GetHomePageContent {
      page(id: "home", idType: URI) {
        title
        content
      }
    }
  `;

  const data = await fetchGraphQLWithRetry(query);
  return data.page;
}

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

  const data = await fetchGraphQLWithRetry(query, { slug });
  return data.page;
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const query = `
    query GetPostBySlug($slug: ID!) {
      post(id: $slug, idType: SLUG) {
        id
        title
        slug
        uri
        date
        content
        excerpt
      }
    }
  `;

  const data = await fetchGraphQLWithRetry(query, { slug });
  return data.post;
}

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

  const data = await fetchGraphQLWithRetry(query);
  return data.pages.nodes.map((page: { slug: string }) => page.slug);
}

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

  const data = await fetchGraphQLWithRetry(query);
  return data.pages.nodes
    .map((page: { uri: string }) => page.uri.replace(/^\/|\/$/g, ""))
    .filter((uri: string) => uri !== ""); // Filtra las URIs vacías
}

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

  const data = await fetchGraphQLWithRetry(query);
  return data.posts.nodes.map((post: { slug: string }) => post.slug);
}

export async function getPageByURI(uri: string): Promise<Page> {
  const query = `
    query GetPageByURI($uri: ID!) {
      page(id: $uri, idType: URI) {
        id
        title
        uri
        content
      }
    }
  `;

  const data = await fetchGraphQLWithRetry(query, { uri });
  return data.page;
}
