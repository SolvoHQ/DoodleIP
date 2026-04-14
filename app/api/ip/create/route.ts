import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ARCHETYPE_BY_KEY, FEATURE_CHIPS, VERTICALS, type ArchetypeKey } from "@/lib/archetypes";
import { generateCandidates } from "@/lib/ip";

export async function POST(req: NextRequest) {
  // Authenticate the caller
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

  const {
    archetypeKey,
    chipKeys,
    description,
    verticalKey,
  } = body as {
    archetypeKey?: string;
    chipKeys?: string[];
    description?: string;
    verticalKey?: string;
  };

  const archetype = archetypeKey ? ARCHETYPE_BY_KEY[archetypeKey as ArchetypeKey] : undefined;
  if (!archetype) return NextResponse.json({ error: "invalid archetypeKey" }, { status: 400 });

  const vertical = VERTICALS.find((v) => v.key === verticalKey) ?? VERTICALS[0];

  const chips = (chipKeys ?? [])
    .map((k) => FEATURE_CHIPS.find((c) => c.key === k))
    .filter((c): c is NonNullable<typeof c> => c !== undefined)
    .slice(0, 3); // cap at 3 chips

  const safeDescription = (description ?? "").slice(0, 200);

  try {
    const { prompt, candidates } = await generateCandidates(user.id, {
      archetype,
      chips,
      description: safeDescription,
      vertical,
    });
    return NextResponse.json({ prompt, candidates });
  } catch (err) {
    const message = (err as Error).message ?? "unknown";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
