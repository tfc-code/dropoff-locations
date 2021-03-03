import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';

/**
 * Returns the page query, or null if the page is not yet hydrated.
 * From https://github.com/vercel/next.js/issues/8259#issuecomment-650225962,
 * (`useRouter().query` in next.js initializes with an empty object).
 *
 * It's best that we wait until the query params exist before we render
 * our app. We want to only read the query on `componentDidMount` --
 * any further changes to the query, don't care about.
 */
export function useQuery(): ParsedUrlQuery {
  const router = useRouter();

  const hasQueryParams = /\[.+\]/.test(router.route) || /\?./.test(router.asPath);
  const ready = !hasQueryParams || Object.keys(router.query).length > 0;

  if (!ready) return null;

  return router.query;
}
