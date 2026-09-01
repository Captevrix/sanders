# Staff dashboard for managing listings

A password-protected back office for the Sanders team to manage the homes shown on the public site, upload photos, publish or hide listings, and read the leads coming in from the site's forms. The public pages stop using hardcoded data and read live from the database instead.

## What gets built

### Sign in
- A `/auth` page with email + password sign-in for Sanders staff.
- No public self-serve signup: staff accounts are created by an existing admin from inside the dashboard (invite by email), so strangers can't register.
- Each account has a profile: display name, company, contact phone. The contact phone can be shown on the listings that person manages.
- Roles: `admin` (manage everything, including staff accounts) and `staff` (manage listings and leads). Roles live in their own secured table.

### Dashboard (`/dashboard`, sign-in required)
- **Overview**: counts of live listings, drafts, specials, and new leads this week.
- **Listings**: a table of every home with photo thumbnail, name, builder, status chips, beds/baths/sqft, published state, and last-updated date. Search and filter by status/section type. Row actions: edit, duplicate, publish/unpublish, delete (with confirmation).
- **Listing editor**: one form covering everything the public detail page shows — name, builder, property ID, address, description, section type, beds, baths, sqft, dimensions, wind zone, statuses (For Sale / Luxury / On Site / Special), optional price, and the feature checklist. A "Preview" link opens the public detail page.
- **Photos**: drag-and-drop upload, reorder, set the cover photo, delete. Stored in cloud file storage; the photo count on cards comes from the real number of photos.
- **Leads**: submissions from the homepage qualify form and the "Get your payment" CTAs, with name, phone, email, the home they were looking at, message, and date. Mark as new / contacted / closed, and add an internal note.
- **Team** (admins only): list staff, invite a new one, change role, deactivate.

### Public site
- The 12 existing homes are moved into the database as real records (with their current photos), so nothing visibly changes on launch.
- `/`, `/homes`, and `/homes/:id` read live data. Only published listings appear publicly; drafts are visible only in the dashboard.
- The qualify form and payment CTAs write real leads into the database instead of doing nothing.
- A header link to the dashboard appears only when a staff member is signed in; signing out returns to the public site.

## Technical notes

- Enable Lovable Cloud for the database, auth, and file storage.
- Tables: `profiles`, `user_roles` (with a `has_role` security-definer function), `homes`, `home_photos`, `home_features` (or a text array on `homes`), and `leads`. Every table gets row-level security: public read limited to published homes and safe columns; all writes and all lead reads restricted to authenticated staff.
- Seed migration inserts the current 12 homes and their feature lists literally, so the public site is populated the moment the migration runs.
- Photos go in a `home-photos` storage bucket, public read, staff-only write.
- Data access: public reads through a server function using the publishable key; every dashboard read/write through authenticated server functions that verify the caller. Route guarding via the `_authenticated` layout, with the dashboard living under it.
- `src/components/site/data.ts` keeps its types and helpers (`estimateMonthly`, `money`, filter defaults) but the `HOMES` array is replaced by database queries.
- Each new page gets its own title/description metadata; dashboard pages are marked noindex.
