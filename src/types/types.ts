export interface Page {
  id: string;
  title: string;
  slug: string;
  uri: string;
  content: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  uri: string;
  date: string;
  excerpt: string;
  content: string;
}
