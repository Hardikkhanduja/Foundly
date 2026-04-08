# Design Document — Lost & Found Frontend

## Overview

A React 19 + Vite single-page application that provides the full user interface for the Lost & Found platform. The frontend communicates exclusively with the existing Express/MongoDB backend at `http://localhost:5000` via REST. Authentication is JWT-based, with the token stored in `localStorage`. State is managed with React Context for auth and local component state everywhere else — no Redux, no external state library.

The app has two user tiers: regular users (browse, post, claim, dashboard) and admins (all of the above plus an admin dashboard). Routing is handled by React Router DOM v6 with protected and admin-only route wrappers.

---

## Architecture

```
Browser
  └── React App (Vite dev server / static build)
        ├── AuthContext  ← single source of truth for current user + token
        ├── React Router ← client-side routing, route guards
        ├── API Client   ← all fetch calls, JWT injection, 401 handling
        └── Pages / Components
```

Data flow is straightforward:
1. Component needs data → calls API client function
2. API client attaches JWT header, fires fetch
3. Response comes back → component stores it in local state
4. AuthContext is only involved for auth actions (login/logout/register) and 401 interception

No global item store. Each page fetches its own data on mount. This keeps things simple and avoids stale-data bugs.

---

## Project Folder Structure

```
frontend/src/
├── api/
│   └── client.js          # centralized fetch wrapper + all endpoint functions
├── context/
│   └── AuthContext.jsx    # React context, provider, useAuth hook
├── components/
│   ├── Navbar.jsx
│   ├── ItemCard.jsx
│   ├── Pagination.jsx
│   ├── ClaimForm.jsx
│   └── LoadingSpinner.jsx
├── pages/
│   ├── Home.jsx           # browse + search + filters
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── ItemDetail.jsx
│   ├── PostItem.jsx
│   ├── EditItem.jsx
│   ├── Dashboard.jsx
│   └── AdminDashboard.jsx
├── routes/
│   ├── ProtectedRoute.jsx
│   └── AdminRoute.jsx
├── App.jsx                # router setup
├── main.jsx
└── index.css              # global styles
```

Each page owns its own CSS file (e.g. `Home.css`) co-located next to the page component. Components have their own CSS files too. No CSS modules — plain `.css` imports.

---

## Components and Interfaces

### AuthContext (`context/AuthContext.jsx`)

Holds the current user object and exposes auth actions. Wraps the entire app.

```js
// Shape of context value
{
  user: { _id, name, email, role } | null,
  token: string | null,
  login(token, userData): void,
  logout(): void,
  loading: boolean   // true only during initial token validation on mount
}
```

On mount, the provider reads `localStorage.getItem('token')`, decodes the JWT payload (no library needed — just `atob` on the middle segment), checks the `exp` claim, and either restores the user or clears the token. The `loading` flag prevents route guards from redirecting before this check completes.

### API Client (`api/client.js`)

A thin wrapper around `fetch`. Every function in this module is named after the operation it performs.

```js
// Core request function (not exported)
async function request(method, path, body, isMultipart)

// Auth
export const registerUser = (name, email, password) => ...
export const loginUser = (email, password) => ...

// Items
export const getItems = (params) => ...        // params: { keyword, category, type, status, pageNumber }
export const getItemById = (id) => ...
export const createItem = (data) => ...
export const updateItem = (id, data) => ...
export const deleteItem = (id) => ...
export const getMyItems = () => ...

// Claims
export const createClaim = (itemId, message) => ...
export const getItemClaims = (itemId) => ...
export const getMyClaims = () => ...
export const updateClaimStatus = (claimId, status) => ...

// Upload
export const uploadImage = (file) => ...       // multipart/form-data

// Admin
export const getAdminStats = () => ...
export const getAdminUsers = () => ...
export const deleteAdminUser = (id) => ...
```

JWT is read from `localStorage` inside `request()` on every call — no need to pass it around. On a 401 response, the client calls a registered callback (set by AuthContext on mount) to clear auth state and redirect to `/login`.

### ProtectedRoute (`routes/ProtectedRoute.jsx`)

```jsx
// Redirects to /login if no authenticated user
// Shows nothing (or spinner) while AuthContext.loading is true
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

### AdminRoute (`routes/AdminRoute.jsx`)

```jsx
// Redirects to / if user.role !== 'admin'
// Wraps ProtectedRoute internally
<AdminRoute>
  <AdminDashboard />
</AdminRoute>
```

### Navbar (`components/Navbar.jsx`)

Reads from `useAuth()`. Renders:
- Always: logo/home link, Browse link
- Unauthenticated: Login, Register
- Authenticated: Dashboard, Logout
- Admin: + Admin link

### ItemCard (`components/ItemCard.jsx`)

```jsx
<ItemCard item={item} />
```

Displays: image (or placeholder), title, category, type badge (styled differently for lost vs found), status badge, location. Clicking navigates to `/items/:id`.

### Pagination (`components/Pagination.jsx`)

```jsx
<Pagination page={page} pages={totalPages} onPageChange={setPage} />
```

Renders page number buttons. Only shown when `pages > 1`.

### ClaimForm (`components/ClaimForm.jsx`)

```jsx
<ClaimForm itemId={id} onSuccess={handleSuccess} onCancel={handleCancel} />
```

Inline form (not a modal — just a section that appears below the item details). Has a textarea for the claim message, submit and cancel buttons. Manages its own loading/error state.

### LoadingSpinner (`components/LoadingSpinner.jsx`)

Simple centered spinner. Used on any page while data is loading.

---

## Pages

### Home (`pages/Home.jsx`)

- On mount: fetches `GET /api/items` with current filter state
- State: `items`, `loading`, `error`, `page`, `pages`, `keyword`, `category`, `type`, `status`
- Search input uses a debounce (300ms) before firing the request
- Filters are `<select>` dropdowns — changing one resets page to 1 and refetches
- Renders: filter bar, item grid of `<ItemCard>`, `<Pagination>`, loading/empty states

### Login (`pages/Login.jsx`)

- State: `email`, `password`, `loading`, `error`
- On submit: calls `loginUser()`, on success calls `auth.login()` and navigates to `location.state?.from || '/'`
- Inline validation: checks fields non-empty before sending

### Register (`pages/Register.jsx`)

- State: `name`, `email`, `password`, `loading`, `error`
- On submit: calls `registerUser()`, on success calls `auth.login()` and navigates to `/`
- Inline validation: all fields required

### ItemDetail (`pages/ItemDetail.jsx`)

- On mount: fetches item by id; if user is owner, also fetches claims
- State: `item`, `claims`, `loading`, `error`, `showClaimForm`, `claimLoading`
- Image URL: `http://localhost:5000` + `item.imageUrl` (or placeholder if null)
- Owner view: Edit button (navigates to `/items/:id/edit`), Delete button (confirm → delete → navigate to `/dashboard`), claims list with Approve/Reject buttons
- Non-owner authenticated view: Submit Claim button (toggles `showClaimForm`)
- Unauthenticated: Submit Claim button redirects to `/login`

### PostItem (`pages/PostItem.jsx`)

- Protected route
- State: form fields + `imageFile`, `imagePreview`, `loading`, `error`
- Image flow: user selects file → preview shown immediately via `URL.createObjectURL()` → on form submit, upload first via `uploadImage()`, get back `imageUrl`, then call `createItem()` with that url
- On success: navigate to `/items/:newId`

### EditItem (`pages/EditItem.jsx`)

- Protected route
- On mount: fetches item by id, pre-populates form fields
- Same form structure as PostItem but sends PUT instead of POST
- On success: navigate to `/items/:id`

### Dashboard (`pages/Dashboard.jsx`)

- Protected route
- Two tabs: "My Items" and "My Claims"
- My Items: fetches `GET /api/items/myitems`, renders a table with title, type, status, date, delete button
- My Claims: fetches `GET /api/claims/myclaims`, renders a list with item title (link), message, status badge
- Delete item: confirm dialog → DELETE → remove from local state array

### AdminDashboard (`pages/AdminDashboard.jsx`)

- Admin-only route
- Two sections: Stats cards and Users table
- Stats: fetches `GET /api/admin/stats`, renders 4 cards (total items, resolved, pending claims, total users)
- Users: fetches `GET /api/admin/users`, renders table with name, email, role, join date, delete button (hidden for own row)
- Delete user: confirm → DELETE → remove from local state

---

## Data Models

These mirror the backend Mongoose schemas exactly.

```ts
// Item
{
  _id: string
  title: string
  description: string
  category: 'Electronics' | 'Documents' | 'Clothing' | 'Keys' | 'Bags' | 'Others'
  type: 'lost' | 'found'
  status: 'Open' | 'Claimed' | 'Resolved'
  location: string
  date: string          // ISO date string
  imageUrl?: string
  postedBy: { _id: string, name: string }
  createdAt: string
}

// Claim
{
  _id: string
  item: string | Item   // populated or just id depending on endpoint
  claimant: { _id: string, name: string }
  message: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

// User (admin view)
{
  _id: string
  name: string
  email: string
  role: 'user' | 'admin'
  createdAt: string
}

// AdminStats
{
  totalItems: number
  resolvedItems: number
  pendingClaims: number
  totalUsers: number
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Protected routes always redirect unauthenticated users to /login

*For any* route path that is wrapped in `ProtectedRoute`, rendering it without an authenticated user in context should result in the router redirecting to `/login`.

**Validates: Requirements 1.4**

---

### Property 2: Filter params are always reflected in outgoing requests

*For any* combination of keyword, category, type, and status filter values set in the Home page, the fetch call issued to `/api/items` should include each non-empty filter as a query parameter with the exact value the user selected.

**Validates: Requirements 5.2, 5.3, 5.4, 5.5**

---

### Property 3: Pagination page number is always reflected in outgoing requests

*For any* page number the user clicks in the Pagination component, the subsequent fetch to `/api/items` should include `pageNumber=<n>` matching the clicked page.

**Validates: Requirements 5.6**

---

### Property 4: Auth token is always attached to protected API calls

*For any* API client function that calls a protected backend endpoint, the outgoing `Authorization` header should contain `Bearer <token>` where `<token>` matches the value currently stored in `localStorage`.

**Validates: Requirements 15.1**

---

### Property 5: Session restore round-trip

*For any* valid JWT token stored in `localStorage` before the app mounts, after `AuthContext` initialises the `user` state should be non-null and reflect the identity encoded in that token.

**Validates: Requirements 4.1**

---

### Property 6: Form validation blocks submission for any empty required field

*For any* form (Register, Login, PostItem, EditItem) and any combination of its required fields left empty, clicking submit should not fire a network request and should display at least one validation message.

**Validates: Requirements 2.6, 7.6**

---

### Property 7: Image URL construction always uses backend base URL

*For any* item with a non-null `imageUrl`, the `src` attribute of the rendered image element should equal `http://localhost:5000` concatenated with `item.imageUrl`.

**Validates: Requirements 6.2**

---

### Property 8: Image upload always precedes item creation

*For any* PostItem or EditItem form submission where the user has selected an image file, the `POST /api/upload` request should be sent and resolved before the `POST /api/items` or `PUT /api/items/:id` request is sent.

**Validates: Requirements 7.3, 14.3**

---

### Property 9: Claim status badge class matches claim status

*For any* claim rendered in the Dashboard's My Claims list or the ItemDetail claims list, the CSS class applied to the status badge should correspond to the claim's `status` field (e.g. class `badge-approved` for `"approved"`, `badge-rejected` for `"rejected"`, `badge-pending` for `"pending"`).

**Validates: Requirements 11.2, 11.3**

---

### Property 10: Claim form submission always includes itemId and message

*For any* claim form submission with a non-empty message, the POST body sent to `/api/claims` should contain both the `item` field (matching the current item's `_id`) and the `message` field (matching what the user typed).

**Validates: Requirements 9.3**

---

### Property 11: Claim status update request body matches the action taken

*For any* claim in the owner's claims list, clicking Approve should send `{ status: "approved" }` and clicking Reject should send `{ status: "rejected" }` to `PUT /api/claims/:id/status`.

**Validates: Requirements 6.8, 6.9**

---

### Property 12: Admin's own row never has a delete button

*For any* admin user viewing the users table, the table row corresponding to their own `_id` should not contain a delete button.

**Validates: Requirements 13.5**

---

### Property 13: Network errors return a consistent error shape

*For any* API client function call that results in a network failure (no response), the returned value should be an object with a `message` string property containing a human-readable description of the failure.

**Validates: Requirements 15.4**

---

### Property 14: Edit form pre-population matches item data

*For any* item fetched for editing, every form field in EditItem should be initialised with the corresponding value from the fetched item object.

**Validates: Requirements 8.1**

---

## Error Handling

**API errors**: Every API client function returns `{ data, error }`. Components check `error` after the call and set local error state. Errors are displayed in a styled `<div class="error-message">` near the relevant UI element (beneath forms, above content areas).

**401 handling**: The API client registers a global `onUnauthorized` callback. AuthContext sets this callback on mount. When any request returns 401, the callback fires: clears localStorage token, resets context user to null, and calls `navigate('/login')`.

**Loading states**: Every page/component that fetches data has a `loading` boolean. While true, a `<LoadingSpinner />` is shown in place of the content. Submit buttons show a spinner and are `disabled` while a request is in flight.

**Empty states**: Explicit "no data" messages for: no items found (Home), no items posted (Dashboard), no claims made (Dashboard), stats fetch failure (AdminDashboard).

**Image upload failure**: If `uploadImage()` fails, item creation is aborted and an error message is shown. The user can retry without losing their form data.

**Confirmation dialogs**: Delete actions (items, users) use the browser's native `window.confirm()` — simple and zero-dependency.

---

## Testing Strategy

### Unit Tests

Use Vitest + React Testing Library. Focus on:
- Specific rendering examples (navbar shows correct links for each auth state)
- Edge cases (empty state messages, placeholder image, no delete button for own row)
- Integration points (ClaimForm calls correct API function with correct args)
- Error display (error message appears after mock API failure)

Avoid testing implementation details. Test what the user sees and what requests are sent.

### Property-Based Tests

Use `fast-check` for property-based testing. Each property test runs a minimum of 100 iterations.

Each test is tagged with a comment in this format:
`// Feature: lost-and-found-frontend, Property <N>: <property_text>`

Properties to implement as PBT:

- **Property 1** — Generate arbitrary route paths from the protected routes list, render with unauthenticated context, assert redirect to `/login`
- **Property 2** — Generate arbitrary filter combinations (keyword strings, category/type/status enum values), apply them in Home, assert the outgoing URL contains each param
- **Property 3** — Generate arbitrary page numbers within valid range, click them, assert `pageNumber=n` in request URL
- **Property 4** — Generate arbitrary token strings, store in localStorage, call any protected API function, assert Authorization header matches
- **Property 5** — Generate arbitrary valid JWT payloads, encode and store, mount AuthContext, assert user state matches payload
- **Property 6** — Generate arbitrary form states with at least one required field empty, attempt submit, assert no network request fired
- **Property 7** — Generate arbitrary imageUrl strings, render ItemDetail with that item, assert img src = `http://localhost:5000` + imageUrl
- **Property 8** — Generate arbitrary image files, submit PostItem form, assert upload called before createItem
- **Property 9** — Generate arbitrary claim objects with any status value, render badge, assert CSS class matches status
- **Property 10** — Generate arbitrary message strings and itemIds, submit ClaimForm, assert POST body contains both
- **Property 11** — Generate arbitrary claim ids, click approve or reject, assert PUT body contains the correct status string
- **Property 12** — Generate arbitrary user lists where one user matches the logged-in admin, render table, assert own row has no delete button
- **Property 13** — Simulate network failures for any API function, assert returned object has a `message` string
- **Property 14** — Generate arbitrary item objects, render EditItem with that item, assert each field value matches

### Test Configuration

```js
// vitest.config.js addition
test: {
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.js']
}
```

MSW (Mock Service Worker) for intercepting fetch calls in tests — avoids mocking `fetch` directly and gives realistic request/response handling.
