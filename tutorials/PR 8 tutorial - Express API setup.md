# Building your own REST API - Step-by-step tutorial

## 📋 Table of contents

1. [Step 1: Create minimal Express server structure](#step-1)
2. [Step 2: Add database connection with the postgres library](#step-2)
3. [Step 3: Implement GET /api/threads endpoint](#step-3)
4. [Step 4: Update frontend to fetch threads from local API](#step-4)
5. [Step 5: Add backend README with setup and testing instructions](#step-5)

## 🗺️ Overview

In this tutorial, you'll (start to) build your own REST API to replace the Supabase REST API you've been using. You'll create an Express.js server that connects directly to your Supabase PostgreSQL database and implements the same functionality—but this time, **you're in control**.

By the end of this tutorial, you'll understand:

- How to set up an Express.js server from scratch
- How to connect to a PostgreSQL database
- How to write SQL queries to fetch data
- How REST APIs work under the hood
- Why companies like Supabase exist (and what they do for you!)

**Important**: This is a hands-on tutorial. Try to implement each step yourself before looking at the reference commit. The commits are there to help you if you get stuck or to compare your solution afterwards.

---

<a name="step-1"></a>

## Step 1: Create minimal Express server structure

### 🤔 Problem to solve

Right now, your frontend application fetches data directly from Supabase's REST API. But what if you want more control? What if you need custom business logic, authentication, or data processing before returning results?

The solution is to build your own API server that sits between your frontend and the database. This gives you complete control over how data is accessed and manipulated.

### 💡 Key concepts

- **Express.js**: A minimal Node.js framework for building web servers and APIs
- **package.json**: Defines your project dependencies and scripts
- **Environment variables**: Store configuration (like port numbers) outside your code
- **Node's `--env-file` flag**: Built-in way to load environment variables (Node 20+)

### 📝 Your task

Create a new `backend` directory with the following:

1. **Initialize the project**:

   - Create `backend/package.json` with:
     - Project metadata (name, version, description)
     - Set `"type": "module"` to use ES6 imports
     - Add `express` as a dependency
     - Create two npm scripts:
       - `start`: Run the server normally
       - `dev`: Run with `--watch` flag for auto-restart and `--env-file=.env` to load environment variables

2. **Create the basic server** (`backend/server.js`):

   - Import Express
   - Create an Express app
   - Set the PORT from `process.env.PORT` or default to 3000
   - Create a root route (`GET /`) that returns a JSON object with a welcome message
   - Start the server listening on the PORT

3. **Protect sensitive data**:
   - Create `backend/.gitignore` to prevent committing `.env` and `node_modules/`

### 🔍 Implementation hints

<details>
<summary>💡 What should package.json look like?</summary>

Your `package.json` needs:

- `"type": "module"` for ES6 imports
- Express dependency (version ^4.18.2 or higher)
- Scripts that use `node --env-file=.env` and `--watch` for development
</details>

<details>
<summary>💡 How do I create an Express server?</summary>

```javascript
import express from "express";
const app = express();
// ... define routes ...
app.listen(PORT, () => console.log("Server running"));
```

</details>

<details>
<summary>💡 What should the root route return?</summary>

Return a JSON object that confirms the server is running. Make it friendly and informative!

</details>

### ✅ Reference implementation

**🔗 Commit**: [`7fb50ae`](8/commits/7fb50ae598068210111782b3b3c59617cfe9110d)

After you've tried implementing this yourself, check the commit to see one way to solve it.

### 💬 Discussion points

1. **Why use `"type": "module"` in package.json?** What's the difference between `import` and `require()`?

2. **Why use environment variables for configuration?** What problems would arise if we hardcoded the port number?

3. **What does the `--watch` flag do?** How does this improve the development experience?

### 🧪 Test your solution

```bash
# Install dependencies
cd backend
npm install

# Start the server
npm run dev

# In another terminal or browser, test the endpoint
curl http://localhost:3000/
```

You should see a JSON response with your welcome message!

---

<a name="step-2"></a>

## Step 2: Add database connection with the postgres library

### 🤔 Problem to solve

Your Express server is running, but it can't talk to the database yet. You need to:

1. Connect to your Supabase PostgreSQL database
2. Make this connection available to your route handlers
3. Do it securely (never commit passwords!)

### 💡 Key concepts

- **PostgreSQL connection string**: A URL containing all credentials needed to connect to a database
- **postgres.js library**: A lightweight PostgreSQL client for Node.js
- **Tagged templates**: The `` sql`query` `` syntax that safely handles user input
- **Environment variables**: Store the DATABASE_URL securely
- **.env.example**: Document required variables without exposing secrets

### 📝 Your task

1. **Add the postgres dependency**:

   - Update `package.json` to include the `postgres` library

2. **Create a database connection module** (`backend/db.js`):

   - Import the postgres library
   - Read `DATABASE_URL` from `process.env`
   - Throw a helpful error if `DATABASE_URL` is missing
   - Create the database connection
   - Export the `sql` function for use in other files

3. **Document environment variables**:

   - Create `backend/.env.example` showing:
     - `DATABASE_URL` with a template (placeholder values)
     - `PORT` with the default value
     - Comments explaining where to find these values in Supabase

4. **Update .gitignore**:
   - Ensure `.env` files are never committed
   - Also ignore `node_modules/` and log files

### 🔍 Implementation hints

<details>
<summary>💡 Where do I find my DATABASE_URL?</summary>

1. Go to your Supabase project dashboard
2. Click **Connect** in the header
3. Find **Connection String** > **URI** > **Transaction pooler**
4. Copy the connection string and replace `[YOUR-PASSWORD]` with your actual database password
</details>

<details>
<summary>💡 How does the postgres library work?</summary>

```javascript
import postgres from "postgres";
const sql = postgres(connectionString);
// Now you can use: const result = await sql`SELECT * FROM table`;
```

The `sql` function is a "tagged template" that safely handles variables.

</details>

<details>
<summary>💡 Why validate DATABASE_URL?</summary>

If someone forgets to set the environment variable, they'll get a cryptic connection error. Better to give them a clear, helpful error message right away!

</details>

### ✅ Reference implementation

**🔗 Commit**: [`1aa6e0c`](8/commits/1aa6e0c57b522d0b24408e7bb21736ce10019c02)

### 💬 Discussion points

1. **What is a connection string?** Why put all credentials in one URL instead of separate variables?

2. **Why create a separate db.js file?** Why not just connect in server.js?

3. **What is a "tagged template literal"?** How is `` sql`SELECT...` `` different from a regular string?

### 🧪 Test your solution

You won't be able to fully test this until the next step, but you can:

1. Create a `.env` file based on `.env.example`
2. Add your real DATABASE_URL
3. Try importing your `db.js` file in `server.js` (just import it, don't use it yet)
4. Run `npm run dev` and make sure there are no connection errors

---

<a name="step-3"></a>

## Step 3: Implement GET /api/threads endpoint

### 🤔 Problem to solve

Now you have a server and a database connection—time to bring them together! You need to:

1. Create an API endpoint that fetches threads from the database
2. Write your first SQL query
3. Handle errors gracefully
4. Enable CORS so your frontend can access the API

### 💡 Key concepts

- **SQL SELECT**: The most basic SQL command for retrieving data
- **ORDER BY**: Sort query results
- **REST API endpoint**: A URL that responds to HTTP requests
- **CORS (Cross-Origin Resource Sharing)**: Browser security that blocks requests between different origins (ports)
- **Async/await**: Handle asynchronous database operations
- **Error handling**: Try/catch blocks to handle database errors

### 📝 Your task

1. **Add CORS support**:

   - Add `cors` dependency to package.json
   - Import `cors` in server.js
   - Add the CORS middleware with `app.use(cors())`

2. **Import your database connection**:

   - Import the `sql` function from `./db.js`

3. **Create the GET /api/threads endpoint**:

   - Make the handler async (it will await database calls)
   - Write a SQL query that:
     - SELECTs the `id`, `title`, and `created_at` columns
     - FROM the `threads` table
     - ORDERs BY `created_at` in DESCending order (newest first)
   - Execute the query using the `` sql`...` `` tagged template
   - Return the results as JSON
   - Wrap everything in try/catch for error handling

4. **Add comprehensive error handling**:
   - Log errors to the console (for developers)
   - Return a 500 status with a generic error message (for users)

### 🔍 Implementation hints

<details>
<summary>💡 What is CORS and why do I need it?</summary>

Your frontend runs on `http://localhost:5173` (Vite) and your backend on `http://localhost:3000`. Browsers block these cross-origin requests by default for security. The `cors()` middleware tells browsers it's OK to allow these requests.

</details>

<details>
<summary>💡 How do I write the SQL query?</summary>

Think about what data you need:

- Which columns? (id, title, created_at)
- From which table? (threads)
- In what order? (newest first = DESC)

```sql
SELECT column1, column2 FROM table ORDER BY column DESC
```

</details>

<details>
<summary>💡 How do I use the sql tagged template?</summary>

```javascript
const results = await sql`
  SELECT id, title, created_at 
  FROM threads 
  ORDER BY created_at DESC
`;
```

The backticks are important—this is a tagged template, not a regular string!

</details>

<details>
<summary>💡 What should my error handling look like?</summary>

```javascript
try {
  // database query
  res.json(results);
} catch (error) {
  console.error("Descriptive message:", error);
  res.status(500).json({ error: "Generic message for users" });
}
```

</details>

### ✅ Reference implementation

**🔗 Commit**: [`2587422`](8/commits/25874229910007862156b051e76ab840f1ee6179)

### 💬 Discussion points

1. **Why ORDER BY created_at DESC?** What would happen if we used ASC? What if we omitted ORDER BY entirely?

2. **Why return only specific columns** (id, title, created_at) instead of `SELECT *`?

3. **Why log errors on the server but return generic messages to clients?** What security issues could arise from detailed error messages?

4. **What does async/await actually do?** What would happen if we forgot the `await` keyword?

### 🧪 Test your solution

```bash
# Make sure your .env file has DATABASE_URL set
# Start the server
npm run dev

# Test the endpoint
curl http://localhost:3000/api/threads

# Or open in browser:
# http://localhost:3000/api/threads
```

You should see a JSON array of your threads! 🎉

⚠️ **Common mistakes:**

- Forgetting to make the route handler `async`
- Forgetting `await` before the sql query
- Using wrong SQL syntax (check your FROM and ORDER BY clauses)
- Not installing the cors package

---

<a name="step-4"></a>

## Step 4: Update frontend to fetch threads from local API

### 🤔 Problem to solve

Your backend API is working, but your frontend is still calling Supabase directly. Time to switch over! You need to:

1. Configure the frontend to know about your local API
2. Update the fetch call to use your new endpoint
3. Simplify the code (no more auth headers!)

### 💡 Key concepts

- **Environment variables in Vite**: Use `VITE_` prefix for variables accessible in the browser
- **API endpoint switching**: Easy to switch between development and production APIs
- **Simplified authentication**: Your API doesn't require auth headers (yet!)

### 📝 Your task

1. **Update frontend environment configuration**:

   - Open `frontend/.env.example`
   - Add a new variable `VITE_API_URL` with value `http://localhost:3000`
   - Don't forget to add this to your actual `.env` file too!

2. **Update the layout.jsx clientLoader**:
   - Change the loader to fetch from your local API instead of Supabase
   - Update the URL to use `VITE_API_URL` environment variable
   - Remove Supabase-specific code:
     - Remove `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the loader
     - Remove the headers object (no auth needed!)
     - Remove query parameters (sorting is now handled server-side)
   - Update comments to reflect the new API

### 🔍 Implementation hints

<details>
<summary>💡 How do I access environment variables in Vite?</summary>

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

All environment variables in Vite must start with `VITE_` to be accessible in the browser.

</details>

<details>
<summary>💡 What should the new fetch call look like?</summary>

It's much simpler now:

```javascript
const url = `${apiUrl}/api/threads`;
const response = await fetch(url);
const threads = await response.json();
```

No headers, no query parameters—your API handles everything!

</details>

<details>
<summary>💡 Do I need to change anything else in layout.jsx?</summary>

No! The rest of the component stays the same. The threads data structure is identical, so your JSX doesn't need to change.

</details>

### ✅ Reference implementation

**🔗 Commit**: [`d251f95`](8/commits/d251f95fe7607a1b7adbfe8ad9c6b650af3f34ec)

### 💬 Discussion points

1. **Why is the code simpler now?** What responsibilities moved from frontend to backend?

2. **What are the advantages of controlling your own API?** What new possibilities does this open up?

3. **Why use environment variables for the API URL?** How would this help when deploying to production?

### 🧪 Test your solution

```bash
# Make sure backend is running
cd backend
npm run dev

# In another terminal, start frontend
cd frontend
npm run dev

# Open browser to http://localhost:5173
# You should see your threads loaded from your custom API!
```

**🔍 How to verify it's working:**

1. Open browser DevTools (F12) → Network tab
2. Refresh the page
3. Look for a request to `localhost:3000/api/threads`
4. Click it and verify the response contains your threads

⚠️ **Common mistakes:**

- Forgetting to add `VITE_API_URL` to your `.env` file (not just `.env.example`)
- Forgetting to restart the Vite dev server after changing `.env`
- Backend not running on port 3000
- CORS not enabled in backend

---

<a name="step-5"></a>

## Step 5: Add backend README with setup and testing instructions

### 🤔 Problem to solve

You've built a working API, but what happens when someone else (or future you) needs to set it up? Good documentation is crucial for maintainability.

### 💡 Key concepts

- **README.md**: Standard documentation file for projects
- **Setup instructions**: Help others get started quickly
- **API documentation**: Describe available endpoints and responses
- **Testing instructions**: Show how to verify the API works

### 📝 Your task

Create a `backend/README.md` file that includes:

1. **Project description**: Brief overview of what this API does

2. **Setup section**:

   - How to install dependencies
   - How to configure environment variables (with detailed steps to find DATABASE_URL in Supabase)
   - How to start the server (both dev and production modes)

3. **API endpoints documentation**:

   - List each endpoint with:
     - HTTP method and path
     - Description
     - Example response (actual JSON)

4. **Testing section**:

   - Show how to test with curl
   - Show how to test in browser
   - List expected results

5. **Project structure**:

   - Describe what each file does

6. **Learning resources**:
   - Link to relevant documentation (Express, Postgres, PostgreSQL)

### 🔍 Implementation hints

<details>
<summary>💡 What makes good API documentation?</summary>

- Clear, concise descriptions
- Actual example responses (not placeholders)
- Step-by-step instructions
- Troubleshooting tips
- Links to additional resources
</details>

<details>
<summary>💡 How do I format code blocks in Markdown?</summary>

Use triple backticks with language specification:

````markdown
```bash
npm install
```

```json
{ "key": "value" }
```
````

</details>

### ✅ Reference implementation

**🔗 Commit**: [`8f618ab`](8/commits/8f618ab598068210111782b3b3c59617cfe9110d)

### 💬 Discussion points

1. **Why is documentation important?** What happens to projects without good docs?

2. **What makes documentation "good" vs "bad"?** Think about docs you've read before.

3. **Why include example responses?** Why not just describe them in words?

### 🧪 Test your solution

Share your README with a friend or teammate. Can they:

- Set up the project from scratch using only your instructions?
- Understand what each endpoint does?
- Successfully test the API?

If yes, you've written great documentation! 📚

---

## 🎉 Congratulations!

You've just built your own REST API from scratch! You have now:

☑️ Created an Express.js server  
☑️ Connected to a PostgreSQL database  
☑️ Written your first SQL query  
☑️ Implemented a REST API endpoint  
☑️ Understood CORS and cross-origin requests (right..?)  
☑️ Switched (a small part of) your frontend from Supabase to your custom API  
☑️ Documented your API for others to use

**Most importantly**: You now understand what services like Supabase are doing behind the scenes. They're providing REST APIs just like the one you built—but with authentication, real-time features, and hosting included.

### 🤔 Reflection questions

1. **What was the most challenging part of this tutorial?** Why?

2. **How does building your own API change your understanding of how web applications work?**

3. **When would you use Supabase vs. building your own API?** What are the tradeoffs?

4. **What could go wrong with this API in production?** (Think about security, performance, error handling)

## 🚀 Next steps

In the next tutorials, we'll add more endpoints:

- GET /api/threads/:id - Fetch a single thread
- GET /api/threads/:id/messages - Fetch messages for a thread
- POST /api/threads/:id/messages - Add a message to a thread
- DELETE /api/threads/:id - Delete a thread

Each of these will teach you new SQL concepts and API patterns 🤘

## 📚 Additional resources

- [Express.js Documentation](https://expressjs.com/) - Official Express guide
- [Postgres.js Documentation](https://github.com/porsager/postgres) - Learn about the postgres library
- [PostgreSQL Tutorial](https://neon.com/postgresql/tutorial) - A very good PostgreSQL tutorial from Neon, another Postgres hosting provider
