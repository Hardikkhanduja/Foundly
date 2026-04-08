# Requirements Document

## Introduction

A full React + Vite frontend for a Lost & Found web application. Users can browse lost and found items, post their own, and submit claims. Authenticated users manage their posts and claims through a personal dashboard. Admins have a separate dashboard for platform oversight. The frontend communicates exclusively with the existing Express/MongoDB backend via REST API calls, using JWT tokens stored in localStorage for authentication.

## Glossary

- **App**: The React frontend application as a whole.
- **Auth_Service**: The module responsible for login, registration, and token management.
- **Item_Browser**: The page/component that lists and filters items from the backend.
- **Item_Form**: The form used to create or edit a lost/found item posting.
- **Item_Detail**: The page that shows full details of a single item.
- **Claim_Form**: The form used to submit a claim on an item.
- **User_Dashboard**: The authenticated user's personal page showing their items and claims.
- **Admin_Dashboard**: The admin-only page showing platform stats and user management.
- **Router**: The client-side routing layer (React Router).
- **API_Client**: The centralized module that handles all HTTP requests to the backend.
- **Auth_Context**: The React context that holds the current user state and exposes auth actions.
- **Item**: A lost or found object posted by a user, with fields: title, description, category, type (lost/found), status (Open/Claimed/Resolved), location, date, imageUrl, postedBy.
- **Claim**: A request submitted by a user asserting ownership of a found item, with fields: item, claimant, message, status (pending/approved/rejected).

---

## Requirements

### Requirement 1: Application Routing and Navigation

**User Story:** As a visitor, I want clear navigation and proper page routing, so that I can move between sections of the app without full page reloads.

#### Acceptance Criteria

1. THE Router SHALL render a persistent top navigation bar on every page containing links to the home/browse page, login, and register when no user is authenticated.
2. WHEN a user is authenticated, THE Router SHALL replace the login/register links in the navigation bar with links to the user dashboard and a logout button.
3. WHEN an authenticated user has the role "admin", THE Router SHALL display an additional "Admin" link in the navigation bar.
4. WHEN an unauthenticated user attempts to navigate to a protected route (dashboard, post item, admin), THE Router SHALL redirect the user to the login page.
5. WHEN an authenticated user with role "user" attempts to navigate to an admin-only route, THE Router SHALL redirect the user to the home page.
6. THE Router SHALL support the following routes: `/` (browse), `/login`, `/register`, `/items/:id` (item detail), `/post-item`, `/dashboard`, `/admin`.

---

### Requirement 2: Authentication — Registration

**User Story:** As a new visitor, I want to create an account, so that I can post items and submit claims.

#### Acceptance Criteria

1. THE App SHALL provide a registration page at `/register` with fields for name, email, and password.
2. WHEN the user submits the registration form with valid data, THE Auth_Service SHALL send a POST request to `/api/auth/register` and store the returned JWT token in localStorage.
3. WHEN registration succeeds, THE Router SHALL redirect the user to the home page as an authenticated user.
4. IF the backend returns an error (e.g., email already exists), THEN THE App SHALL display the error message returned by the backend beneath the form.
5. WHILE the registration request is in flight, THE App SHALL disable the submit button and show a loading indicator.
6. IF the user submits the form with any field empty, THEN THE App SHALL display an inline validation message without sending a request to the backend.

---

### Requirement 3: Authentication — Login

**User Story:** As a returning user, I want to log in with my email and password, so that I can access my account.

#### Acceptance Criteria

1. THE App SHALL provide a login page at `/login` with fields for email and password.
2. WHEN the user submits the login form with valid credentials, THE Auth_Service SHALL send a POST request to `/api/auth/login` and store the returned JWT token in localStorage.
3. WHEN login succeeds, THE Router SHALL redirect the user to the page they originally tried to visit, or to the home page if no redirect target exists.
4. IF the backend returns an error (e.g., invalid credentials), THEN THE App SHALL display the error message beneath the form.
5. WHILE the login request is in flight, THE App SHALL disable the submit button and show a loading indicator.

---

### Requirement 4: Authentication — Session Persistence and Logout

**User Story:** As a logged-in user, I want my session to persist across page refreshes, so that I don't have to log in every time.

#### Acceptance Criteria

1. WHEN the App initialises, THE Auth_Context SHALL read the JWT token from localStorage and restore the authenticated user state without requiring a new login.
2. WHEN the user clicks the logout button, THE Auth_Service SHALL remove the JWT token from localStorage and clear the Auth_Context user state.
3. WHEN the user logs out, THE Router SHALL redirect the user to the home page.
4. IF the stored JWT token is expired or invalid when the App initialises, THEN THE Auth_Context SHALL clear the token from localStorage and treat the user as unauthenticated.

---

### Requirement 5: Browse and Search Items

**User Story:** As a visitor, I want to browse and search all lost and found items, so that I can find something I lost or help reunite someone with their belongings.

#### Acceptance Criteria

1. THE Item_Browser SHALL fetch items from `GET /api/items` and display them as a grid of cards showing the item image (or a placeholder), title, category, type badge (lost/found), status, and location.
2. WHEN the user types in the search input, THE Item_Browser SHALL send a request to `GET /api/items?keyword=<value>` and update the displayed list.
3. WHEN the user selects a category filter, THE Item_Browser SHALL include `category=<value>` as a query parameter and refresh the item list.
4. WHEN the user selects a type filter (lost/found), THE Item_Browser SHALL include `type=<value>` as a query parameter and refresh the item list.
5. WHEN the user selects a status filter, THE Item_Browser SHALL include `status=<value>` as a query parameter and refresh the item list.
6. THE Item_Browser SHALL display pagination controls when the total number of items exceeds the page size (10), and WHEN the user clicks a page number, THE Item_Browser SHALL fetch the corresponding page via `pageNumber=<n>`.
7. WHILE items are being fetched, THE Item_Browser SHALL display a loading skeleton or spinner in place of the item grid.
8. IF the backend returns no items for the current filters, THEN THE Item_Browser SHALL display a "No items found" message.

---

### Requirement 6: Item Detail Page

**User Story:** As a visitor, I want to view the full details of an item, so that I can decide whether to submit a claim or contact the poster.

#### Acceptance Criteria

1. THE Item_Detail SHALL fetch a single item from `GET /api/items/:id` and display all fields: title, description, category, type, status, location, date, image, and the poster's name.
2. WHEN the item has an imageUrl, THE Item_Detail SHALL render the image using the full URL constructed from the backend base URL.
3. WHEN the item has no imageUrl, THE Item_Detail SHALL render a placeholder image.
4. WHEN an authenticated user who did not post the item views an item with status "Open" or "Claimed", THE Item_Detail SHALL display a "Submit Claim" button that opens the Claim_Form.
5. WHEN the authenticated user is the owner of the item, THE Item_Detail SHALL display "Edit" and "Delete" buttons instead of the claim button.
6. WHEN the item owner clicks "Delete", THE Item_Detail SHALL prompt for confirmation and then send a DELETE request to `/api/items/:id`, then redirect to the user dashboard.
7. WHEN the item owner views their own item, THE Item_Detail SHALL display a list of claims fetched from `GET /api/claims/item/:itemId`, showing each claimant's name, message, and status.
8. WHEN the item owner clicks "Approve" on a pending claim, THE Item_Detail SHALL send a PUT request to `/api/claims/:id/status` with `{ status: "approved" }` and refresh the claims list.
9. WHEN the item owner clicks "Reject" on a pending claim, THE Item_Detail SHALL send a PUT request to `/api/claims/:id/status` with `{ status: "rejected" }` and refresh the claims list.
10. IF an unauthenticated user clicks "Submit Claim", THEN THE Router SHALL redirect the user to the login page.

---

### Requirement 7: Post a Lost or Found Item

**User Story:** As an authenticated user, I want to post a lost or found item, so that I can report it to the community.

#### Acceptance Criteria

1. THE Item_Form SHALL be accessible at `/post-item` and require authentication.
2. THE Item_Form SHALL include fields for: title (text), description (textarea), category (select: Electronics, Documents, Clothing, Keys, Bags, Others), type (select: lost/found), location (text), date (date picker), and an optional image upload.
3. WHEN the user selects an image file, THE Item_Form SHALL first upload the file via POST to `/api/upload` and store the returned `imageUrl` before submitting the item.
4. WHEN the user submits the form with all required fields, THE Item_Form SHALL send a POST request to `/api/items` with the JWT token in the Authorization header.
5. WHEN item creation succeeds, THE Router SHALL redirect the user to the newly created item's detail page.
6. IF the user submits the form with any required field empty, THEN THE Item_Form SHALL display inline validation messages without sending a request.
7. WHILE the form submission is in flight, THE Item_Form SHALL disable the submit button and show a loading indicator.

---

### Requirement 8: Edit an Existing Item

**User Story:** As an authenticated user, I want to edit my posted items, so that I can correct mistakes or update the status.

#### Acceptance Criteria

1. THE Item_Form SHALL support an edit mode, pre-populated with the existing item data, accessible from the Item_Detail page for the item owner.
2. WHEN the user submits the edit form, THE Item_Form SHALL send a PUT request to `/api/items/:id` with the updated fields and the JWT token.
3. WHEN the update succeeds, THE Router SHALL redirect the user back to the item's detail page.
4. IF the backend returns an authorization error, THEN THE Item_Form SHALL display the error message and not redirect.

---

### Requirement 9: Submit a Claim

**User Story:** As an authenticated user, I want to submit a claim on a found item, so that I can try to recover my lost property.

#### Acceptance Criteria

1. THE Claim_Form SHALL be displayed inline on the Item_Detail page (e.g., as a modal or expandable section) when the user clicks "Submit Claim".
2. THE Claim_Form SHALL include a message textarea where the user describes why they believe the item belongs to them.
3. WHEN the user submits the claim, THE Claim_Form SHALL send a POST request to `/api/claims` with `{ item: itemId, message }` and the JWT token.
4. WHEN the claim is submitted successfully, THE Claim_Form SHALL close and display a success notification to the user.
5. IF the backend returns an error (e.g., already claimed), THEN THE Claim_Form SHALL display the error message without closing.
6. IF the message field is empty, THEN THE Claim_Form SHALL display a validation message without sending a request.

---

### Requirement 10: User Dashboard — My Items

**User Story:** As an authenticated user, I want to see all the items I have posted, so that I can manage them.

#### Acceptance Criteria

1. THE User_Dashboard SHALL fetch the user's items from `GET /api/items/myitems` and display them in a list or table showing title, type, status, and date posted.
2. WHEN the user clicks an item in the list, THE Router SHALL navigate to that item's detail page.
3. WHEN the user clicks "Delete" on an item in the dashboard, THE User_Dashboard SHALL prompt for confirmation and send a DELETE request to `/api/items/:id`, then remove the item from the list.
4. IF the user has no posted items, THEN THE User_Dashboard SHALL display a message encouraging them to post their first item, with a link to `/post-item`.

---

### Requirement 11: User Dashboard — My Claims

**User Story:** As an authenticated user, I want to see all the claims I have submitted, so that I can track their status.

#### Acceptance Criteria

1. THE User_Dashboard SHALL fetch the user's claims from `GET /api/claims/myclaims` and display them in a list showing the item title, claim message, and claim status (pending/approved/rejected).
2. WHEN a claim status is "approved", THE User_Dashboard SHALL visually distinguish it (e.g., green badge).
3. WHEN a claim status is "rejected", THE User_Dashboard SHALL visually distinguish it (e.g., red badge).
4. WHEN the user clicks on a claim's item title, THE Router SHALL navigate to that item's detail page.
5. IF the user has no submitted claims, THEN THE User_Dashboard SHALL display a message indicating no claims have been made yet.

---

### Requirement 12: Admin Dashboard — Statistics

**User Story:** As an admin, I want to see platform-wide statistics, so that I can monitor the health of the application.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL fetch stats from `GET /api/admin/stats` and display: total items, resolved items, pending claims, and total users.
2. THE Admin_Dashboard SHALL display each stat in a clearly labelled card or tile.
3. WHILE the stats are loading, THE Admin_Dashboard SHALL show a loading indicator in place of the stat cards.
4. IF the stats request fails, THEN THE Admin_Dashboard SHALL display an error message.

---

### Requirement 13: Admin Dashboard — User Management

**User Story:** As an admin, I want to view and delete user accounts, so that I can moderate the platform.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL fetch all users from `GET /api/admin/users` and display them in a table showing name, email, role, and join date.
2. WHEN the admin clicks "Delete" on a user row, THE Admin_Dashboard SHALL prompt for confirmation and send a DELETE request to `/api/admin/users/:id`.
3. WHEN the delete succeeds, THE Admin_Dashboard SHALL remove the user from the table without a full page reload.
4. IF the backend returns an error (e.g., admin trying to delete themselves), THEN THE Admin_Dashboard SHALL display the error message.
5. THE Admin_Dashboard SHALL not display a delete button for the currently logged-in admin's own row.

---

### Requirement 14: Image Upload

**User Story:** As a user posting an item, I want to upload a photo of the item, so that others can visually identify it.

#### Acceptance Criteria

1. THE Item_Form SHALL include a file input that accepts image files (JPEG, PNG, GIF, WebP).
2. WHEN the user selects a file, THE Item_Form SHALL display a preview of the selected image before submission.
3. WHEN the user submits the form with an image selected, THE API_Client SHALL first POST the file as multipart/form-data to `/api/upload` and use the returned `imageUrl` as the item's image field.
4. IF the upload request fails, THEN THE Item_Form SHALL display an error message and not proceed with item creation.

---

### Requirement 15: API Client and Error Handling

**User Story:** As a developer, I want a centralized API client, so that all backend communication is consistent and maintainable.

#### Acceptance Criteria

1. THE API_Client SHALL attach the JWT token from localStorage as a `Bearer` token in the `Authorization` header for all requests to protected endpoints.
2. WHEN the backend returns a 401 response, THE API_Client SHALL clear the stored token, reset the Auth_Context, and redirect the user to the login page.
3. THE API_Client SHALL expose typed functions for each backend endpoint rather than raw fetch calls scattered across components.
4. IF a network error occurs (no response from server), THEN THE API_Client SHALL return a consistent error object with a human-readable message.
