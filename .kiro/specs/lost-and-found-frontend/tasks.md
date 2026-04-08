# Implementation Plan: Lost & Found Frontend

## Overview

Implement the full React + Vite frontend for the Lost & Found platform. Tasks are ordered so each step builds on the previous — infrastructure first, then auth, then shared components, then pages, then wiring, then styles, then tests.

## Tasks

- [x] 1. Install dependencies
  - Run `npm install react-router-dom` in `frontend/`
  - Run `npm install --save-dev vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw fast-check` in `frontend/`
  - Add `"test": "vitest --run"` script to `frontend/package.json`
  - _Requirements: 1.1, 15.1_

- [x] 2. Set up project structure and test infrastructure
  - [x] 2.1 Create folder skeleton
    - Create `.gitkeep` files in `frontend/src/api/`, `frontend/src/context/`, `frontend/src/components/`, `frontend/src/pages/`, `frontend/src/routes/`, `frontend/src/test/`
    - _Requirements: all_
  - [x] 2.2 Configure Vitest
    - Update `frontend/vite.config.js` to add `test: { environment: 'jsdom', setupFiles: ['./src/test/setup.js'] }`
    - Create `frontend/src/test/setup.js` that imports `@testing-library/jest-dom`
    - Create `frontend/src/test/server.js` that sets up an MSW `setupServer()` instance and exports it
    - _Requirements: all_

- [x] 3. Build AuthContext
  - [x] 3.1 Implement `frontend/src/context/AuthContext.jsx`
    - Create `AuthContext` with `React.createContext`
    - `AuthProvider` reads `localStorage.getItem('token')` on mount, decodes JWT payload via `atob` on the middle segment, checks `exp` claim, restores user or clears token
    - Expose `{ user, token, login(token, userData), logout(), loading }` via context value
    - Export `useAuth` hook
    - Register `setOnUnauthorized` callback on the API client so 401 responses clear auth state and redirect to `/login`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 15.2_

- [x] 4. Build API client
  - [x] 4.1 Implement `frontend/src/api/client.js`
    - Internal `request(method, path, body, isMultipart)` reads token from `localStorage`, attaches `Authorization: Bearer <token>`, calls `fetch`, fires `onUnauthorized` callback on 401
    - On network error (fetch throws) return `{ error: { message: 'Network error. Please check your connection.' } }`
    - Export `setOnUnauthorized(cb)`
    - Export all endpoint functions: `registerUser`, `loginUser`, `getItems`, `getItemById`, `createItem`, `updateItem`, `deleteItem`, `getMyItems`, `createClaim`, `getItemClaims`, `getMyClaims`, `updateClaimStatus`, `uploadImage`, `getAdminStats`, `getAdminUsers`, `deleteAdminUser`
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [x] 5. Build route guards
  - [x] 5.1 Implement `frontend/src/routes/ProtectedRoute.jsx`
    - While `loading` is true render `<LoadingSpinner />`; if no `user` redirect to `/login` with `state.from = location`; otherwise render `<Outlet />`
    - _Requirements: 1.4_
  - [x] 5.2 Implement `frontend/src/routes/AdminRoute.jsx`
    - Same as ProtectedRoute but additionally redirects to `/` if `user.role !== 'admin'`
    - _Requirements: 1.5_

- [x] 6. Build Navbar
  - [x] 6.1 Implement `frontend/src/components/Navbar.jsx` and `Navbar.css`
    - Use `useAuth()` to read user state
    - Unauthenticated: Home, Login, Register links
    - Authenticated: Home, Dashboard, Logout button
    - Admin: additionally show Admin link
    - Logout calls `auth.logout()` and navigates to `/`
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 7. Build reusable components
  - [x] 7.1 Implement `frontend/src/components/LoadingSpinner.jsx` and `LoadingSpinner.css`
    - Centered animated spinner
    - _Requirements: 2.5, 3.5, 5.7, 7.7, 12.3_
  - [x] 7.2 Implement `frontend/src/components/ItemCard.jsx` and `ItemCard.css`
    - Accept `item` prop; render image (placeholder if no `imageUrl`), title, category, type badge, status badge, location
    - Entire card is a `<Link>` to `/items/:id`
    - _Requirements: 5.1_
  - [x] 7.3 Implement `frontend/src/components/Pagination.jsx` and `Pagination.css`
    - Accept `page`, `pages`, `onPageChange` props; render page buttons; only render when `pages > 1`
    - _Requirements: 5.6_
  - [x] 7.4 Implement `frontend/src/components/ClaimForm.jsx` and `ClaimForm.css`
    - Accept `itemId`, `onSuccess`, `onCancel` props
    - Textarea for message, Submit and Cancel buttons
    - Validate message non-empty before calling `createClaim(itemId, message)`
    - Manage own `loading` and `error` state; on success call `onSuccess()`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 8. Build Home page
  - [x] 8.1 Implement `frontend/src/pages/Home.jsx` and `Home.css`
    - State: `items`, `loading`, `error`, `page`, `pages`, `keyword`, `category`, `type`, `status`
    - On mount and on filter/page change call `getItems({ keyword, category, type, status, pageNumber: page })`
    - Debounce keyword input 300 ms before triggering fetch; changing any filter resets `page` to 1
    - Render: search input, category/type/status dropdowns, grid of `<ItemCard>`, `<Pagination>`, `<LoadingSpinner>` while loading, "No items found" when empty
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [x] 9. Build Login page
  - [x] 9.1 Implement `frontend/src/pages/Login.jsx` and `Login.css`
    - State: `email`, `password`, `loading`, `error`
    - Inline validation: both fields required before sending
    - On submit: call `loginUser(email, password)`, on success call `auth.login(token, user)` and navigate to `location.state?.from || '/'`
    - Show error beneath form on failure; disable submit and show spinner while loading
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 10. Build Register page
  - [x] 10.1 Implement `frontend/src/pages/Register.jsx` and `Register.css`
    - State: `name`, `email`, `password`, `loading`, `error`
    - Inline validation: all three fields required
    - On submit: call `registerUser(name, email, password)`, on success call `auth.login(token, user)` and navigate to `/`
    - Show error beneath form on failure; disable submit and show spinner while loading
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 11. Build ItemDetail page
  - [x] 11.1 Implement `frontend/src/pages/ItemDetail.jsx` and `ItemDetail.css`
    - On mount: fetch item via `getItemById(id)`; if user is owner also fetch claims via `getItemClaims(id)`
    - Image src: `http://localhost:5000` + `item.imageUrl`; fallback placeholder if null
    - Owner view: Edit button (navigate to `/items/:id/edit`), Delete button (`window.confirm` then `deleteItem` then navigate to `/dashboard`), claims list with Approve/Reject buttons calling `updateClaimStatus`
    - Non-owner authenticated: Submit Claim button toggles `showClaimForm` and renders `<ClaimForm>` inline
    - Unauthenticated: Submit Claim button navigates to `/login`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_

- [x] 12. Build PostItem page
  - [x] 12.1 Implement `frontend/src/pages/PostItem.jsx` and `PostItem.css`
    - Protected route; fields: title, description, category (select), type (select), location, date, image file input
    - On file select: show preview via `URL.createObjectURL()`
    - On submit: validate required fields; if image selected call `uploadImage(file)` first, then `createItem(data)` with returned `imageUrl`; abort and show error if upload fails
    - On success navigate to `/items/:newId`; disable submit and show spinner while in flight
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 14.1, 14.2, 14.3, 14.4_

- [x] 13. Build EditItem page
  - [x] 13.1 Implement `frontend/src/pages/EditItem.jsx` and `EditItem.css`
    - Protected route; on mount fetch item via `getItemById(id)` and pre-populate all form fields
    - Same fields as PostItem; on submit call `updateItem(id, data)`
    - On success navigate to `/items/:id`; on auth error display message without redirecting
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 14. Build Dashboard page
  - [x] 14.1 Implement `frontend/src/pages/Dashboard.jsx` and `Dashboard.css`
    - Protected route; two tabs: "My Items" and "My Claims"
    - My Items tab: fetch `getMyItems()`, render table with title, type, status, date, Delete button; confirm then `deleteItem` then remove from local state; empty state with link to `/post-item`
    - My Claims tab: fetch `getMyClaims()`, render list with item title (link to `/items/:id`), message, status badge with class `badge-approved` / `badge-rejected` / `badge-pending`; empty state message
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 15. Build AdminDashboard page
  - [x] 15.1 Implement `frontend/src/pages/AdminDashboard.jsx` and `AdminDashboard.css`
    - Admin-only route
    - Stats section: fetch `getAdminStats()`, render 4 stat cards (total items, resolved items, pending claims, total users); spinner while loading; error message on failure
    - Users section: fetch `getAdminUsers()`, render table with name, email, role, join date, Delete button; hide Delete on own row by comparing `user._id`; confirm then `deleteAdminUser` then remove from local state
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 16. Wire up App.jsx with all routes
  - [x] 16.1 Rewrite `frontend/src/App.jsx`
    - Wrap everything in `<AuthProvider>` and `<BrowserRouter>`
    - Render `<Navbar>` outside the route switch so it appears on every page
    - Define all routes: `/`, `/login`, `/register`, `/items/:id`, `/items/:id/edit`, `/post-item`, `/dashboard`, `/admin`
    - `/post-item`, `/items/:id/edit`, `/dashboard` wrapped in `<ProtectedRoute>`
    - `/admin` wrapped in `<AdminRoute>`
    - _Requirements: 1.1, 1.4, 1.5, 1.6_

- [x] 17. Write global CSS
  - [x] 17.1 Rewrite `frontend/src/index.css`
    - CSS reset, base typography, CSS custom properties: `--primary`, `--danger`, `--success`, `--text`, `--bg`, `--border`
    - Badge utility classes: `.badge`, `.badge-lost`, `.badge-found`, `.badge-open`, `.badge-claimed`, `.badge-resolved`, `.badge-pending`, `.badge-approved`, `.badge-rejected`
    - `.error-message` and `.success-message` styles
    - Responsive item grid (auto-fill, minmax 260px)
    - Base button styles
    - _Requirements: 11.2, 11.3_

- [x] 18. Checkpoint — verify app renders and routes work
  - Ensure all imports resolve, no console errors on load, navigation between pages works, and the auth flow (register, login, logout) works end-to-end.

- [ ] 19. Write property-based tests
  - [ ]* 19.1 Property 1 — ProtectedRoute redirects unauthenticated users
    - `// Feature: lost-and-found-frontend, Property 1: Protected routes always redirect unauthenticated users to /login`
    - Generate arbitrary protected route paths, render with null user in context, assert redirect to `/login`
    - **Property 1: Protected routes always redirect unauthenticated users to /login**
    - **Validates: Requirements 1.4**
  - [ ]* 19.2 Property 2 — Filter params reflected in outgoing requests
    - `// Feature: lost-and-found-frontend, Property 2: Filter params are always reflected in outgoing requests`
    - Generate arbitrary `{ keyword, category, type, status }` combinations, apply to Home state, intercept fetch with MSW, assert each non-empty param appears in the request URL
    - **Property 2: Filter params are always reflected in outgoing requests**
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
  - [ ]* 19.3 Property 3 — Pagination page number reflected in requests
    - `// Feature: lost-and-found-frontend, Property 3: Pagination page number is always reflected in outgoing requests`
    - Generate arbitrary page numbers (1-50), simulate page click, assert `pageNumber=n` in intercepted request URL
    - **Property 3: Pagination page number is always reflected in outgoing requests**
    - **Validates: Requirements 5.6**
  - [ ]* 19.4 Property 4 — Auth token attached to protected API calls
    - `// Feature: lost-and-found-frontend, Property 4: Auth token is always attached to protected API calls`
    - Generate arbitrary token strings, store in `localStorage`, call each protected API function, assert `Authorization` header equals `Bearer <token>`
    - **Property 4: Auth token is always attached to protected API calls**
    - **Validates: Requirements 15.1**
  - [ ]* 19.5 Property 5 — Session restore round-trip
    - `// Feature: lost-and-found-frontend, Property 5: Session restore round-trip`
    - Generate arbitrary valid JWT payloads `{ _id, name, email, role, exp: future }`, base64-encode as a valid JWT, store in `localStorage`, mount `AuthProvider`, assert `user` state matches payload fields
    - **Property 5: Session restore round-trip**
    - **Validates: Requirements 4.1**
  - [ ]* 19.6 Property 6 — Form validation blocks submission for empty required fields
    - `// Feature: lost-and-found-frontend, Property 6: Form validation blocks submission for any empty required field`
    - For Register and Login forms: generate states with at least one required field empty, attempt submit, assert no MSW request was received and at least one validation message is visible
    - **Property 6: Form validation blocks submission for any empty required field**
    - **Validates: Requirements 2.6, 7.6**
  - [ ]* 19.7 Property 7 — Image URL construction uses backend base URL
    - `// Feature: lost-and-found-frontend, Property 7: Image URL construction always uses backend base URL`
    - Generate arbitrary `imageUrl` strings (non-null), render `ItemDetail` with a mock item containing that `imageUrl`, assert `img[src]` equals `http://localhost:5000` + `imageUrl`
    - **Property 7: Image URL construction always uses backend base URL**
    - **Validates: Requirements 6.2**
  - [ ]* 19.8 Property 8 — Image upload precedes item creation
    - `// Feature: lost-and-found-frontend, Property 8: Image upload always precedes item creation`
    - Generate arbitrary image file objects, fill PostItem form, submit, use MSW to record request order, assert `/api/upload` request timestamp precedes `/api/items` request timestamp
    - **Property 8: Image upload always precedes item creation**
    - **Validates: Requirements 7.3, 14.3**
  - [ ]* 19.9 Property 9 — Claim status badge class matches claim status
    - `// Feature: lost-and-found-frontend, Property 9: Claim status badge class matches claim status`
    - Generate arbitrary claim objects with `status` in `['pending', 'approved', 'rejected']`, render in Dashboard My Claims list, assert badge element has class `badge-<status>`
    - **Property 9: Claim status badge class matches claim status**
    - **Validates: Requirements 11.2, 11.3**
  - [ ]* 19.10 Property 10 — Claim form submission includes itemId and message
    - `// Feature: lost-and-found-frontend, Property 10: Claim form submission always includes itemId and message`
    - Generate arbitrary `itemId` strings and non-empty `message` strings, render `ClaimForm`, submit, intercept POST with MSW, assert body contains `{ item: itemId, message }`
    - **Property 10: Claim form submission always includes itemId and message**
    - **Validates: Requirements 9.3**
  - [ ]* 19.11 Property 11 — Claim status update body matches action
    - `// Feature: lost-and-found-frontend, Property 11: Claim status update request body matches the action taken`
    - Generate arbitrary claim ids, render ItemDetail owner view with a pending claim, click Approve or Reject (separate runs), intercept PUT with MSW, assert body is `{ status: "approved" }` or `{ status: "rejected" }` respectively
    - **Property 11: Claim status update request body matches the action taken**
    - **Validates: Requirements 6.8, 6.9**
  - [ ]* 19.12 Property 12 — Admin's own row never has a delete button
    - `// Feature: lost-and-found-frontend, Property 12: Admin's own row never has a delete button`
    - Generate arbitrary user lists where one user's `_id` matches the logged-in admin, render AdminDashboard users table, assert the matching row contains no delete button
    - **Property 12: Admin's own row never has a delete button**
    - **Validates: Requirements 13.5**
  - [ ]* 19.13 Property 13 — Network errors return consistent error shape
    - `// Feature: lost-and-found-frontend, Property 13: Network errors return a consistent error shape`
    - For each exported API client function: simulate a network failure via MSW `networkError()`, call the function, assert the returned value has a `message` string property
    - **Property 13: Network errors return a consistent error shape**
    - **Validates: Requirements 15.4**
  - [ ]* 19.14 Property 14 — Edit form pre-population matches item data
    - `// Feature: lost-and-found-frontend, Property 14: Edit form pre-population matches item data`
    - Generate arbitrary item objects with all required fields, render `EditItem` with MSW returning that item, assert each form field value matches the corresponding item field
    - **Property 14: Edit form pre-population matches item data**
    - **Validates: Requirements 8.1**

- [ ] 20. Final checkpoint — Ensure all tests pass
  - Run `npm test` in `frontend/`. Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with a minimum of 100 iterations each
- MSW intercepts all fetch calls in tests — no direct `fetch` mocking needed
- The `loading` flag in AuthContext prevents route guards from flashing a redirect before token validation completes
