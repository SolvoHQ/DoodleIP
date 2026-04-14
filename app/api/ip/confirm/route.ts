import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { confirmChosenCandidate, generatePoseLibrary } from "@/lib/ip";

export async function POST(req: NextRequest) {
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const { chosenImagePath, archetypeSeed, creationPrompt, name } = body as {
    chosenImagePath?: string;
    archetypeSeed?: string;
    creationPrompt?: string;
    name?: string;
  };

  if (!chosenImagePath || !chosenImagePath.startsWith(`${user.id}/tmp/`)) {
    return NextResponse.json({ error: "invalid chosenImagePath" }, { status: 400 });
  }
  if (!archetypeSeed || !creationPrompt) {
    return NextResponse.json({ error: "archetypeSeed and creationPrompt required" }, { status: 400 });
  }

  try {
    const { ipId } = await confirmChosenCandidate(user.id, {
      chosenTempPath: chosenImagePath,
      archetypeSeed,
      creationPrompt,
      name: (name ?? "").trim() || null,
    });

    // Kick off pose library generation in the background.
    // We don't await — the client polls /api/ip/poses.
    generatePoseLibrary(user.id).catch((err) => {
      console.error("pose library generation failed", err);
    });

    return NextResponse.json({ ipId });
  } catch (err) {
    const message = (err as Error).message ?? "unknown";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
