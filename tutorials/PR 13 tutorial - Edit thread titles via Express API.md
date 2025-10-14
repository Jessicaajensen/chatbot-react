# Edit Thread Titles via Express API - Step-by-Step Tutorial

## 📋 Table of Contents

1. [Step 1: Implement PATCH endpoint](#step-1)
2. [Step 2: Add edit route with nested routing](#step-2)
3. [Step 3: Document PATCH endpoint](#step-3)

![edit-thread-title](https://github.com/user-attachments/assets/7c2041e0-c4cc-4709-af99-a8ffb0520dd6)

## 🗺️ Overview

In this tutorial, you'll complete the CRUD (Create, Read, Update, Delete) implementation by adding **Update** functionality. You'll learn how to use the HTTP PATCH method for partial updates, implement nested routes in React Router, and use advanced routing patterns like `Outlet` and `useRouteLoaderData` to share data between routes without extra fetching.

**What you'll build:**

- A PATCH endpoint that updates thread titles
- An edit form as a nested route that overlays the thread view
- Clean separation between viewing and editing using URL-based state

**Why this matters:**

- Completes your full-stack CRUD implementation
- Teaches the difference between PATCH (partial update) and PUT (full replacement)
- Demonstrates how routing can replace complex state management
- Shows how to share data between parent and child routes efficiently

## 🧑‍💻 Today's starting point

If you haven't fully completed the prior tutorials, you may copy the starting point of this tutorial by running this command in the root of your local repository:

```bash
npx degit --force bewildergeist/chatbot-react-postgres#pr-13-start
```

**Important**: Make a commit of this initial version before you start changing anything.

---

<a name="step-1"></a>

## Step 1: Implement PATCH endpoint for updating thread title

### 🤔 Problem to solve

Right now, once a thread is created, its title is permanent. Users need the ability to update thread titles to better organize their conversations. You need a backend endpoint that can modify an existing thread's title while leaving other fields unchanged.

### 💡 Key concepts

- **PATCH vs PUT**: PATCH updates specific fields (partial update), while PUT replaces the entire resource
- **SQL UPDATE**: Modifies existing rows with `UPDATE table SET field = value WHERE condition`
- **RETURNING clause**: Returns the modified row so you can confirm what changed
- **Idempotency**: Calling PATCH multiple times with the same data produces the same result
- **HTTP status codes**: 200 OK (success), 400 Bad Request (validation error), 404 Not Found (doesn't exist)

### 📝 Your task

Create a new PATCH endpoint in `backend/server.js` that:

1. Listens at `/api/threads/:id`
2. Extracts the thread ID from the URL and title from the request body
3. Validates the title is provided and not empty after trimming
4. Updates only the title field using SQL UPDATE with WHERE clause
5. Returns 404 if the thread doesn't exist
6. Returns 400 for validation errors
7. Returns 200 with the updated thread on success

**Where to add it**: Place this endpoint after the `POST /api/threads` endpoint and before the `DELETE /api/threads/:id` endpoint.

### 🔍 Implementation hints

<details>
<summary>💡 SQL UPDATE syntax</summary>

```javascript
UPDATE threads
SET title = ${newTitle}
WHERE id = ${threadId}
RETURNING id, title, created_at
```

The RETURNING clause gives you the updated row back so you can send it in the response.

</details>

<details>
<summary>💡 Checking if the update found a thread</summary>

When the WHERE clause doesn't match any rows, the result array is empty. Check `result.length === 0` to return a 404.

</details>

<details>
<summary>💡 Why PATCH and not PUT?</summary>

We're only updating the `title` field. The `created_at` field remains unchanged. This is a **partial update**, which is what PATCH is designed for. PUT would imply replacing the entire thread resource.

</details>

### 🤔 Before looking at the code

Think about these questions:

- What happens if someone tries to update a thread that doesn't exist?
- Why do we validate that the title isn't just whitespace?
- What would happen if we used PUT instead of PATCH?

### ✅ Reference implementation

**🔗 Commit**: [`e5847c1`](13/commits/e5847c1)

The reference implementation:

- Uses `app.patch()` to register the PATCH route
- Extracts `threadId` from `req.params.id` and `title` from `req.body`
- Validates with two checks: `!title` and `trimmedTitle.length === 0`
- Uses SQL UPDATE with WHERE and RETURNING clauses
- Returns appropriate status codes for each scenario

### 💬 Discussion points

1. **PATCH vs PUT semantics**: In REST architecture, PATCH applies partial modifications while PUT replaces the entire resource. Why is this distinction important for API clients?

2. **SQL UPDATE behavior**: What would happen if you removed the WHERE clause from the UPDATE statement? Why is the WHERE clause critical?

3. **Idempotency**: If you call this PATCH endpoint multiple times with the same title, what happens? Is this endpoint idempotent? (Compare this to a POST endpoint.)

### 🧪 Test your solution

Test your endpoint using curl or Postman/Thunder Client/httpie:

```bash
# First, find an existing thread ID
curl http://localhost:3000/api/threads

# Then update its title (replace YOUR_THREAD_ID with actual ID)
curl -X PATCH http://localhost:3000/api/threads/YOUR_THREAD_ID \
  -H "Content-Type: application/json" \
  -d '{"title": "My Updated Title"}'

# Should return: {"id": "...", "title": "My Updated Title", "created_at": "..."}

# Test validation errors
curl -X PATCH http://localhost:3000/api/threads/YOUR_THREAD_ID \
  -H "Content-Type: application/json" \
  -d '{"title": ""}'

# Should return 400: {"error": "Title cannot be empty"}

# Test non-existent thread
curl -X PATCH http://localhost:3000/api/threads/00000000-0000-0000-0000-000000000000 \
  -H "Content-Type: application/json" \
  -d '{"title": "New Title"}'

# Should return 404: {"error": "Thread not found"}
```

---

<a name="step-2"></a>

## Step 2: Add edit route with nested routing

### 🤔 Problem to solve

Now that you have a backend endpoint, you need a user interface for editing thread titles. Instead of building a complex inline editing system with state management, you can use React Router's nested routes to create a cleaner separation between viewing and editing modes. The URL itself represents whether you're viewing (`/chat/:threadId`) or editing (`/chat/:threadId/edit`).

### 💡 Key concepts

- **Nested routes**: Child routes that render inside a parent route using the `Outlet` component
- **useRouteLoaderData()**: Access parent route's loader data without refetching
- **Outlet component**: Marks where child routes should render in the parent
- **Relative navigation**: `Link to="edit"` navigates to child, `redirect("..")` returns to parent
- **URL as state**: The route structure represents whether you're in view or edit mode
- **Uncontrolled inputs**: Use `defaultValue` instead of `value` + `onChange` for simple forms

### 📝 Your task

You need to make changes in **four files**:

#### 1. Create `frontend/app/routes/chat-thread-edit.jsx`

Create a new route component that:

- Uses `useRouteLoaderData("routes/chat-thread")` to access the parent route's `thread` data
- Renders a Form with method="post"
- Has an input field with `name="title"` using `defaultValue={thread.title}`
- Has a Save button (type="submit") and Cancel link (Link to="..")
- Implements a `clientAction` that:
  - Extracts title from formData
  - Validates it's not empty
  - Sends PATCH request to `/api/threads/:id`
  - Redirects to ".." on success
  - Returns error object on failure

#### 2. Update `frontend/app/routes.js`

Register the edit route as a nested child:

```javascript
route("chat/:threadId", "routes/chat-thread.jsx", [
  route("edit", "routes/chat-thread-edit.jsx"),
]);
```

#### 3. Update `frontend/app/routes/chat-thread.jsx`

- Import and add `Outlet` component (from "react-router")
- Place `<Outlet />` above the thread header (so the UI to edit the title appears at the top of the page)
- Add a Link to the edit route: `<Link to="edit">Edit</Link>`

#### 4. Update `frontend/app/app.css`

Add CSS for:

- `.edit-title-overlay` - Full-width container with background and padding
- `.edit-title-form` - Flexbox row layout with space-between
- `.form-field` - Container for label and input (flex-grow: 1)
- `.title-input` - Styled input field with border and padding
- `.save-button` and `.cancel-button` - Button styles with hover effects
- `.thread-title-edit-link` - Small bordered link next to the thread title
- Update `.chat-thread-header` - Add flexbox layout to center title with Edit link

...or however you want to style it. You can also make the nested route appear as a modal that covers the entire content area if you prefer.

### 🔍 Implementation hints

<details>
<summary>💡 Why use useRouteLoaderData?</summary>

The parent route (`chat-thread.jsx`) already fetched the thread data in its loader. Instead of fetching it again in the child route, use `useRouteLoaderData("routes/chat-thread")` to access the parent's data. This avoids duplicate API calls and keeps the data in sync.

</details>

<details>
<summary>💡 What is Outlet?</summary>

`Outlet` is a component from React Router that renders child routes. When you navigate to `/chat/:threadId/edit`, the edit component renders in place of the `<Outlet />` in the parent. This creates an overlay effect.

</details>

<details>
<summary>💡 Relative navigation</summary>

- `<Link to="edit">` navigates from `/chat/123` to `/chat/123/edit` (appends to current URL)
- `<Link to="..">` navigates from `/chat/123/edit` to `/chat/123` (goes up one level)
- `redirect("..")` in the action does the same navigation programmatically
</details>

<details>
<summary>💡 Why uncontrolled input?</summary>

For simple forms, you don't need React state. Use `defaultValue` to set the initial value, and read the value from `formData` in the action. This is simpler than controlled inputs with useState.

</details>

### 🤔 Before looking at the code

Think about:

- How does the URL structure (`/chat/:threadId` vs `/chat/:threadId/edit`) make the code simpler than using React state?
- Why does the Cancel button need to be a Link instead of a button?
- What happens to the Outlet when you're on `/chat/:threadId` without the `/edit`?

### ✅ Reference implementation

**🔗 Commit**: [`6a81b8c`](13/commits/6a81b8c)

The reference implementation shows:

- **chat-thread-edit.jsx**: Clean component with useRouteLoaderData, simple Form, and clientAction that handles PATCH and redirects
- **routes.js**: Nested route configuration using array syntax
- **chat-thread.jsx**: Outlet placed above the header, Link to="edit" in flexbox layout
- **app.css**: Complete styling for overlay form with proper spacing and hover states

### 💬 Discussion points

1. **State management alternatives**: How does using nested routes avoid the need for `useState` to track "editing" mode? What are the benefits of URL-based state?

2. **Data sharing patterns**: Compare `useRouteLoaderData` with these alternatives:

   - Adding a loader to the child route that fetches the same data
   - Passing data through React Context
   - Using a global state management library

   What are the tradeoffs?

3. **User experience**: The edit form appears as an overlay above the thread. How does this affect the user's mental model compared to inline editing?

### 🧪 Test your solution

1. **Navigate to edit mode**:

   - Open any thread
   - Click the "Edit" link next to the title
   - URL should change from `/chat/:threadId` to `/chat/:threadId/edit`
   - Edit form should appear above the thread

2. **Update a title**:

   - Change the title text
   - Click "Save"
   - Should redirect back to thread view
   - New title should be displayed

3. **Test cancel**:

   - Click "Edit" again
   - Change the title
   - Click "Cancel"
   - Should return to thread without saving changes

4. **Test validation**:

   - Click "Edit"
   - Clear the title field
   - Click "Save"
   - Should show an error message

5. **Check browser back button**:
   - Navigate to edit mode
   - Press browser back button
   - Should return to thread view (URL navigation works!)

---

<a name="step-3"></a>

## Step 3: Document PATCH endpoint in API documentation

### 🤔 Problem to solve

Your API now has a new endpoint, but other developers (including your future self) need to know how to use it. Good API documentation is essential for maintaining and sharing your work.

### 💡 Key concepts

- **API documentation standards**: Consistent format makes APIs easier to understand
- **Request/Response examples**: Show exactly what to send and expect
- **Status code documentation**: Explain what each response code means
- **Method semantics**: Explain why PATCH was chosen over PUT

### 📝 Your task

Add documentation for the PATCH endpoint to `backend/README.md`:

1. **Location**: Insert the new section between the POST threads section and the DELETE section
2. **Section heading**: `### PATCH /api/threads/:id`
3. **Include**:

   - Brief description explaining it's a partial update
   - URL parameters section (the `:id` parameter)
   - Request body format (JSON with title field)
   - Response examples for:
     - 200 OK (success)
     - 400 Bad Request (validation errors - show both missing title and empty title)
     - 404 Not Found (thread doesn't exist)
   - A note explaining why PATCH is used instead of PUT

4. **Match the format**: Follow the same structure as existing endpoint documentation in the README

### 🔍 Implementation hints

<details>
<summary>💡 Documentation structure to follow</summary>

Look at how other endpoints are documented in the README. Each one has:

- Heading with HTTP method and path
- Description paragraph
- **URL Parameters** section
- **Request Body** section with JSON example
- **Response** sections for each status code with JSON examples
- Any additional notes about behavior

Use the same markdown formatting and structure.

</details>

<details>
<summary>💡 What to explain about PATCH vs PUT</summary>

Your note should explain that PATCH is used because only the `title` field is updated. Other fields like `created_at` remain unchanged. This is a partial update, which is what PATCH is designed for.

</details>

### 🤔 Before looking at the code

Consider:

- What information would you want to know if you were integrating with this API for the first time?
- Why is it important to document error responses, not just success?
- How does consistent documentation format help teams work together?

### ✅ Reference implementation

**🔗 Commit**: [`dc62aa3`](13/commits/dc62aa3)

The reference implementation:

- Places the section logically between POST and DELETE (following CRUD order)
- Shows all three error scenarios with distinct examples
- Includes a note about PATCH vs PUT semantic differences
- Follows the exact same format as other endpoints in the README

### 💬 Discussion points

1. **Documentation as code**: Why is it valuable to keep API documentation in the same repository as the code? What are the risks of separate documentation?

2. **Living documentation**: How could you ensure documentation stays up-to-date as the API evolves? What tools or processes might help?

3. **API design consistency**: Notice how all endpoints follow similar patterns (validation errors return 400, missing resources return 404). Why is this consistency important?

### 🧪 Test your solution

1. **Read through the documentation**: Does it clearly explain:

   - What the endpoint does?
   - What you need to send?
   - What you'll get back?
   - What errors might occur?

2. **Compare with other endpoints**: Does your documentation section follow the same format and level of detail?

3. **Try using it**: Can someone follow your documentation to successfully make a request without looking at the code?

---

## 🎉 Congratulations!

You've completed the full CRUD implementation! You now have:

- ✅ **Create**: POST endpoints for threads and messages
- ✅ **Read**: GET endpoints for threads and messages
- ✅ **Update**: PATCH endpoint for thread titles
- ✅ **Delete**: DELETE endpoint for threads

**What you learned:**

1. **HTTP PATCH method** for partial resource updates
2. **SQL UPDATE statement** with WHERE and RETURNING clauses
3. **Nested routes** in React Router for related functionality
4. **useRouteLoaderData** to share data between parent and child routes
5. **Outlet component** for rendering child routes
6. **URL-based state** as an alternative to React state management
7. **API documentation** best practices

**Key takeaway**: Sometimes simpler patterns (like nested routes) are better than complex solutions (like inline editing with state management). The URL is a powerful way to represent your application's state!

## 🚀 Extra features if you have time

1. **Cancel confirmation**: If the user has made changes to the title, show a confirmation dialog when clicking Cancel

   - Track if the input value differs from original
   - Use native `confirm()` or build custom modal

2. **Keyboard shortcuts**: Add keyboard support for better UX

   - `Escape` key to cancel editing (same as Cancel button)
   - `Ctrl/Cmd + Enter` to submit (same as Save button)
   - Hint: Use `onKeyDown` event handler

3. **Edit history**: Track when a thread title was last modified

   - Add `updated_at` timestamp to threads table
   - Update it on PATCH
   - Display "Last edited" indicator in UI

4. **Edit messages**: Apply the same nested route pattern to allow editing message content

   - Add PATCH endpoint for messages
   - Create nested edit route for individual messages
   - Consider UX: should clicking a message enter edit mode?

## 📚 Additional resources

- [MDN: HTTP Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) - Detailed explanation of PATCH, PUT, and other HTTP methods
- [React Router: Nested Routes](https://reactrouter.com/start/framework/routing#nested-routes) - Official documentation on nested routing
- [React Router: Outlet](https://reactrouter.com/api/components/Outlet#outlet) - Official Outlet component documentation
- [React Router: useRouteLoaderData](https://reactrouter.com/api/hooks/useRouteLoaderData) - Hook for accessing parent route data
- [PostgreSQL: UPDATE](https://www.postgresql.org/docs/current/sql-update.html) - Complete reference for UPDATE statement
- [REST API Design: PUT vs PATCH](https://www.rfc-editor.org/rfc/rfc5789) - RFC 5789 defining the PATCH method
