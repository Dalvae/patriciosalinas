import type { Page, Post } from "../types/types";

const GRAPHQL_ENDPOINT = "https://www.apuntesdispersos.com/graphql";
const DEFAULT_TIMEOUT = 60000; // 60 segundos
const MAX_RETRIES = 5;

async function fetchWithTimeout(
  resource: string,
  options: RequestInit & { timeout?: number } = {}
) {
  const { timeout = DEFAULT_TIMEOUT } = options;

  const controller = new AbortController();
  const id = setTimeout(() => {
    controller.abort();
    console.error(`Request timed out after ${timeout}ms`);
  }, timeout);

  try {
    console.log(`Fetching ${resource}...`);
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      console.error(
        `Response headers:`,
        Object.fromEntries(response.headers.entries())
      );
      const text = await response.text();
      console.error(`Response body:`, text);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error(`Fetch error:`, error);
    throw error;
  } finally {
    clearTimeout(id);
  }
}

async function fetchGraphQLWithRetry(
  query: string,
  variables = {},
  maxRetries = MAX_RETRIES,
  timeout = DEFAULT_TIMEOUT
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Attempt ${i + 1} for query: ${query.slice(0, 50)}...`);
      const response = await fetchWithTimeout(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
        timeout: timeout,
      });

      const result = await response.json();

      if (result.errors) {
        console.error(
          "GraphQL errors:",
          JSON.stringify(result.errors, null, 2)
        );
        throw new Error(result.errors.map((e: any) => e.message).join(", "));
      }

      return result.data;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (error instanceof AggregateError) {
        console.error("AggregateError details:", error.errors);
      }
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, i))
      );
    }
  }
  throw new Error(`Failed after ${maxRetries} attempts`);
}

async function executeQuery<T>(query: string, variables = {}): Promise<T> {
  try {
    return await fetchGraphQLWithRetry(query, variables);
  } catch (error) {
    console.error("GraphQL query failed:", error);
    throw error;
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

  const data = await executeQuery<{ pages: { nodes: Page[] } }>(query);
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

  const data = await executeQuery<{ posts: { nodes: Post[] } }>(query);
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

  const data = await executeQuery<{ page: { title: string; content: string } }>(
    query
  );
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

  const data = await executeQuery<{ page: Page }>(query, { slug });
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

  const data = await executeQuery<{ post: Post }>(query, { slug });
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

  const data = await executeQuery<{ pages: { nodes: { slug: string }[] } }>(
    query
  );
  return data.pages.nodes.map((page) => page.slug);
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

  const data = await executeQuery<{ pages: { nodes: { uri: string }[] } }>(
    query
  );
  return data.pages.nodes
    .map((page) => page.uri.replace(/^\/|\/$/g, ""))
    .filter((uri) => uri !== "");
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

  const data = await executeQuery<{ posts: { nodes: { slug: string }[] } }>(
    query
  );
  return data.posts.nodes.map((post) => post.slug);
}

export async function getPageByURI(uri: string): Promise<Page> {
  console.log(`Fetching page for URI: ${uri}`);
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

  try {
    const data = await fetchGraphQLWithRetry(query, { uri });
    console.log(`Successfully fetched page for URI: ${uri}`);
    return data.page;
  } catch (error) {
    console.error(`Failed to fetch page for URI: ${uri}`, error);
    throw error;
  }
}
