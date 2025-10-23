# Backend authentication enforcement - Step-by-step tutorial

## 📋 Table of contents

1. [Step 1: Install @supabase/supabase-js in backend](#step-1)
2. [Step 2: Create Supabase client and requireAuth middleware](#step-2)
3. [Step 3: Protect all API endpoints with authentication](#step-3)

## 🗺️ Overview

In the previous tutorials, you built user registration and login, then updated your frontend to send JWT tokens with every API request. But your backend isn't checking those tokens yet—anyone can still access your API directly!

In this tutorial, you'll implement **authentication enforcement** on the backend. You'll learn how to verify JWT tokens on the server, understand the middleware pattern, and protect your API endpoints so only authenticated users can access them.

By the end of this tutorial:

- Your API will verify JWT tokens before processing requests
- Unauthenticated requests will receive 401 Unauthorized responses
- You'll understand how middleware works in Express
- Your app will seamlessly work for logged-in users (since the frontend already sends tokens)

**Key concepts**: JWT verification, Express middleware, Bearer tokens, authentication vs authorization, 401 status codes

## 🧑‍💻 Today's starting point

If you haven't fully completed the prior tutorials, you may copy the starting point of this tutorial by running this command in the root of your local repository:

```bash
npx degit --force bewildergeist/chatbot-react-postgres#pr-16-start
```

**Important**: Make a commit of this initial version before you start changing anything.

---

<a name="step-1"></a>

## Step 1: Install @supabase/supabase-js in backend

### 🤔 Problem to solve

Your backend needs to verify JWT tokens issued by Supabase Auth. Currently, you have the Supabase client library installed in your frontend, but not in your backend. Without this library, your backend has no way to validate the tokens that users are sending.

Think of it this way: your frontend is showing ID cards (JWT tokens) to the backend, but the backend doesn't have the tools to check if those ID cards are legitimate.

### 💡 Key concepts

**Why install the same package twice?**

- Your frontend and backend are separate applications
- Each has its own `package.json` and dependencies
- The frontend uses Supabase to create user sessions
- The backend uses Supabase to verify those sessions

**What does @supabase/supabase-js provide?**

- JWT token verification methods
- Connection to Supabase Auth API
- User session management utilities

**Backend vs Frontend Supabase usage:**

- **Frontend**: Creates sessions, manages login/logout, stores tokens
- **Backend**: Verifies tokens are legitimate and extracts user information

### 📝 Your task

1. Navigate to the `backend/` directory in your terminal
2. Install the `npm install @supabase/supabase-js` package using npm
3. Verify the installation by checking that `package.json` now includes `@supabase/supabase-js` in the dependencies

### 🔍 Implementation hints

- Use the same npm command you used to install packages in previous tutorials
- Make sure you're in the `backend/` directory, not the `frontend/` directory
- The installation will update both `package.json` and `package-lock.json`

### ✅ Reference implementation

**🔗 Commit**: [`6754475`](16/commits/6754475)

### 💬 Discussion points

**🤔 Think about this:**

1. Why can't the backend just trust any JWT token it receives? What if someone creates a fake token?
2. How do you think the Supabase library knows whether a token is legitimate or forged?
3. What security risk would exist if we didn't verify tokens on the backend?

### 🧪 Test your solution

After installing the package:

- Run `npm list` to confirm it's installed
- Check that `backend/package.json` includes the new dependency
- The installation itself is a success test—if there are no errors, you're good!

---

<a name="step-2"></a>

## Step 2: Create Supabase client and requireAuth middleware

### 🤔 Problem to solve

Now that you have the Supabase library installed, you need to:

1. Initialize a Supabase client in your backend
2. Create a **middleware function** that verifies JWT tokens
3. Configure your environment variables so the backend can connect to Supabase

This is where you'll implement the actual authentication logic. The middleware will intercept every incoming request, check for a valid token, and either allow the request to continue or reject it with a 401 error.

### 💡 Key concepts

**What is middleware?**
Middleware are functions that run **between** receiving a request and sending a response. They can:

- Modify the request object (like adding user information)
- Modify the response object
- End the request-response cycle
- Call the next middleware in the stack

Think of middleware as security checkpoints in an airport—each request passes through them in order.

**The middleware pattern:**

```javascript
function middleware(req, res, next) {
  // Do something with the request
  // If OK, call next() to continue
  // If not OK, send an error response
}
```

**Bearer token format:**

- HTTP Authorization header: `Authorization: Bearer <jwt-token>`
- "Bearer" indicates the type of authentication
- Standard format recognized across web APIs

**401 vs 403 status codes:**

- **401 Unauthorized**: "You need to log in" (authentication failed)
- **403 Forbidden**: "You're logged in, but you're not allowed" (authorization failed)

### 📝 Your task

**Part A: Create the authentication module**

1. Create a new file: `backend/auth.js`
2. Import the `createClient` function from `@supabase/supabase-js`
3. Initialize a Supabase client using environment variables (you can copy these over from your `frontend/.env` file):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. Add error checking if these environment variables are missing
5. Export the Supabase client

**Part B: Create the requireAuth middleware**

1. In the same `auth.js` file, create and export an `async` function called `requireAuth`
2. The function should accept three parameters: `req`, `res`, `next`
3. Implement the following logic:
   - Extract the `Authorization` header from `req.headers.authorization`
   - Check if the header exists (return 401 if missing)
   - Extract the token from the "Bearer <token>" format
   - Use `supabase.auth.getUser(token)` to verify the token
   - If verification fails, return 401 with an error message
   - If successful, attach the user ID to `req.userId`
   - Call `next()` to continue to the route handler
4. Wrap everything in a try-catch block for error handling

**Part C: Update environment variables**

1. Open `backend/.env.example`
2. Add documentation for the two new environment variables
3. Add placeholders for `SUPABASE_URL` and `SUPABASE_ANON_KEY`
4. Include helpful comments explaining where to find these values in Supabase

### 🔍 Implementation hints

**For the Supabase client:**

- Use the same pattern as your frontend Supabase client
- Get values from `process.env.VARIABLE_NAME` (not `import.meta.env` like in frontend)
- Consider throwing an error on startup if required env vars are missing

**For the middleware:**

- The Authorization header format is: `"Bearer eyJhbGc..."`
- Use `.split(" ")` to separate "Bearer" from the actual token
- `supabase.auth.getUser(token)` returns `{ data: { user }, error }`
- Remember to handle the case where the header is missing entirely
- Don't forget to call `next()` after successful authentication!

**For environment variables:**

- You can copy these values from your `frontend/.env` file. Or:
  - Find your Supabase URL in: Project Settings → Data API → Project URL
  - Find your anon key in: Project Settings → API Keys → `anon` `public`

### ✅ Reference implementation

**🔗 Commit**: [`5c9783a`](16/commits/5c9783a)

This commit shows:

- A complete authentication module with detailed comments
- Proper error handling for missing tokens
- Clear separation of concerns (client initialization vs middleware)
- Environment variable documentation

Pay special attention to:

- How the middleware extracts and verifies the token (lines in `auth.js`)
- The comprehensive comments explaining each step
- Error messages that help with debugging

### 💬 Discussion points

**🤔 Before looking at the code, consider:**

1. Why do we need to attach `user.id` to the `req` object? Where will this be useful?
2. What happens if we forget to call `next()` in the middleware?

**🔍 After reviewing the commit:**

1. Notice how the middleware modifies the `req` object before passing it along
2. How does the middleware "stop" a request from continuing if authentication fails?

---

<a name="step-3"></a>

## Step 3: Protect all API endpoints with authentication

### 🤔 Problem to solve

You now have a working authentication middleware, but it's not being used anywhere. Your API endpoints are still wide open — anyone can access them without logging in.

In this final step, you'll apply the `requireAuth` middleware to all your API routes (except the root endpoint, which should remain public). This will enforce authentication across your entire API.

### 💡 Key concepts

**Applying middleware to specific routes:**

```javascript
// Global middleware (runs for all routes)
app.use(express.json());

// Route-specific middleware (runs only for this route)
app.get("/api/threads", requireAuth, async (req, res) => {
  // Route handler code
});
```

**Why keep the root endpoint public?**
The root endpoint (`GET /`) is typically kept public so you can:

- Verify the server is running (health check)
- Display API information without authentication
- Test the server without needing credentials

**Request flow with middleware:**

1. Request arrives: `GET /api/threads` with Authorization header
2. Express matches the route
3. `requireAuth` middleware runs first
4. If authentication succeeds, `req.userId` is set
5. Route handler executes with access to `req.userId`
6. Response is sent back to client

**What happens when authentication fails:**

- Middleware returns 401 response immediately
- Route handler never executes
- Client receives error and can redirect to login

### 📝 Your task

1. Open `backend/server.js`
2. Import the `requireAuth` function from `./auth.js`
3. Add `requireAuth` as middleware to each of these routes:
   - `GET /api/threads`
   - `GET /api/threads/:id`
   - `GET /api/threads/:id/messages`
   - `POST /api/threads/:id/messages`
   - `POST /api/threads`
   - `PATCH /api/threads/:id`
   - `DELETE /api/threads/:id`
4. Update the documentation comment for each endpoint to mention authentication
5. Leave the root endpoint (`GET /`) unprotected

### 🔍 Implementation hints

**Importing the middleware:**

```javascript
import { requireAuth } from "./auth.js";
```

**Adding middleware to a route:**
Place the middleware function between the route path and the handler:

```javascript
// Before:
app.get("/api/threads", async (req, res) => { ... });

// After:
app.get("/api/threads", requireAuth, async (req, res) => { ... });
```

**Where to place the middleware:**

- It goes as the second argument (after the path string)
- Before the async route handler function
- Express will call middleware functions in order (left to right)

### ✅ Reference implementation

**🔗 Commit**: [`cd40d0b`](16/commits/cd40d0b)

This commit demonstrates:

- Importing and applying the middleware to all protected routes
- Updated documentation for each endpoint
- The root endpoint remaining unprotected

Key things to observe:

- The consistent pattern across all routes
- How minimal the code change is (just adding `requireAuth`)

### 💬 Discussion points

**🤔 Before implementing:**

1. What will happen if a user tries to access `/api/threads` without logging in?
2. Since the frontend already sends tokens (from PR #15), will this break the app?

**🔍 After reviewing the commit:**

1. Why doesn't the middleware need to be called differently for POST vs GET routes?
2. What would happen if you applied `requireAuth` globally with `app.use()` instead of per-route?
3. How do you expect to use `req.userId` in the next step (PR #17)?

### 🧪 Test your solution

Now it's time to test the full authentication flow!

**Test 1: Verify unauthenticated requests are blocked**

1. Make sure you're logged out of your app
2. Open the browser DevTools → Network tab
3. Try to access the chatbot
4. You should see API requests failing with 401 status codes
5. You should see the error in the frontend (could this be handled better?)

**Test 2: Verify authenticated requests work**

1. Log in to your app
2. Navigate to different threads
3. Create a new thread
4. Send messages
5. Everything should work normally—no errors!

**Test 3: Inspect authentication headers**

1. While logged in, open DevTools → Network tab
2. Click on any API request (like `GET /api/threads`)
3. Look at the Request Headers
4. Find the `Authorization` header—it should show: `Bearer eyJhbG...`

**Test 4: Test missing token**

1. Log in to your app
2. Open DevTools → Application → Local Storage
3. Find the Supabase auth token
4. Delete the token manually from local storage
5. Try to use the app—you should get 401 errors

**Test 5: Verify server is still accessible**

1. Open your browser to `http://localhost:3000/`
2. You should see the API information WITHOUT logging in
3. This confirms the root endpoint is public

**Common issues and solutions:**

| Problem                                     | Likely cause                          | Solution                                      |
| ------------------------------------------- | ------------------------------------- | --------------------------------------------- |
| 401 errors even when logged in              | Frontend not sending token            | Check `apiFetch` wrapper is used everywhere   |
| Server crashes on startup                   | Missing environment variables         | Update `.env` with Supabase URL and key       |
| All requests hang                           | Forgot to call `next()` in middleware | Add `next()` after successful auth            |
| "Cannot read property 'split' of undefined" | Authorization header missing          | Check header exists before calling `.split()` |

---

## 🎉 Congratulations!

You've successfully implemented backend authentication enforcement! Your API now:

✅ Verifies JWT tokens before processing requests  
✅ Returns 401 for unauthenticated users  
✅ Makes user ID available to route handlers via `req.userId`  
✅ Works seamlessly with your frontend's authentication

**What you learned:**

- How JWT token verification works on the backend
- The Express middleware pattern and execution order
- Bearer token format and Authorization headers
- The difference between authentication (401) and authorization (403)
- How to protect API endpoints without breaking existing functionality

**What's next:**
Right now, ALL users can see ALL threads—even though they're authenticated. In **PR #17**, you'll implement **authorization** (user data isolation), ensuring users can only see and modify their own threads. You'll use the `req.userId` that's now available in every route handler!

## 🚀 Extra features if you have time

Want to go deeper? Try these extensions:

1. **Add a middleware execution logger**

   - Create a logging middleware that runs before `requireAuth`
   - Log (using `console.log`) each request's method, path, and timestamp
   - See the middleware execution order in action

2. **Implement token refresh handling**

   - Research how Supabase handles token expiration
   - Update your middleware to check for expired tokens
   - Return a specific error code for expired vs invalid tokens

3. **Create a "health check" endpoint**

   - Add `GET /api/health` that checks database connectivity
   - Include this endpoint in the unprotected routes
   - Return server status, database status, and uptime

## 📚 Additional resources

**Express middleware:**

- [Express middleware guide](https://expressjs.com/en/guide/using-middleware.html) - Official Express documentation
- [Writing middleware](https://expressjs.com/en/guide/writing-middleware.html) - How to create your own middleware

**JWT and authentication:**

- [JWT.io](https://jwt.io/) - Decode and inspect JWT tokens
- [Introduction to JSON Web Tokens](https://jwt.io/introduction) - Comprehensive JWT guide

**Supabase Auth:**

- [Supabase Auth documentation](https://supabase.com/docs/guides/auth) - Complete auth guide

**HTTP status codes:**

- [HTTP status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) - Complete reference
