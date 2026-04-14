import { randomUUID } from "node:crypto";
import { supabaseServer } from "./supabase-server";
import { generateImage, generateImageWithReference } from "./gemini";
import { buildIpPrompt, type IpPromptInput } from "./ip-prompts";

/**
 * The 6 basic poses generated during onboarding as the "meet your IP"
 * reveal. NOT used by daily carousel generation (that regenerates scenes
 * per post from the reference image). These purely exist so the user
 * sees their IP in motion once at the end of onboarding.
 */
export const BASIC_POSES: readonly { key: string; prompt: string }[] = [
  { key: "waving",   prompt: "The exact same character as the reference image, waving one hand in greeting, cheerful." },
  { key: "thinking", prompt: "The exact same character as the reference image, in a thinking pose — one hand on chin, slightly tilted head." },
  { key: "pointing", prompt: "The exact same character as the reference image, pointing to the right with one arm extended." },
  { key: "phone",    prompt: "The exact same character as the reference image, holding a small smartphone in both hands, looking at the screen." },
  { key: "sitting",  prompt: "The exact same character as the reference image, sitting cross-legged on the ground, relaxed." },
  { key: "laughing", prompt: "The exact same character as the reference image, laughing happily, eyes closed into little arcs." },
];

const POSE_PROMPT_SUFFIX =
  " Preserve the character perfectly: same shape, face, proportions, colors, and the same deliberately imperfect hand-drawn style as the reference. ONLY the pose changes. Hand-drawn doodle, single uneven black pen stroke on white background. No digital polish.";

export interface GeneratedCandidate {
  tempKey: string;      // opaque key to identify this candidate for confirmation
  imagePath: string;    // Storage path (not yet in `ips` table)
  signedUrl: string;    // signed URL for the client to display
}

/**
 * Generate 4 candidate IPs in parallel and upload each to the
 * ip-references/{user_id}/tmp/{tempKey}.png Storage path.
 *
 * Returns candidates with signed URLs valid for 1 hour.
 */
export async function generateCandidates(
  userId: string,
  input: IpPromptInput
): Promise<{ prompt: string; candidates: GeneratedCandidate[] }> {
  const prompt = buildIpPrompt(input);

  const tasks = Array.from({ length: 4 }, async () => {
    const tempKey = randomUUID();
    const imagePath = `${userId}/tmp/${tempKey}.png`;
    const img = await generateImage(prompt);

    const { error: uploadError } = await supabaseServer.storage
      .from("ip-references")
      .upload(imagePath, img, { contentType: "image/png", upsert: true });
    if (uploadError) throw new Error(`upload failed: ${uploadError.message}`);

    const { data: signed, error: signError } = await supabaseServer.storage
      .from("ip-references")
      .createSignedUrl(imagePath, 60 * 60);
    if (signError) throw new Error(`sign failed: ${signError.message}`);

    return { tempKey, imagePath, signedUrl: signed.signedUrl };
  });

  const candidates = await Promise.all(tasks);
  return { prompt, candidates };
}

/**
 * Persist a user's chosen candidate as their IP, move it from tmp/ to
 * the stable path, and return the created IP id.
 *
 * Does NOT generate the pose library (that's async, kicked off separately).
 */
export async function confirmChosenCandidate(
  userId: string,
  args: {
    chosenTempPath: string;   // e.g. "{userId}/tmp/{tempKey}.png"
    archetypeSeed: string;
    creationPrompt: string;
    name: string | null;
  }
): Promise<{ ipId: string; referencePath: string }> {
  const stablePath = `${userId}/ip.png`;

  // Copy object within bucket
  const { error: copyErr } = await supabaseServer.storage
    .from("ip-references")
    .copy(args.chosenTempPath, stablePath);
  if (copyErr) throw new Error(`copy failed: ${copyErr.message}`);

  // Insert IP row
  const { data: ipRow, error: insertErr } = await supabaseServer
    .from("ips")
    .upsert(
      {
        user_id: userId,
        name: args.name,
        archetype_seed: args.archetypeSeed,
        creation_prompt: args.creationPrompt,
        reference_image_path: stablePath,
        pose_library: [],
      },
      { onConflict: "user_id" }
    )
    .select("id")
    .single();
  if (insertErr || !ipRow) throw new Error(`insert failed: ${insertErr?.message}`);

  // Best-effort cleanup of temp candidates (don't fail overall if cleanup fails)
  const tmpPrefix = `${userId}/tmp/`;
  const { data: tmpObjects } = await supabaseServer.storage
    .from("ip-references")
    .list(tmpPrefix);
  if (tmpObjects && tmpObjects.length > 0) {
    const paths = tmpObjects.map((o) => tmpPrefix + o.name);
    await supabaseServer.storage.from("ip-references").remove(paths).catch(() => {});
  }

  return { ipId: ipRow.id, referencePath: stablePath };
}

/**
 * Generate the basic pose library for a user's IP.
 * Called asynchronously — the onboarding UI polls /api/ip/poses to see progress.
 *
 * Fetches the reference image, calls Gemini with it + each pose prompt in
 * parallel, uploads each result, and updates the pose_library jsonb on the IP row.
 */
export async function generatePoseLibrary(userId: string): Promise<void> {
  // Fetch the IP row to find the reference image
  const { data: ipRow, error: fetchErr } = await supabaseServer
    .from("ips")
    .select("id, reference_image_path")
    .eq("user_id", userId)
    .single();
  if (fetchErr || !ipRow) throw new Error(`ip row missing: ${fetchErr?.message}`);

  const { data: refBlob, error: dlErr } = await supabaseServer.storage
    .from("ip-references")
    .download(ipRow.reference_image_path);
  if (dlErr || !refBlob) throw new Error(`reference download failed: ${dlErr?.message}`);
  const referenceBuffer = Buffer.from(await refBlob.arrayBuffer());

  const tasks = BASIC_POSES.map(async ({ key, prompt }) => {
    const fullPrompt = prompt + POSE_PROMPT_SUFFIX;
    const img = await generateImageWithReference(fullPrompt, referenceBuffer);

    const posePath = `${userId}/${key}.png`;
    const { error: upErr } = await supabaseServer.storage
      .from("ip-poses")
      .upload(posePath, img, { contentType: "image/png", upsert: true });
    if (upErr) throw new Error(`pose ${key} upload failed: ${upErr.message}`);

    return { key, path: posePath };
  });

  const poses = await Promise.all(tasks);

  const { error: updateErr } = await supabaseServer
    .from("ips")
    .update({ pose_library: poses })
    .eq("user_id", userId);
  if (updateErr) throw new Error(`pose library update failed: ${updateErr.message}`);
}

/**
 * Create short-lived signed URLs for a user's full pose library.
 */
export async function getPoseLibrarySignedUrls(
  userId: string
): Promise<Array<{ key: string; signedUrl: string }>> {
  const { data: ipRow } = await supabaseServer
    .from("ips")
    .select("pose_library")
    .eq("user_id", userId)
    .single();
  const library = (ipRow?.pose_library as Array<{ key: string; path: string }>) ?? [];

  return Promise.all(
    library.map(async ({ key, path }) => {
      const { data: signed } = await supabaseServer.storage
        .from("ip-poses")
        .createSignedUrl(path, 60 * 60);
      return { key, signedUrl: signed?.signedUrl ?? "" };
    })
  );
}
