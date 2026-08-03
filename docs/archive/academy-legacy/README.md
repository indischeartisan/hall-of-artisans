# Legacy Academy preservation

This directory preserves the pre-V1 Academy implementation as migration reference only.
Nothing under this directory is loaded by the application at runtime.

## Contents

- `migration-source/legacy-lessons.json`: normalized export of the six legacy lessons.
- `runtime/src-pages/AcademyPage.tsx`: former React wrapper that injected global assets.
- `runtime/public-assets/`: exact former public runtime files.
- `runtime/source-assets/`: duplicate source-asset copies that existed outside `public`.

The linked Supabase project was checked before reset. It contained no `cms_entries`
rows with `content_type = 'academy_lesson'`, so no database cleanup migration was needed.
The historical CMS migration remains unchanged.
