import mongoose, { Model, QueryOptions } from 'mongoose';

import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
  PaginatedData,
  PaginationMeta,
  PaginationOptions,
} from '../http/response.types';

type QueryFilter<T> = mongoose.QueryFilter<T>;

export function buildPaginationMeta(
  page: number,
  limit: number,
  totalItems: number,
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}

export function normalizePaginationOptions(
  options: PaginationOptions,
): Required<PaginationOptions> {
  let page = options.page ?? DEFAULT_PAGE;
  let limit = options.limit ?? DEFAULT_LIMIT;

  page = Math.max(1, Math.floor(page));
  limit = Math.max(1, Math.min(MAX_LIMIT, Math.floor(limit)));

  return { page, limit };
}

export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

export async function paginateQuery<T>(
  model: Model<T>,
  filter: QueryFilter<T>,
  paginationOptions: PaginationOptions,
  queryOptions: QueryOptions = {},
  populate?: string | string[] | { path: string; select?: string }[],
): Promise<PaginatedData<T>> {
  const { page, limit } = normalizePaginationOptions(paginationOptions);
  const skip = calculateSkip(page, limit);

  let query = model.find(filter, null, queryOptions).skip(skip).limit(limit);

  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach((p) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        query = query.populate(p);
      });
    } else {
      query = query.populate(populate);
    }
  }

  const [items, totalItems] = await Promise.all([
    query.lean().exec(),
    model.countDocuments(filter).exec(),
  ]);

  return {
    items: items as T[],
    meta: buildPaginationMeta(page, limit, totalItems),
  };
}

export function emptyPaginatedData<T>(
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
): PaginatedData<T> {
  return {
    items: [],
    meta: buildPaginationMeta(page, limit, 0),
  };
}
