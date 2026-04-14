-- DoodleIP v1 MVP — storage buckets
-- Three private buckets, owner-scoped access via the first path segment.

insert into storage.buckets (id, name, public)
values
  ('ip-references', 'ip-references', false),
  ('ip-poses', 'ip-poses', false),
  ('post-scenes', 'post-scenes', false)
on conflict (id) do nothing;

-- Policy: a user can read and write objects under their own user_id folder
-- Path convention: {bucket}/{user_id}/... for ip-references and ip-poses
-- For post-scenes the path is {post_id}/... so we join via posts table

-- ip-references + ip-poses: first path segment = user_id
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and policyname = 'ip_refs_owner'
  ) then
    create policy ip_refs_owner on storage.objects
      for all using (
        bucket_id = 'ip-references'
        and (storage.foldername(name))[1] = auth.uid()::text
      ) with check (
        bucket_id = 'ip-references'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and policyname = 'ip_poses_owner'
  ) then
    create policy ip_poses_owner on storage.objects
      for all using (
        bucket_id = 'ip-poses'
        and (storage.foldername(name))[1] = auth.uid()::text
      ) with check (
        bucket_id = 'ip-poses'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and policyname = 'post_scenes_owner'
  ) then
    create policy post_scenes_owner on storage.objects
      for all using (
        bucket_id = 'post-scenes'
        and exists (
          select 1 from public.posts p
          where p.id::text = (storage.foldername(name))[1]
            and p.user_id = auth.uid()
        )
      ) with check (
        bucket_id = 'post-scenes'
        and exists (
          select 1 from public.posts p
          where p.id::text = (storage.foldername(name))[1]
            and p.user_id = auth.uid()
        )
      );
  end if;
end $$;
