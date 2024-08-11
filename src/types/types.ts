export interface Page {
  id: string;
  title: string;
  uri: string;
  content: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
      mediaDetails: {
        width: number;
        height: number;
      };
    };
  };
  blocks?: Array<{
    attributes?: {
      url?: string;
      alt?: string;
      caption?: string;
      height?: number;
      width?: number;
    };
  }>;
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
