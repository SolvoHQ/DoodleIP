import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Auth gate for /app/* routes. Unauthenticated users are redirected to /app/login.
 * The /app/login and /app/auth/callback paths are exempt.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAppRoute = pathname.startsWith("/app");
  const isPublicAppRoute =
    pathname === "/app/login" || pathname.startsWith("/app/auth/");

  if (!isAppRoute || isPublicAppRoute) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/app/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ["/app/:path*"],
};
