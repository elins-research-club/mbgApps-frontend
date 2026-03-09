import { createServerClient } from '@supabase/ssr'

/**
 * If using Fluid compute: Don't put this client in a global variable. Always create a new client within each
 * function when using it.
 */
/**
 * For Page Router: Pass cookies object from API route or getServerSideProps.
 * Usage example (API route):
 *   const supabase = createClient({ req, res });
 */
export function createClient({ req, res }) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          // Use req.headers.cookie to parse cookies
          const cookieHeader = req?.headers?.cookie || '';
          if (!cookieHeader) return [];
          // Simple parser, consider using 'cookie' package for more robust parsing
          return cookieHeader.split(';').map(cookie => {
            const [name, ...rest] = cookie.trim().split('=');
            return { name, value: rest.join('=') };
          });
        },
        setAll(cookiesToSet) {
          // Set cookies in response (API route or getServerSideProps)
          if (!res || typeof res.setHeader !== 'function') return;
          cookiesToSet.forEach(({ name, value, options }) => {
            let cookieStr = `${name}=${value}`;
            if (options) {
              if (options.maxAge) cookieStr += `; Max-Age=${options.maxAge}`;
              if (options.path) cookieStr += `; Path=${options.path}`;
              if (options.domain) cookieStr += `; Domain=${options.domain}`;
              if (options.secure) cookieStr += `; Secure`;
              if (options.httpOnly) cookieStr += `; HttpOnly`;
              if (options.sameSite) cookieStr += `; SameSite=${options.sameSite}`;
            }
            res.setHeader('Set-Cookie', cookieStr);
          });
        },
      },
    }
  );
}
