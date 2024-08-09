export interface WordPressPage {
  slug: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
    }>;
  };
}

export interface WordPressPost extends WordPressPage {
  // Añade aquí propiedades específicas de posts si las hay
}
