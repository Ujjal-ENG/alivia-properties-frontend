# Alivia Properties — User Guide

A complete guide to understanding and navigating the platform. Covers the public website, all three dashboards (Admin, Seller, Buyer), and the login system.

---

## What Is Alivia Properties?

Alivia Properties is a dual-purpose real estate platform for Bangladesh:

1. **Corporate showcase** — Alivia's own development projects (apartments, commercial buildings) with detailed specs, floor plans, and a lead generation form.
2. **Open marketplace** — Individual property owners and agents can list properties for sale or rent. Buyers can search, save, compare, and contact sellers directly.

The platform runs in **mock/demo mode** — all data is dummy (Bangladesh-realistic), no real backend. When a real backend is ready, only the API layer changes; all UI stays the same.

---

## Running the Project

```bash
pnpm dev        # start development server at http://localhost:3000
pnpm build      # production build
pnpm start      # serve the production build
```

---

## Demo Login Credentials

Go to **http://localhost:3000/login** and use one of these:

| Role | Email | Password | Lands on |
|------|-------|----------|----------|
| Admin | admin@aliviaproperties.com | admin123 | /admin/dashboard |
| Seller (verified) | tanvir@example.com | seller123 | /seller/dashboard |
| Seller (unverified) | karim@example.com | seller123 | /seller/dashboard |
| Buyer (verified) | farhan@example.com | buyer123 | /buyer/dashboard |
| Buyer | sadia@example.com | buyer123 | /buyer/dashboard |

> The login page also has **quick-fill buttons** for each role — click them to auto-fill credentials, then hit Sign In.

---

## Public Website (No Login Required)

Everything under the site header/footer is open to all visitors.

### Homepage — `/`

The main landing page. Contains:
- **Hero section** — headline + property search box (type, purpose, location) → navigates to `/properties` with filters pre-applied
- **Featured Projects** — Alivia's own projects with status tabs (All / Ongoing / Upcoming / Completed)
- **Featured Properties** — marketplace listings grid (6 cards)
- **Stats strip** — 12 completed projects, 1800+ families, 14 years experience, 500+ listings
- **Why Choose Alivia** — trust cards (RAJUK-registered, verified sellers, etc.)
- **Testimonials** — 3 dummy client quotes
- **Consultation CTA** — banner linking to the booking form
- **Blog preview** — 3 latest articles
- **Contact CTA** — phone + WhatsApp quick links

### Projects — `/projects`

Alivia's own development projects. Filter by status using tabs at the top.

Each **Project Card** shows:
- Cover image, project name, location (area + city)
- Status badge (Ongoing / Upcoming / Completed)
- Price range (formatted in Crore/Lakh BDT)
- Expected handover date
- "View Details" button

**Project Detail — `/projects/[slug]`**
- Image gallery
- Overview: status, location, land area, total floors, total units, handover date
- Price table (unit types with size and price range)
- Amenities grid (categorised)
- Floor plan images
- Specifications (structure, facing, parking, etc.)
- Nearby landmarks
- **Lead form** — name, phone, query → submits an inquiry
- Site visit CTA

### Properties Marketplace — `/properties`

Browse all listings from sellers across Bangladesh.

**Filter sidebar** (left on desktop, bottom sheet on mobile):
- Purpose toggle: Sale / Rent
- Property type: Apartment, House, Land, Commercial, etc.
- Division → District (dependent select)
- Area / neighbourhood text
- Price range slider
- Bedrooms
- Verified only toggle

All filters sync to the URL (shareable links). Switching pages preserves filters.

**Grid controls:**
- Sort: Latest / Price Low–High / Price High–Low / Featured
- Grid / List view toggle

**Property Card** shows:
- Image with Verified (green shield) or Featured (gold star) badge
- Title, price, area
- Beds / Baths / Size
- Seller name

**Property Detail — `/properties/[slug]`**

Left column (main content):
- Image gallery (click to expand)
- Title + price (formatted BDT)
- Specs grid: type, purpose, size, beds, baths, floor, total floors, area
- Full description
- Facilities checklist
- Map placeholder (Google Maps / Mapbox integration pending)

Right column (sidebar):
- **Seller contact card** — name, phone, WhatsApp button, Call button
- **Inquiry form** — name, phone, email, message → sends to seller
- **Mortgage Calculator** — enter price, down payment, interest rate, tenure → shows monthly EMI
- **Report listing** button → opens dialog to flag suspicious listings

Bottom:
- **Similar properties** — same area + type, excluding the current one

**Save button (❤)** — appears on every property card and detail page. Saves to browser localStorage (no login required). Saved list visible in Buyer dashboard.

**Compare button** — appears on property cards. Add up to 4 properties. A floating bar appears at the bottom of the screen when ≥ 2 are selected. Click "Compare" to go to `/compare`.

### Compare — `/compare`

Side-by-side table of up to 4 selected properties. Columns show:
- Image, title, price
- Type, purpose, area, size
- Beds, baths
- Facilities checklist
- Verified status
- "View" CTA

"Remove" button per column. Empty state shown when nothing is selected.

### Map Search — `/map-search`

Split-view page:
- **Left panel** — search input + filters + scrollable property list cards
- **Right panel** — map placeholder (Google Maps / Mapbox integration pending, marked with TODO comment)

### Consultation Booking — `/consultation`

Book a free consultation with Alivia's team.

Form fields:
- Full name, phone, email
- Consultation type: Buying Advice / Investment Planning / Project-Specific / Site Visit
- Project / Property reference (optional)
- Preferred date (date picker)
- Preferred time slot: 10:00 AM / 11:30 AM / 2:00 PM / 4:00 PM
- Message / notes

On submit → success confirmation message. In production this would email the team and create a booking record.

### About Us — `/about-us`

- Company background, vision, mission
- Founder message (Md. Rafiqul Islam, MD)
- Company timeline: 6 milestones from 2011 to 2025
- Stats strip
- Trust highlights (RAJUK-registered, ISO-certified, etc.)

### Contact Us — `/contact-us`

- Contact info: phone, email, address, office hours (Sat–Thu 9 AM–6 PM), WhatsApp CTA
- **Contact form** — name, phone, email, subject, message → creates an inquiry
- Map placeholder below

### Blog — `/blog`

Article grid filtered by category tabs. Each card shows cover image, category badge, title, excerpt, author, read time, and date.

**Blog Detail — `/blog/[slug]`**
- Cover image, title, author block, estimated read time
- Full article content
- Related posts at the bottom

---

## Authentication

### Register — `/register`

New users choose **Seller** or **Buyer** role during sign-up. After registration (currently dummy) you are redirected to `/login`.

### Forgot Password — `/forgot-password`

Enter email → dummy success message (email sending not wired up yet).

### How Auth Works

- Auth uses **Auth.js v5** (NextAuth) with a Credentials provider
- On successful login, a **JWT session cookie** is set
- The cookie carries: user ID, name, email, avatar, role, isVerified
- Route protection (`src/proxy.ts`) checks the session cookie and redirects:
  - Unauthenticated → `/login?callbackUrl=...`
  - Wrong role (e.g. buyer visiting `/admin/...`) → `/unauthorized`
- After login, the header CTA changes from "Login / List Property" to a **"Dashboard" button** pointing to your role's dashboard

---

## Admin Dashboard — `/admin/...`

**Access:** admin@aliviaproperties.com / admin123

The admin has full oversight of the entire platform.

### Dashboard — `/admin/dashboard`

Overview of platform health:

**Row 1 — Key stats:**
| Card | Value |
|------|-------|
| Total Properties | 248 |
| Pending Listings | 18 |
| Total Users | 1,340 |
| Total Inquiries | 876 |

**Row 2 — Secondary stats:**
| Card | Value |
|------|-------|
| Total Bookings | 312 |
| Verified Listings | 87 |
| Total Sellers | 210 |
| Revenue | — (placeholder) |

**Charts:**
- Bar chart — monthly new listings (Jan–Dec)
- Pie chart — inquiry type breakdown (Property / Project / General / Reports)

**Recent Activity Feed** — last 5 platform events (new listing, inquiry, booking, approval, user join)

### Properties — `/admin/properties`

Full data table of all marketplace listings with:
- Thumbnail, title, type, purpose, price, status badge, seller name, date listed
- **Filter bar** — filter by status, type, purpose
- **Actions per row:** View | Approve | Reject | Verify | Feature | Delete

### Pending Listings — `/admin/pending-listings`

Same table pre-filtered to `status = pending`. Approve and Reject buttons are visually prominent here. This is the moderation queue.

### Projects — `/admin/projects`

Table of Alivia's own development projects:
- Name, location, status badge, total units, price range, handover date
- Actions: Edit | Toggle status (Ongoing ↔ Completed, etc.)

### Users — `/admin/users`

Tabbed view — **All Users / Sellers / Buyers**

Table columns: name, email, role, verified badge, joined date
Actions: Verify (grants green badge) | Deactivate

### Sellers — `/admin/sellers`

Seller-specific table:
- Name, company, total listings, active listings, total inquiries, rating, verified badge
- Action: **Verify Seller** — marks their account trusted, shown to buyers as "Verified Seller"

### Inquiries — `/admin/inquiries`

All contact and property inquiries:
- From (name), type (Property / Project / General / Report), property or project name, status badge, date
- Actions: Mark Read | Reply | Close

### Bookings — `/admin/bookings`

All consultation bookings:
- Name, consultation type, preferred date, time, status badge, assigned staff
- Actions: Confirm | Cancel

### Reports — `/admin/reports`

Flagged listings submitted via the "Report Listing" dialog on property detail pages. Admin reviews and takes action.

### Blog — `/admin/blog`

Blog post management table:
- Title, author, category, date, published/draft status
- Toggle: Publish / Unpublish

### Settings — `/admin/settings`

Placeholder form for site-wide settings: site name, contact email, contact phone. Non-functional in demo mode.

---

## Seller Dashboard — `/seller/...`

**Access:** tanvir@example.com / seller123 (verified seller)

Sellers list properties and manage inquiries from buyers.

### Dashboard — `/seller/dashboard`

**Stat cards:**
- My Listings (total)
- Active Listings
- Pending (awaiting admin approval)
- Inquiries received
- Total views (placeholder)

**Below stats:**
- Recent Inquiries table (5 rows) — buyer name, property, date, status
- Recent Listings list — quick overview of latest posts

### My Properties — `/seller/properties`

Table of the seller's own listings:
- Thumbnail, title, type, status badge, price, view count, date
- Actions: **Edit** | **Delete**
- "Add New Property" button (top right) → goes to Create form

### Create Property — `/seller/properties/create`

Full property submission form with all fields:

**Basic info:** title, description, type (Apartment / House / Duplex / Plot / Commercial / Industrial), purpose (Sale / Rent)

**Pricing:** price (BDT), negotiable checkbox

**Location:** division → district (auto-filtered) → area, full address, map pin placeholder

**Details:** size + unit (Sq Ft / Sq M / Katha / Bigha), bedrooms, bathrooms, balconies, floor number, total floors

**Facilities:** multi-select checkboxes from 30+ amenities (Lift, Generator, CCTV, Gym, Pool, etc.)

**Contact:** contact person name, phone, WhatsApp

**Media:** image upload (preview shown, stored as dummy URL in demo), video URL

On submit → `propertiesService.createProperty()` → redirects to My Properties list.

> **Note:** New listings start with `status = "pending"` and require admin approval before becoming publicly visible.

### Edit Property — `/seller/properties/[id]/edit`

Same form as Create, pre-filled with existing property data. Updates the listing.

### Inquiries — `/seller/inquiries`

Table of all buyer inquiries about this seller's properties:
- Buyer name, phone, property title, message preview, date, status badge (New / Read / Replied / Closed)

### Bookings — `/seller/bookings`

Consultation booking requests related to this seller's properties:
- Buyer name, consultation type, date, time, status badge

### Profile — `/seller/profile`

Edit seller profile:
- Full name, phone number
- Company name, bio
- WhatsApp number
- RAJUK license number

---

## Buyer Dashboard — `/buyer/...`

**Access:** farhan@example.com / buyer123

Buyers search, save, compare, and contact sellers.

### Dashboard — `/buyer/dashboard`

**Stat cards:**
- Saved Properties (count from localStorage)
- Recent Searches (count from localStorage)
- My Inquiries (sent)
- My Bookings (consultation)

**Below stats:**
- Saved Properties grid (3 cards with quick "View" links)
- Recent Searches list with "Search Again" links

### Saved Properties — `/buyer/saved-properties`

All properties the buyer has saved using the ❤ button. Reads from `localStorage`. Grid view with the same property cards as the marketplace.

> Saves are browser-local (no account sync yet). Clearing browser data clears saves.

### Recent Searches — `/buyer/recent-searches`

History of search queries the buyer has performed. Each entry shows the search terms and a "Search Again" link that re-applies those filters on `/properties`.

### My Inquiries — `/buyer/inquiries`

Table of all inquiries the buyer has sent to sellers:
- Property title, seller name, date sent, status (New / Read / Replied / Closed)

### My Bookings — `/buyer/bookings`

Table of consultation bookings the buyer has submitted:
- Consultation type, preferred date + time, status badge (Pending / Confirmed / Cancelled / Completed)

### Profile — `/buyer/profile`

Edit buyer profile: full name, phone number, email address.

---

## Live Chat Widget

A floating chat button (bottom-right corner, brand green) is present on every page.

- Click to open the chat panel
- Type a message → dummy auto-reply appears after ~1.5 seconds
- If "agent unavailable" mode: shows an offline contact form instead

---

## Price Formatting

All BDT amounts across the platform are formatted as:
- `৳1 Crore 35 Lakh` — full format
- `৳1.35 Cr` — short format (used in cards and tables)
- `৳65,000/month` — rent format

---

## Verification Badges

| Badge | Meaning |
|-------|---------|
| Green shield + "Verified" | Admin has confirmed the listing is legitimate |
| Gold star + "Featured" | Promoted listing (paid feature in production) |
| "Verified Seller" label | Admin has verified the seller's identity and credentials |

---

## Data & Demo Mode

- All data is dummy and Bangladesh-realistic (Dhaka/Chittagong/Sylhet locations, BDT prices, BD phone numbers)
- POST/PATCH/DELETE operations work within the session using an in-memory store — refreshing the page resets mutations
- No emails are sent, no SMS, no payment processed
- When the real backend is ready: swap `src/services/` to point at real API endpoints — the UI does not change
