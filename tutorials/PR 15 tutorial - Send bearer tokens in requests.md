# Sending Authentication Tokens - Step-by-Step Tutorial

## 📋 Table of Contents

1. [Step 1: Create apiFetch helper to include auth tokens](#step-1)
2. [Step 2: Update all loaders and actions to use apiFetch](#step-2)
3. [Step 3: Add logout functionality](#step-3)

## 🗺️ Overview

In this tutorial, you'll implement the **client-side authentication layer** for your chatbot application. After completing PR #14, users can register and log in, and JWT tokens are stored in localStorage. However, those tokens aren't being sent to the API yet—meaning the backend has no way to know who's making requests.

You'll solve this by:

- Creating a custom fetch wrapper that automatically includes JWT tokens in all API requests
- Refactoring all API calls to use this wrapper
- Adding logout functionality so users can end their sessions
- Displaying the current user's email in the sidebar

By the end of this tutorial, **every API request will include authentication tokens in the `Authorization` header**, preparing your application for backend authentication enforcement in the next PR.

## 🧑‍💻 Today's starting point

If you haven't fully completed the prior tutorials, you may copy the starting point of this tutorial by running this command in the root of your local repository:

```bash
npx degit --force bewildergeist/chatbot-react-postgres#pr-15-start
```

**Important**: Make a commit of this initial version before you start changing anything.

---

<a name="step-1"></a>

## Step 1: Create apiFetch helper to include auth tokens

### 🤔 Problem to solve

Currently, your application makes API requests using the standard `fetch()` function:

```javascript
const response = await fetch(`${apiUrl}/api/threads`);
```

This works, but it has two problems:

1. **No authentication**: The API doesn't receive any information about who the logged-in user is
2. **Code duplication**: Every route file constructs the full URL by combining `import.meta.env.VITE_API_URL` with the endpoint path

After users log in, their JWT token is stored in localStorage by Supabase. You need to send this token with every API request so the backend can identify the user. The standard way to do this is by adding an `Authorization` header with the format: `Bearer <token>`

### 💡 Key concepts

**Wrapper Functions**: Instead of changing every `fetch()` call in your application, you'll create a wrapper function that adds authentication automatically. This follows the **DRY principle** (Don't Repeat Yourself).

**Bearer Token Authentication**: The `Authorization` header follows this format:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The word "Bearer" indicates that whoever possesses ("bears") this token is authorized to access resources.

**Supabase Session**: Supabase provides `supabase.auth.getSession()` to retrieve the current user's session, which contains the access token.

### 📝 Your task

Create a new file `frontend/app/lib/apiFetch.js` that exports an `apiFetch` function with the following behavior:

**Function signature:**

```javascript
export async function apiFetch(path, options = {})
```

**The function should:**

1. Take a path (e.g., `/api/threads`) instead of a full URL
2. Construct the full URL by combining `import.meta.env.VITE_API_URL` with the path
3. Get the current session from Supabase using `supabase.auth.getSession()`
4. Extract the `access_token` from the session (if it exists)
5. Add an `Authorization: Bearer <token>` header to the request
6. Merge this with any existing headers from the `options` parameter
7. Call the standard `fetch()` function and return its result

### 🔍 Implementation hints

**Importing Supabase**: You'll need to import the supabase client from `./supabase.js`

**Destructuring the session**: `getSession()` returns `{ data: { session }, error }`

**Optional chaining**: Use `session?.access_token` to safely access the token (it will be `null` if user isn't logged in)

**Merging headers**: Use the spread operator to merge headers:

```javascript
const headers = {
  ...options.headers, // Keep existing headers
  // Add your Authorization header
};
```

**Return value**: Your function should return whatever `fetch()` returns (a Promise that resolves to a Response)

### ✅ Reference implementation

**🔗 Commit**: [`bb73206`](15/commits/bb73206)

After you've attempted the implementation, review the commit to see one solution. Pay attention to:

- How the function handles cases where the user isn't logged in
- The detailed comments explaining each step
- How environment variables are accessed

### 💬 Discussion points

1. **Why create a wrapper instead of modifying every fetch call?** What are the benefits of centralized authentication logic?

2. **What happens if a user isn't logged in?** Will the `apiFetch` function still work? Should it?

3. **Could you extend this pattern to add other features?** What else might you want to do automatically with every API request (logging, error handling, retries)?

---

<a name="step-2"></a>

## Step 2: Update all loaders and actions to use apiFetch

### 🤔 Problem to solve

Your new `apiFetch` helper is ready, but your application is still using the standard `fetch()` function. You need to refactor all API calls across your route files to use `apiFetch` instead.

This involves updating:

- **Loaders** that fetch data (GET requests)
- **Actions** that mutate data (POST, PATCH, DELETE requests)

The refactoring should accomplish two goals:

1. Add authentication tokens to all API requests
2. Simplify the code by removing redundant URL construction

### 💡 Key concepts

**Consistent API calls**: By using `apiFetch` everywhere, you ensure that all requests include authentication tokens automatically.

**Code simplification**: Before, you had to write:

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
const response = await fetch(`${apiUrl}/api/threads`);
```

Now you can write:

```javascript
const response = await apiFetch("/api/threads");
```

**Network inspection**: After this step, you'll be able to see the `Authorization` header in your browser's Network tab!

### 📝 Your task

Update **four route files** to use `apiFetch` instead of `fetch`:

1. **`frontend/app/routes/layout.jsx`**:

   - Import `apiFetch` from `../lib/apiFetch.js`
   - Update `clientLoader` to use `apiFetch('/api/threads')`
   - Update `clientAction` to use `apiFetch` for the DELETE request
   - Remove the `apiUrl` variable declarations

2. **`frontend/app/routes/chat-thread.jsx`**:

   - Import `apiFetch`
   - Update `clientLoader` to use `apiFetch` for both the thread and messages requests
   - Update `clientAction` to use `apiFetch` for the POST request
   - Remove `apiUrl` variable declarations

3. **`frontend/app/routes/chat-new.jsx`**:

   - Import `apiFetch`
   - Update `clientAction` to use `apiFetch` for the POST request
   - Remove `apiUrl` variable declaration

4. **`frontend/app/routes/chat-thread-edit.jsx`**:
   - Import `apiFetch`
   - Update `clientAction` to use `apiFetch` for the PATCH request
   - Remove `apiUrl` variable declaration

### 🔍 Implementation hints

**Import statement**: Add this to the top of each file:

```javascript
import { apiFetch } from "../lib/apiFetch.js";
```

**Path-only URLs**: Remember that `apiFetch` takes just the path, so change:

- `${apiUrl}/api/threads` → `/api/threads`
- `${apiUrl}/api/threads/${threadId}` → `/api/threads/${threadId}`

**Options parameter**: When `fetch()` has a second parameter (method, headers, body), pass it the same way to `apiFetch`:

```javascript
await apiFetch("/api/threads", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});
```

**Update comments**: Consider updating comments that mention "No authentication headers needed" or "Our API is public" to reflect that requests are now authenticated.

### ✅ Reference implementation

**🔗 Commit**: [`acea7fa`](15/commits/acea7fa)

The commit shows all four files being updated. Notice:

- How much cleaner the code looks without URL construction
- The consistent pattern across all loaders and actions
- Updated comments explaining that requests are now authenticated

### 💬 Discussion points

1. **What's the trade-off between convenience and explicitness?** Is it better to see the full URL in every API call, or to hide it in a wrapper function? What might we later add to `apiFetch` to make this trade-off worthwhile?

### 🧪 Test your solution

1. **Start your development servers** (frontend and backend)
2. **Log in** to your application
3. **Open DevTools** → Network tab
4. **Navigate around** the app (view threads, create messages, etc.)
5. **Click on any API request** to your backend (e.g., GET /api/threads)
6. **Look at Request Headers** - you should see:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

**🎯 Success criteria**: Every request to your API includes the Authorization header with a JWT token.

---

<a name="step-3"></a>

## Step 3: Add logout functionality

### 🤔 Problem to solve

Users can now log in and their tokens are sent with every request, but there's no way to log out! The "Batman" placeholder in the sidebar footer needs to be replaced with:

- The actual user's email address
- A logout button

You'll implement logout using the **intent pattern** you learned in PR #3, where a single route action handles multiple types of form submissions.

### 💡 Key concepts

**Intent pattern**: The layout route's `clientAction` already handles `intent="delete"` for removing threads. You'll add `intent="logout"` for signing out.

**Supabase signOut**: Calling `supabase.auth.signOut()` clears the session and tokens from localStorage.

**useEffect for data fetching**: To display the current user's email, you'll fetch the session when the component mounts using React's `useEffect` hook.

**Form without navigation**: The logout button will submit to the parent route (layout) without specifying an `action`, so it uses the current route's action.

### 📝 Your task

#### Part A: Update the layout action to handle logout

In `frontend/app/routes/layout.jsx`:

1. **Import supabase**: Add `import { supabase } from "../lib/supabase.js";`

2. **Add logout handling** to `clientAction`:

   - Check if `intent === "logout"`
   - Call `supabase.auth.signOut()` to clear the session
   - Use `redirect("/login")` to send the user to the login page
   - Don't forget to import `redirect` from "react-router" if it's not already imported

3. **Update the function comment** to mention that it handles both deletion and logout

#### Part B: Update the Sidebar to display user email and logout button

In `frontend/app/components/Sidebar.jsx`:

1. **Add imports**:

   - Import `Form` from "react-router" (add it to the existing import)
   - Import `supabase` from "../lib/supabase.js"

2. **Modify `SidebarFooter` component**:
   - Add state: `const [userEmail, setUserEmail] = React.useState(null);`
   - Add a `useEffect` that:
     - Calls `supabase.auth.getSession()`
     - Extracts the user's email from `session.user.email`
     - Sets it in state with `setUserEmail()`
   - Replace the hardcoded "Batman" with `{userEmail || "Loading..."}`
   - Update the avatar URL to use the user's email
   - Replace the `<a>` link with a `<Form method="post">` that contains:
     - A button with `name="intent"` and `value="logout"`

### 🔍 Implementation hints

**useEffect syntax**:

```javascript
React.useEffect(() => {
  const getUser = async () => {
    // Your async code here
  };
  getUser();
}, []); // Empty dependency array = run once on mount
```

**Destructuring session**:

```javascript
const {
  data: { session },
} = await supabase.auth.getSession();
```

**Form without action prop**: When `<Form method="post">` doesn't have an `action` prop, it submits to the current route's action.

**Intent button**:

```javascript
<button
  type="submit"
  name="intent"
  value="logout">
  Logout
</button>
```

**Avatar URL encoding**: Use `encodeURIComponent(userEmail || "User")` to safely encode the email for the URL.

### ✅ Reference implementation

**🔗 Commit**: [`d699eb5`](15/commits/d699eb5)

The commit shows:

- How the layout action is updated to handle both intents
- The complete `SidebarFooter` implementation with useEffect
- CSS changes for styling the logout button (you might want to add these too!)

### 💬 Discussion points

1. **Why use the intent pattern instead of creating a separate `/logout` route?** What are the trade-offs?

2. **What happens to JWT tokens when you log out?** Open DevTools → Application → Local Storage and look at the Supabase keys before and after logout.

3. **Why use `useEffect` instead of calling `getSession()` directly in the component body?** What would happen if you tried to call it without useEffect?

4. **Security consideration**: Right now, the backend doesn't check tokens—it would accept any request even without authentication. What do you expect to have to implement on the backend to enforce authentication?

### 🧪 Test your solution

1. **Log in** to your application
2. **Check the sidebar footer** - you should see your email address instead of "Batman"
3. **Click the logout button** (× or whatever icon you chose)
4. **Verify you're redirected** to `/login`
5. **Check localStorage** (DevTools → Application → Local Storage):
   - Before logout: You should see Supabase session keys
   - After logout: Those keys should be gone
6. **Try accessing a protected route** - what happens? (The app still works because the backend doesn't enforce auth yet!)

**🎯 Success criteria**:

- ✅ User email displays in sidebar
- ✅ Logout button redirects to login page
- ✅ Session is cleared from localStorage
- ✅ Authorization headers appear in Network tab again after re-login

---

## 🎉 Congratulations!

You've successfully implemented the **client-side authentication layer**! Your application now:

✅ Automatically includes JWT tokens in all API requests via the `Authorization` header  
✅ Uses a centralized `apiFetch` helper to avoid code duplication  
✅ Displays the current user's email in the sidebar  
✅ Provides a working logout flow that clears the session

### 🔍 What you can observe now

Open your browser's Network tab and watch the magic:

- Every API request includes `Authorization: Bearer <token>`
- You can copy a token and paste it into [jwt.io](https://jwt.io) to see what's inside
- The tokens are automatically refreshed by Supabase when they expire

### ⚠️ Important note

**The backend doesn't enforce authentication yet!** If you remove the Authorization header manually (using browser dev tools), the API would still work. That's intentional—it allows you to:

- See how tokens flow from client to server
- Understand the authentication mechanism before learning verification
- Build and test features without authentication blocking you

In **PR #16**, you'll add backend middleware to verify these tokens and reject unauthenticated requests.

## 📚 Additional resources

- [MDN: Authorization header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization)
- [JWT.io - Token decoder](https://jwt.io) - Paste your tokens here to see what's inside!
- [Supabase Auth documentation](https://supabase.com/docs/guides/auth)
- [React useEffect hook](https://react.dev/reference/react/useEffect)
- [DRY Principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)

**Next up**: PR #16 - Backend Authentication Enforcement, where you'll add middleware to verify these tokens and protect your API endpoints! 🔐
