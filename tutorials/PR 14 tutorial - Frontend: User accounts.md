# User Accounts & Login UI - Step-by-Step Tutorial

## 📋 Table of Contents

1. [Step 1: Install Supabase client library](#step-1)
2. [Step 2: Create Supabase client module](#step-2)
3. [Step 3: Configure environment variables](#step-3)
4. [Step 4: Build the registration page](#step-4)
5. [Step 5: Build the login page](#step-5)
6. [Step 6: Style the authentication pages](#step-6)
7. [Step 7: Register authentication routes](#step-7)

## 🗺️ Overview

In this tutorial, you'll add user authentication to your chatbot application. Users will be able to create accounts and log in with email and password. You'll learn about password hashing, JWT (JSON Web Token) authentication, and how Supabase Auth manages user sessions.

**Important**: In this step, we're only building the UI for authentication. The backend won't enforce authentication yet, so your app will continue to work normally. This allows you to explore how authentication creates users, hashes passwords, and generates JWT tokens before we start using them.

**What you'll build:**

- User registration form at `/register`
- User login form at `/login`
- Password hashing with bcrypt (handled by Supabase)
- JWT token generation and storage (handled by Supabase)
- Form validation and error handling

**What you'll learn:**

- How authentication systems work
- What JWT tokens are and how they're structured
- Password security best practices
- Form handling in React Router
- Working with Supabase Auth API

## 🧑‍💻 Today's starting point

If you haven't fully completed the prior tutorials, you may copy the starting point of this tutorial by running this command in the root of your local repository:

```bash
npx degit --force bewildergeist/chatbot-react-postgres#pr-14-start
```

**Important**: Make a commit of this initial version before you start changing anything.

---

<a name="step-1"></a>

## Step 1: Install Supabase client library

### 🤔 Problem to solve

To add authentication to our app, we need a way to communicate with Supabase's authentication service. Supabase provides a JavaScript library that handles all the complex authentication logic for us, including password hashing, JWT token management, and session handling.

### 💡 Key concepts

**Supabase Client Library**: A JavaScript package that provides methods to interact with Supabase services. For authentication, it includes:

- `signUp()` - Create new user accounts
- `signInWithPassword()` - Log in existing users
- `signOut()` - Log out users
- `getSession()` - Check current login status
- Automatic JWT token storage and refresh

**Why use a library?** Authentication is complex and security-critical. Using a well-tested library prevents common security mistakes and saves development time.

### 📝 Your task

Install the Supabase JavaScript client library in your frontend project.

1. Open your terminal and navigate to the `frontend` directory
2. Run `npm install @supabase/supabase-js` to install the package
3. Verify the installation by checking that the package appears in your `package.json`

### ✅ Reference implementation

**🔗 Commit**: [`d2e11bf`](14/commits/d2e11bf1a5124bc423130cc40f61ff52fb2bf7eb)

---

<a name="step-2"></a>

## Step 2: Create Supabase client module

### 🤔 Problem to solve

Now that we have the Supabase library installed, we need to create a configured client instance that our entire app can use. This client needs to know which Supabase project to connect to (via URL) and needs authentication credentials (via API key).

### 💡 Key concepts

**Singleton Pattern**: We create one Supabase client instance and export it for the entire app to share. This ensures consistent configuration and prevents creating multiple unnecessary connections.

**Environment Variables**: Sensitive configuration (like API keys) should never be hardcoded. Instead, we use environment variables that can be different in development vs. production.

**Anon Key vs. Service Role Key**:

- **Anon Key** (public): Safe to expose in browser code. Has limited permissions. ✅ Use this on frontend.
- **Service Role Key** (secret): Bypasses all security rules. ❌ Never expose in browser!

**What is a JWT?**: JWT (commonly pronounced "jot", believe it or not) stands for JSON Web Token. It's a secure way to transmit user information between your app and the server. When you log in, Supabase creates a JWT containing your user ID and other info, signs it with a secret key, and stores it in your browser. You can decode JWTs (but not modify them) at [jwt.io](https://jwt.io).

### 📝 Your task

Create a new file `frontend/app/lib/supabase.js` that:

1. Imports `createClient` from the Supabase library
2. Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from environment variables
3. Checks that both variables are set (throws an error if missing)
4. Creates a Supabase client with these credentials
5. Exports the client so other files can import it

### 🔍 Implementation hints

- Vite (your build tool) exposes environment variables through `import.meta.env`
- Only environment variables starting with `VITE_` are accessible in browser code
- Use `createClient(url, key)` to create the client
- Export using `export const supabase = ...`
- Add helpful comments explaining what the anon key is and why it's safe for frontend use

### ✅ Reference implementation

**🔗 Commit**: [`0243f03`](14/commits/0243f03cb8fb45ef9c30d8f8d6a0857cdef053bd)

View this commit to see one way to structure the Supabase client module with clear documentation.

### 💬 Discussion points

1. **Why check for missing environment variables?** It's better to fail fast with a clear error message than to have mysterious bugs later.

2. **What happens if someone steals your anon key?** Not much! The anon key is designed to be public. All security rules are enforced on the Supabase server, not in your frontend code.

3. **Why not just import the Supabase library directly everywhere?** Centralizing configuration means you only need to set up the client once, and all parts of your app use the same configuration.

### 🧪 Test your solution

Try importing your module in another file (you can remove this test import after):

```javascript
import { supabase } from "./lib/supabase";
console.log(supabase); // Should log the Supabase client object
```

---

<a name="step-3"></a>

## Step 3: Configure environment variables

### 🤔 Problem to solve

Your Supabase client needs to know two things: where your Supabase project is (URL) and how to authenticate with it (anon key). These values are different for every developer and every environment (development, staging, production), so they need to be configurable. You should already have these configured from earlier tutorials, but let's ensure everything is set up correctly.

### 💡 Key concepts

**`.env.example` file**: A template showing what environment variables your project needs. Committed to git so others know what to configure.

**`.env` file**: Your actual environment variables with real values. Never committed to git (should be in `.gitignore`).

**How to get your Supabase credentials**:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to Settings → API
4. Copy your "Project URL" and "anon public" key

### ✅ Reference implementation

**🔗 Commit**: [`5915bc8`](14/commits/5915bc8f320b9882b8591328db5cec087ff5ebb1)

### 💬 Discussion points

1. **Why use a `.env.example` file instead of just documentation?** It serves as a checklist of required configuration and shows the exact variable names developers need.

2. **What happens if you forget to create the `.env` file?** Your app will crash with the error message you wrote in Step 2, making it easy to diagnose.

3. **How do environment variables work in production?** Hosting platforms like Netlify and Vercel have UI dashboards where you can set environment variables securely.

---

<a name="step-4"></a>

## Step 4: Build the registration page

<img width="590" height="831" alt="register-account-route" src="https://github.com/user-attachments/assets/749b2752-f6cb-4c2b-9c44-5f55f9c8194d" />

### 🤔 Problem to solve

Users need a way to create accounts for your chatbot. We need a form where they can enter their email and password, validate their input, send it to Supabase, and handle success or error responses.

### 💡 Key concepts

**Password Security**:

- **Never store plain text passwords!** When a user registers, Supabase hashes the password using bcrypt before storing it.
- **Hashing is one-way**: You can't reverse a hash back to the original password.
- **Salting**: Each password gets a unique random "salt" added before hashing, so identical passwords produce different hashes.
- Even Supabase admins cannot see users' passwords!

**React Router Forms**:

- `<Form>` component submits to a `clientAction` function
- `clientAction` runs on form submission, processes the data
- Return an error object to display errors, or redirect on success
- `useActionData()` hook accesses the returned error data
- `useNavigation()` hook tells you if the form is currently submitting

**Supabase Auth signUp**:

```javascript
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "secure-password",
});
```

### 📝 Your task

Create a new file `frontend/app/routes/register.jsx` with:

1. **Register component** that renders:

   - A heading "Create Account"
   - A form with email, password, and confirm password inputs
   - Error message display (if actionData.error exists)
   - Submit button showing "Creating account..." while submitting
   - Link to login page for existing users

2. **clientAction function** that:

   - Extracts email, password, and confirmPassword from formData
   - Validates all fields are filled
   - Checks passwords match
   - Checks password is at least 6 characters
   - Calls `supabase.auth.signUp()` with email and password
   - Returns error object if anything fails
   - Redirects to `/login?registered=true` on success

### 🔍 Implementation hints

- Structure: One input per `<div>` with a `<label>` and `<input>`
- Get form data: `const email = formData.get('email')`
- Check submitting state: `navigation.state === 'submitting'`
- The form should POST to its own route (Form component handles this automatically)
- Use `type="email"` for email input and `type="password"` for password inputs
- Add `autoComplete="email"` and `autoComplete="new-password"` for better UX
- Add `required` and `minLength={6}` HTML attributes for browser validation too

### ✅ Reference implementation

**🔗 Commit**: [`021c965`](14/commits/021c965851aaacdc7889082081eb08d88e3bce00)

After building your registration page, compare it with the reference implementation. Notice how the code is structured and documented.

### 💬 Discussion points

1. **Why validate on both frontend and backend?** Frontend validation provides instant feedback for better UX. Backend validation (handled by Supabase) prevents malicious users from bypassing client-side checks.

2. **What happens to the password between your form and the database?** It travels over HTTPS (encrypted), reaches Supabase servers, gets hashed with bcrypt, and only the hash is stored.

3. **Why redirect with a query parameter `?registered=true`?** This lets the login page show a success message welcoming the new user.

### 🧪 Test your solution

1. Navigate to `http://localhost:5173/register` (**note:** jump to Step 7 to register the route first)
2. Try submitting empty form - should show error
3. Try passwords that don't match - should show error
4. Try a short password - should show error
5. Register with valid email/password - should redirect to login
6. Check Supabase Dashboard → Authentication → Users - your new user should appear!
7. Find the user under Table Editor → Schema: auth → users to see hashed password and metadata

💡 **Explore**: Click on your user in Supabase Dashboard to see their ID (UUID), email, and when they were created. This user now exists in the `auth.users` table.

---

<a name="step-5"></a>

## Step 5: Build the login page

<img width="579" alt="login-route" src="https://github.com/user-attachments/assets/6ed18480-cd86-472b-9764-68135aa36821" />

### 🤔 Problem to solve

Now that users can register, they need a way to log back in. We'll create a login form that verifies credentials and stores a JWT token for authenticated requests.

### 💡 Key concepts

**Authentication Flow**:

1. User enters email and password
2. Form submits to Supabase Auth API
3. Supabase retrieves the password hash for that email
4. Supabase uses bcrypt to check if entered password matches stored hash
5. If match: Supabase generates a JWT token and returns it
6. Token is stored in localStorage automatically by Supabase client
7. User is redirected to home page

**JWT Tokens - What's Inside**:
A JWT has three parts separated by dots: `header.payload.signature`

- **Header**: Token type and signing algorithm
- **Payload**: User info (ID, email, expiration time)
- **Signature**: Cryptographic signature proving the token wasn't tampered with

**Where are tokens stored?**

- Supabase stores JWT in localStorage with key: `sb-<project-id>-auth-token`
- Open DevTools → Application → Local Storage to see it
- Go to [jwt.io](https://jwt.io) and paste your token to decode it!

**Supabase Auth signIn**:

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "secure-password",
});
// data.session contains the JWT tokens
// data.user contains user information
```

### 📝 Your task

Create a new file `frontend/app/routes/login.jsx` with:

1. **Login component** that renders:

   - Heading "Welcome Back"
   - Success message if `?registered=true` query parameter exists
   - Form with email and password inputs (no confirm password needed!)
   - Error message display
   - Submit button with loading state
   - Link to registration page for new users

2. **clientAction function** that:

   - Extracts email and password from formData
   - Validates both fields are filled
   - Calls `supabase.auth.signInWithPassword()` with credentials
   - Returns error if login fails
   - Redirects to `/` (home) on success

### 🔍 Implementation hints

- Get query params: `const [searchParams] = useSearchParams()`
- Check for registered: `searchParams.get('registered') === 'true'`
- Password input should use `autoComplete="current-password"` (not "new-password")

### ✅ Reference implementation

**🔗 Commit**: [`c4300d2`](14/commits/c4300d22329ebb70ea21509964c23c69c71b7fa1)

Review this commit to see how the login page provides both functionality and educational value through its UI.

### 💬 Discussion points

1. **Why not just check if the password is correct in the frontend?** Passwords are hashed - your frontend doesn't have access to the original password. Only the server can verify hashes.

2. **Can users fake a JWT token?** No! Tokens are cryptographically signed. If you change any data, the signature becomes invalid and Supabase will reject it.

3. **What's the difference between access_token and refresh_token?** Access tokens expire quickly (usually 1 hour). Refresh tokens last longer and are used to get new access tokens. Supabase handles this refresh automatically!

### 🧪 Test your solution

<img width="2454" height="494" alt="supabase-access-token" src="https://github.com/user-attachments/assets/d8e361ac-c7d6-411d-9a8e-88748cf887fe" />

1. Navigate to `http://localhost:5173/login` (**note:** jump to Step 7 to register the route first)
2. Try logging in with wrong credentials - should show error
3. Log in with the account you created in Step 4 - should redirect to home
4. Open DevTools → Application → Local Storage
5. Find the key starting with `sb-` and ending with `-auth-token`
6. Copy the `access_token` value
7. Go to [jwt.io](https://jwt.io) and paste it in the "Encoded" box
8. Examine the decoded payload - see your user ID, email, expiration time!

💡 **Explore**: Try manually changing one character in your JWT token in localStorage, then refresh the page. Supabase will detect the invalid signature and you'll be logged out. This demonstrates why JWTs are secure!

---

<a name="step-6"></a>

## Step 6: Style the authentication pages

### 🤔 Problem to solve

Your registration and login pages work functionally but look unstyled. We need CSS that makes the forms look professional, provides visual feedback (like focus states), and matches the existing design of your chatbot.

### 💡 Key concepts

**CSS Variables**: Your app uses CSS custom properties (variables) defined in `:root` for consistent colors, spacing, and styling across all pages. Reuse these variables in your auth page styles.

**Responsive Design**: Forms should work well on both desktop and mobile devices. Use flexible units and layouts.

**Form UX Best Practices**:

- Clear visual hierarchy (heading → subtitle → form)
- Proper label-input association (for accessibility)
- Visible focus states (keyboard navigation)
- Disabled state styling (when form is submitting)
- Error/success message styling (color-coded feedback)

**Layout Strategy**:

- Center the form card on the page
- Use consistent spacing and padding
- Provide visual feedback on interaction (hover, focus, disabled states)

### 📝 Your task

Add CSS to `frontend/app/app.css` for the login and registration pages.

### 🔍 Implementation hints

- Look at existing CSS variables in `:root` and use them (`var(--variable-name)`)
- Common variables: `--bg-primary`, `--bg-secondary`, `--text-primary`, `--text-muted`, `--border-light`
- Use flexbox for centering: `display: flex; align-items: center; justify-content: center`
- Focus states: `input:focus { border-color: ...; box-shadow: ... }`
- Disabled button: `button:disabled { opacity: 0.6; cursor: not-allowed }`
- Add your styles at the end of the CSS file, starting with a comment: `/* Authentication Pages */`

### ✅ Reference implementation

**🔗 Commit**: [`ec64004`](14/commits/ec640042ad3179497ad0b8c5bd05e8ecdeedffb8)

Check this commit to see comprehensive authentication page styles. Notice how it uses CSS variables for consistency and provides clear visual feedback.

### 💬 Discussion points

1. **Why use CSS variables instead of hardcoding colors?** CSS variables create a single source of truth. If you change a color variable, it updates everywhere automatically.

2. **What's the purpose of distinct focus states?** Accessibility! Keyboard users need clear visual indication of which element is focused.

3. **Why style disabled buttons differently?** It provides instant visual feedback that clicking won't work (because form is submitting) and prevents double submissions.

### 🧪 Test your solution

1. Visit `/register` - form should be centered with a nice card layout
2. Tab through form fields - should see focus states
3. Try submitting while fields are empty - error message should be styled
4. Visit `/login` - should have consistent styling
5. Test on mobile (DevTools → Toggle device toolbar) - should be responsive
6. Try reducing browser width - form should remain usable

💡 **Experiment**: Try changing a CSS variable in `:root` (like `--bg-primary`) and see how it affects both your auth pages and the rest of the app.

---

<a name="step-7"></a>

## Step 7: Register authentication routes

### 🤔 Problem to solve

You've created login and register pages, but React Router doesn't know they exist yet! You need to add route configurations so users can navigate to `/login` and `/register`.

### 💡 Key concepts

**React Router Configuration**: Routes are defined in `routes.js` using the `route()` function. Each route maps a URL path to a component file.

**Layout Routes**: Your app has a main layout (`routes/layout.jsx`) that includes the sidebar. Auth pages should be **outside** this layout so they appear without the sidebar for a cleaner experience.

**Route Structure**:

```javascript
export default [
  route("/", "routes/layout.jsx", [
    // Routes inside layout (with sidebar)
  ]),
  // Routes outside layout (no sidebar)
  route("login", "routes/login.jsx"),
];
```

### 📝 Your task

Edit `frontend/app/routes.js` to add two new routes:

1. Add a route for path `"login"` pointing to `"routes/login.jsx"`
2. Add a route for path `"register"` pointing to `"routes/register.jsx"`
3. Place these routes **outside** the main layout route (after the closing bracket)

### 🔍 Implementation hints

- Open `frontend/app/routes.js`
- Find where the main route configuration ends (after the nested routes array)
- Add your two new routes after the main layout route but inside the exported array
- Use the same `route()` function that's already imported
- Path is just the string (no leading slash needed): `"login"` not `"/login"`
- File path is relative to the `routes` folder: `"routes/login.jsx"`

### ✅ Reference implementation

**🔗 Commit**: [`ba62fa7`](14/commits/ba62fa7ff31dba5e5607aedb3e62b843036bf9e3)

### 💬 Discussion points

1. **Why place auth routes outside the layout?** The sidebar would be distracting and not useful on login/register pages. Users should focus solely on authentication.

2. **Could we create a separate layout just for auth pages?** Absolutely! You could create `routes/auth-layout.jsx` and nest login/register inside it. That's a great refactoring option if auth pages need shared UI.

### 🧪 Test your solution

1. Start your dev server: `npm run dev`
2. Navigate to `http://localhost:5173/register` - should see your registration form (no sidebar!)
3. Navigate to `http://localhost:5173/login` - should see your login form (no sidebar!)
4. Click "Sign up" link on login page - should navigate to register
5. Click "Log in" link on register page - should navigate to login
6. Try navigating to the home page `/` - should still show the sidebar

**Full Test Flow**:

1. Go to `/register`
2. Create an account (use a real email you can access if email verification is enabled — otherwise you can disable it in Supabase settings for testing)
3. Submit form → should redirect to `/login?registered=true`
4. See success message on login page
5. Log in with your credentials
6. Should redirect to home page (`/`)
7. Open DevTools → Application → Local Storage
8. See your JWT token stored
9. Copy `access_token` and decode it at jwt.io
10. See your user data in the token payload!

---

## 🎉 Congratulations!

You've successfully built a complete authentication system for your chatbot! Here's what you accomplished:

### What You Built

- ✅ User registration with password validation
- ✅ User login with credential verification
- ✅ Automatic JWT token generation and storage
- ✅ Password hashing with bcrypt (via Supabase)
- ✅ Professional, styled authentication UI
- ✅ Form validation and error handling

### What You Learned

- **Authentication fundamentals**: The difference between authentication (who you are) and authorization (what you can access)
- **Password security**: Why we hash passwords, how bcrypt works, what salting means
- **JWT tokens**: What they are, how they're structured, how they're used
- **Supabase Auth**: How to use a managed authentication service
- **React Router forms**: clientAction functions, form submission, redirects
- **Environment variables**: How to configure apps with sensitive credentials

### What's Next?

Right now, your auth system creates users and stores tokens, but your app doesn't actually use them yet! Here's what's coming:

**Next PR**: We'll update all your data fetching to include JWT tokens in the Authorization header. You'll see the tokens being sent with every request!

**Later PRs**: The backend will start enforcing authentication (requiring tokens), then we'll add authorization (users only see their own data).

### Current State

Try this to understand the current state:

1. Open two different browsers (e.g., Chrome and Firefox)
2. Register different users in each browser
3. Create threads in each browser
4. Notice that **both users see the same threads** - this is expected!
5. We haven't filtered data by user yet (that's authorization, coming in PR #17)

## 🚀 Extra features if you have time

If you want to extend your learning, try implementing these features:

### 1. Password Strength Indicator

Add a visual indicator showing password strength as the user types:

- Weak: < 8 characters
- Medium: 8+ characters with letters and numbers
- Strong: 12+ characters with letters, numbers, and special characters

### 2. Show/Hide Password Toggle

Add an eye icon button that toggles password visibility between `type="password"` and `type="text"`.

### 3. Loading Animation

Replace "Creating account..." text with a spinner or animated loading indicator.

### 4. Explore the Database

Open Supabase Dashboard and:

- Find your user in the `auth.users` table
- Note the UUID (universally unique identifier) assigned to each user
- See the `encrypted_password` field (the bcrypt hash)
- Look at the `created_at` and `last_sign_in_at` timestamps
- Try clicking "View" on a user to see all their fields

## 📚 Additional resources

### Authentication & Security

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth) - Complete guide to Supabase authentication
- [JWT.io](https://jwt.io/) - Interactive JWT decoder and documentation
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) - Security best practices
- [How Password Hashing Works](https://auth0.com/blog/hashing-passwords-one-way-road-to-security/) - Deep dive into bcrypt

### Supabase

- [Supabase Auth API Reference](https://supabase.com/docs/reference/javascript/auth-api) - Complete API documentation

### General Web Development

- [MDN: Form Validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation) - Client-side validation techniques
- [Web.dev: Sign-in Form Best Practices](https://web.dev/sign-in-form-best-practices/) - UX and accessibility guidelines

---

**Ready for the next step?** Continue to PR #15 where you'll start sending JWT tokens with your API requests and explore them in the Network tab!
