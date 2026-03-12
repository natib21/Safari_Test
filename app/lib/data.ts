// app/lib/data.ts

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  brand: string;
  stock: number;
  image: string;
  specs: Record<string, string | number>;
  rating: {
    rate: number;
    count: number;
  };
}

export interface ProductsResponse {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: string;
}

export async function fetchProducts({
  page = 1,
  limit = 10,
  search,
  category,
  sort,
}: ProductQueryParams = {}): Promise<ProductsResponse> {
  const params = new URLSearchParams();

  // Always include pagination params
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  // Add optional filters/search/sort only if provided
  if (search) {
    params.set("search", search.trim());
  }
  if (category) {
    params.set("category", category);
  }
  if (sort) {
    params.set("sort", sort);
    // If your API needs sort direction, you could extend later e.g.:
    // params.set("order", "asc"); // or make sort = "price-desc"
  }

  const url = `https://fakeapi.net/products?${params.toString()}`;

  const res = await fetch(url, {
    cache: "no-store", // always fresh data (disable if you want caching)
    // next: { revalidate: 3600 } // ← use this for ISR if data changes slowly
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  // Optional: basic validation / fallback
  if (!json.data || !Array.isArray(json.data) || !json.pagination) {
    throw new Error("Invalid response format from API");
  }

  return json as ProductsResponse;
}