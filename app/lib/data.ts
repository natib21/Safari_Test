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
 
}: ProductQueryParams = {}): Promise<ProductsResponse> {
  const params = new URLSearchParams();

  if (page)   params.set("page",   page.toString());
  if (limit)  params.set("limit",  limit.toString());
  // if (search)   params.set("search", search);
  // if (category) params.set("category", category);
  // if (sort)     params.set("sort", sort);

  const url = `https://fakeapi.net/products?${params.toString()}`;

  const res = await fetch(url, {
    cache: "no-store",          // or "force-cache" if data rarely changes
    // next: { revalidate: 3600 } ← if you want ISR
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`);
  }

  return res.json();
}