'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, Product } from '@/app/lib/data';

export default function ProductTableClient() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('title');

  const limit = 5; // 5 items per page as requested

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['products', { page, limit, search, sort }],
    queryFn: () =>
      fetchProducts({
        page,
        limit,
        search: search || undefined,
        sort, // will be sent as ?sort=title or ?sort=price
      }),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500 text-lg font-medium">
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center text-red-700 font-medium">
        Error loading products: {(error as Error).message}
      </div>
    );
  }

  const products = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search products by title..."
            className="w-full px-4 py-2.5 pl-10 rounded-lg border border-gray-300 
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-100 
                       outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // reset to page 1 when search changes
            }}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>

          {isFetching && search && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin">
              ↻
            </span>
          )}
        </div>

        <select
          className="w-full sm:w-56 px-4 py-2.5 rounded-lg border border-gray-300 
                     bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 
                     outline-none transition-all shadow-sm cursor-pointer"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
        >
          <option value="title">Sort by Title</option>
          <option value="price">Sort by Price</option>
        </select>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rating
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {products.map((product: Product) => (
                <tr
                  key={product.id}
                  className="hover:bg-blue-50/40 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {product.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-emerald-600 font-semibold">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 capitalize">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        product.stock > 20
                          ? 'bg-green-100 text-green-700'
                          : product.stock > 5
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                      <span className="mr-1">★</span>
                      {product.rating.rate.toFixed(1)} ({product.rating.count})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <div>
            Showing{' '}
            <span className="font-medium text-gray-900">
              {(page - 1) * limit + 1}–{Math.min(page * limit, total)}
            </span>{' '}
            of <span className="font-medium text-gray-900">{total}</span>
            {isFetching && <span className="ml-2 text-gray-400">(updating...)</span>}
          </div>

          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 
                         hover:bg-gray-50 hover:text-gray-900 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!hasPrevious || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>

            <span className="font-medium">
              Page {page} of {totalPages}
            </span>

            <button
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 
                         hover:bg-gray-50 hover:text-gray-900 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!hasNext || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}