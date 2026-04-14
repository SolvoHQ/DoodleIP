import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getPoseLibrarySignedUrls, BASIC_POSES } from "@/lib/ip";

export async function GET(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll() {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const urls = await getPoseLibrarySignedUrls(user.id);

  return NextResponse.json({
    totalExpected: BASIC_POSES.length,
    completed: urls.length,
    poses: urls,
  });
}
