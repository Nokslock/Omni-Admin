import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const LOGIN_PATH = "/admin/login";
const DASHBOARD_PATH = "/admin/dashboard";

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() revalidates the token with Supabase Auth (don't trust getSession here).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginRoute = request.nextUrl.pathname === LOGIN_PATH;

  async function isAdmin(authId: string): Promise<boolean> {
    // Role lives in public.users (RLS-locked) → read it with the service role.
    const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
    const { data } = await admin
      .from("users")
      .select("role")
      .eq("auth_id", authId)
      .maybeSingle();
    return data?.role === "admin";
  }

  if (isLoginRoute) {
    // Already-authenticated admins skip the login screen.
    if (user && (await isAdmin(user.id))) {
      return redirectWithCookies(request, DASHBOARD_PATH, response);
    }
    return response;
  }

  // Protected /admin/* routes.
  if (!user) {
    return redirectWithCookies(request, LOGIN_PATH, response);
  }
  if (!(await isAdmin(user.id))) {
    return redirectWithCookies(request, `${LOGIN_PATH}?error=not_admin`, response);
  }

  return response;
}

function redirectWithCookies(
  request: NextRequest,
  to: string,
  source: NextResponse,
) {
  const [pathname, search] = to.split("?");
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = search ? `?${search}` : "";
  const redirect = NextResponse.redirect(url);
  for (const cookie of source.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  return redirect;
}

export const config = {
  matcher: ["/admin/:path*"],
};
