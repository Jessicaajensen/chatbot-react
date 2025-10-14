# Reading individual threads and messages - Step-by-step tutorial

## 📋 Table of contents

1. [Step 1: Implement GET /api/threads/:id endpoint](#step-1)
2. [Step 2: Implement GET /api/threads/:id/messages endpoint](#step-2)
3. [Step 3: Update frontend to fetch thread and messages from local API](#step-3)
4. [Step 4: Update backend README with new endpoints](#step-4)

## 🗺️ Overview

In the previous tutorial, you created an API endpoint to fetch all threads. But what about viewing a single conversation with all its messages? That's what you'll build in this tutorial.

You'll learn how to:

- Use **route parameters** to capture IDs from URLs
- Write **SQL WHERE clauses** to filter data
- Handle **404 Not Found** errors properly
- Create **nested RESTful resources** (messages within threads)
- Understand **foreign key relationships** in SQL
- Make your frontend code simpler by controlling both ends

By the end, clicking on a thread in your sidebar will load that specific conversation from your custom API!

## 🧑‍💻 Today's starting point

If you haven't fully completed the prior tutorials, you may copy the starting point of this tutorial by running this command in the root of your local repository:

```bash
npx degit --force bewildergeist/chatbot-react-postgres#pr-9-start
```

**Important**: Make a commit of this initial version before you start changing anything.

---

<a name="step-1"></a>

## Step 1: Implement GET /api/threads/:id endpoint

### 🤔 Problem to solve

Your `GET /api/threads` endpoint returns ALL threads, but when a user clicks on a specific thread, you need to fetch just that one thread's details. You need a way to:

1. Accept a thread ID as part of the URL
2. Find only the thread with that specific ID
3. Return a 404 error if the thread doesn't exist

This is your first endpoint with **dynamic URL parameters**!

### 💡 Key concepts

- **Route parameters**: The `:id` syntax in Express captures dynamic URL segments
  - `/api/threads/123` → `req.params.id` will be `"123"`
- **SQL WHERE clause**: Filters rows that match a condition
  - `WHERE id = ${value}` → only returns rows where id equals value
- **404 Not Found**: Standard HTTP status for "resource doesn't exist"
- **Parameterized queries**: The ` sql``  ` template prevents SQL injection
- **Empty result handling**: You'll get an empty array `[]` when nothing matches

### 📝 Your task

Add a new endpoint to `backend/server.js`:

1. **Create the route** with Express:

   - Use `app.get()` with the path `/api/threads/:id`
   - Make the handler function `async`
   - Create a `threadId` variable by reading from `req.params.id`

2. **Write the SQL query**:

   - SELECT the same columns as before: `id`, `title`, `created_at`
   - Add a WHERE clause to filter by ID
   - Use the `sql` tagged template with `${threadId}` for the value

3. **Handle the results**:

   - Check if the results array is empty
   - If empty: return 404 status with an error message
   - If found: return the first element `threads[0]` (so that you return a single object, not an array containing a single object)

4. **Add error handling**:
   - Wrap in try/catch
   - Log errors to console
   - Return 500 status for database errors

### 🔍 Implementation hints

<details>
<summary>💡 How do route parameters work?</summary>

In Express, `:paramName` in a route creates a parameter:

```javascript
app.get("/api/threads/:id", async (req, res) => {
  const threadId = req.params.id; // Extract the ID from URL
  // ...
});
```

The `:id` is a placeholder that matches any value at that position in the URL.

</details>

<details>
<summary>💡 What does a WHERE clause look like?</summary>

```sql
SELECT columns FROM table WHERE condition
```

For example:

```sql
SELECT id, title, created_at FROM threads WHERE id = 'some-uuid'
```

With the postgres library:

```javascript
const results = await sql`
  SELECT id, title, created_at 
  FROM threads 
  WHERE id = ${threadId}
`;
```

</details>

<details>
<summary>💡 How do I check if nothing was found?</summary>

SQL returns an empty array when no rows match:

```javascript
if (threads.length === 0) {
  return res.status(404).json({ error: "Thread not found" });
}
```

Remember the `return` to stop execution!

</details>

<details>
<summary>💡 Should I return an array or object?</summary>

Since there's only ever one thread with a given ID, return the object directly:

```javascript
res.json(threads[0]); // Object, not array
```

This is simpler for the frontend to work with.

</details>

### 🤔 Before looking at the code

Think about these questions:

1. **What's the difference between `/api/threads` and `/api/threads/:id`?**
2. **Why does SQL return an array even for a single result?**
3. **What happens if someone visits `/api/threads/invalid-id`?**

### ✅ Reference implementation

**🔗 Commit**: [`b1e1dbb`](9/commits/b1e1dbb40404dc50817a9038c751016c42ad9335)

After implementing it yourself, compare with the reference to see one approach.

### 💬 Discussion points

1. **SQL injection**: Why is `` sql`WHERE id = ${threadId}` `` safe, but `"WHERE id = '" + threadId + "'"` dangerous? What [malicious SQL](https://xkcd.com/327/) could someone inject in the unsafe version? (Refer to [this section in the docs](https://github.com/porsager/postgres?tab=readme-ov-file#query-parameters) for details on why you shouldn't include quotes in your template literals either).

2. **API design**: Why return a single object instead of an array with one item? How does this affect the frontend code? What would you expect to get back from an endpoint like `/api/users/:id`?

3. **404 vs 500**: When should you return 404 vs 500? What's the difference from a user's perspective?

### 🧪 Test your solution

```bash
# Start your backend
cd backend
npm run dev

# In another terminal (or in Thunder Client or Postman), test the endpoint
# First, get a list of threads to find a valid UUID
curl http://localhost:3000/api/threads

# Copy one of the UUIDs and test with it (replace YOUR-UUID-HERE)
curl http://localhost:3000/api/threads/YOUR-UUID-HERE

# Test with a non-existent ID (should get 404)
curl http://localhost:3000/api/threads/00000000-0000-0000-0000-000000000000
```

**Expected results:**

- Valid UUID: Returns a single thread object
- Invalid UUID: Returns `{"error": "Thread not found"}` with 404 status

⚠️ **Common mistakes:**

- Forgetting to make the route handler `async`
- Forgetting `await` before the SQL query
- Returning the array instead of `threads[0]`
- Not checking for empty results before accessing `threads[0]`
- Wrong route path (missing `/api` prefix)

---

<a name="step-2"></a>

## Step 2: Implement GET /api/threads/:id/messages endpoint

### 🤔 Problem to solve

You can now fetch a single thread, but threads are useless without their messages! You need an endpoint that:

1. Fetches all messages that belong to a specific thread
2. Returns them in chronological order (oldest first)
3. Works even if the thread has no messages yet (returns empty array)

This is your first **nested resource** endpoint!

### 💡 Key concepts

- **Nested resources**: REST pattern for resources that belong to other resources
  - Format: `/parent/:parentId/child`
  - Example: `/api/threads/:id/messages`
- **Foreign keys**: The `thread_id` column in messages links to `threads.id`
- **ORDER BY ASC**: Ascending order (oldest → newest)
  - Opposite of DESC (newest → oldest)
- **Empty results**: For nested resources, empty array is valid (not 404)
  - A thread with zero messages is perfectly fine!

### 📝 Your task

Add another endpoint to `backend/server.js`:

1. **Create the nested route**:

   - Path: `/api/threads/:id/messages`
   - Extract the thread ID from `req.params.id`

2. **Write the SQL query**:

   - SELECT all message columns: `id`, `thread_id`, `type`, `content`, `created_at`
   - FROM the `messages` table
   - WHERE `thread_id` matches the URL parameter
   - ORDER BY `created_at ASC` (chronological order)

3. **Return the results**:

   - Return the messages array directly
   - Don't check for empty - empty array is valid
   - No need to return `messages[0]` - clients expect an array here

4. **Add error handling**:
   - Try/catch for database errors
   - 500 status for failures

### 🔍 Implementation hints

<details>
<summary>💡 What's the nested resource pattern?</summary>

RESTful APIs use URL structure to show relationships:

```
/api/threads              → All threads
/api/threads/:id          → One thread
/api/threads/:id/messages → Messages belonging to that thread
```

The parent ID (`:id`) determines which messages you get.

</details>

<details>
<summary>💡 How do I filter by foreign key?</summary>

The `messages` table has a `thread_id` column that references `threads.id`:

```javascript
const messages = await sql`
  SELECT id, thread_id, type, content, created_at 
  FROM messages 
  WHERE thread_id = ${threadId}
  ORDER BY created_at ASC
`;
```

This finds all messages where `thread_id` matches your parameter.

</details>

<details>
<summary>💡 Why ASC instead of DESC?</summary>

Think about how chat apps display messages:

- **ASC (ascending)**: Oldest at top, newest at bottom - natural reading order
- **DESC (descending)**: Newest at top - like a Twitter feed

For chat messages, you want chronological order, so ASC. For the threads in the sidebar, however, we implemented DESC to show the most recent threads first.

</details>

<details>
<summary>💡 Why not return 404 for empty results?</summary>

An empty thread (no messages yet) is different from a non-existent thread:

- **Empty array**: "Thread exists, but no messages" → Valid state
- **404**: "Thread doesn't exist at all" → Error state

You check if the _thread_ exists in step 1. Here you just get its messages.

</details>

### 🤔 Before looking at the code

1. **Why is this route `/api/threads/:id/messages` instead of `/api/messages?threadId=...`?** What makes it more RESTful?

2. **What would happen if you forgot ORDER BY?** Would the messages still work?

3. **Should this endpoint verify the thread exists first?** Why or why not?

### ✅ Reference implementation

**🔗 Commit**: [`416738a`](9/commits/416738a38340eb8046335a664d257c2446c81ce1)

### 💬 Discussion points

1. **Nested routes vs query parameters**: Compare `/threads/:id/messages` with `/messages?thread_id=:id`. What are the pros and cons of each approach?

2. **Foreign key relationships**: How does the database ensure `thread_id` always points to a valid thread? What happens when you delete a thread? (Hint: Check your schema for `ON DELETE CASCADE`)

3. **ASC vs DESC**: When would you use DESC ordering? Can you think of examples from apps you use?

### 🧪 Test your solution

```bash
# Get a thread ID first
curl http://localhost:3000/api/threads

# Get messages for that thread (replace YOUR-UUID-HERE)
curl http://localhost:3000/api/threads/YOUR-UUID-HERE/messages

# Test with a thread that has no messages
# (create a new thread in your app without adding messages)
curl http://localhost:3000/api/threads/NEW-THREAD-UUID/messages
```

**Expected results:**

- Thread with messages: Returns array of message objects, oldest first
- Thread with no messages: Returns empty array `[]`
- Non-existent thread: Returns empty array (we don't validate thread exists)

💡 **Think about**: Should we validate that the thread exists before fetching messages? What are the tradeoffs?

---

<a name="step-3"></a>

## Step 3: Update frontend to fetch thread and messages from local API

### 🤔 Problem to solve

Your backend now has two new endpoints, but your frontend is still calling Supabase. Time to switch over! You need to:

1. Update the `clientLoader` in `chat-thread.jsx`
2. Call your local API instead of Supabase
3. Simplify the code (no more auth headers!)
4. Handle 404 errors properly

This is where you see the benefits of controlling your own API.

### 💡 Key concepts

- **Environment variables**: Use `VITE_API_URL` for the API base URL
- **Sequential API calls**: First get thread, then get messages
- **Simplified fetch**: No headers needed for your local API (yet)
- **Status code handling**: Check `response.status` for 404
- **Response format differences**:
  - Supabase: returns array even for single items
  - Your API: returns object for single item, array for collections

### 📝 Your task

Update the `clientLoader` function in `frontend/app/routes/chat-thread.jsx`:

1. **Change the API URL source**:

   - Replace `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with `VITE_API_URL`
   - Use `import.meta.env.VITE_API_URL`

2. **Update the thread fetch**:

   - URL: `${apiUrl}/api/threads/${params.threadId}`
   - Remove the `headers` object (no auth needed)
   - Check if `response.status === 404` specifically
   - If 404, throw `new Response("Thread not found", { status: 404 })`
   - Parse response: `await response.json()` (already an object, not array!)

3. **Update the messages fetch**:

   - URL: `${apiUrl}/api/threads/${params.threadId}/messages`
   - No headers needed
   - Parse response: `await response.json()` (already an array)

4. **Remove unnecessary code**:
   - Delete Supabase environment variable references
   - Delete the `threadData[0]` array access (API returns object directly)
   - Simplify comments to reflect your custom API

### 🔍 Implementation hints

<details>
<summary>💡 How do I structure the new fetch calls?</summary>

Your API is simpler than Supabase:

```javascript
const apiUrl = import.meta.env.VITE_API_URL;

// Fetch thread
const threadResponse = await fetch(`${apiUrl}/api/threads/${params.threadId}`);
if (threadResponse.status === 404) {
  throw new Response("Thread not found", { status: 404 });
}
const thread = await threadResponse.json(); // Direct object!

// Fetch messages
const messagesResponse = await fetch(
  `${apiUrl}/api/threads/${params.threadId}/messages`
);
const messages = await messagesResponse.json(); // Array
```

</details>

<details>
<summary>💡 Why check status === 404 separately?</summary>

You want to distinguish between:

- **404**: Thread doesn't exist (specific error message for user)
- **500**: Server error (generic error message)
- **Other**: Network issues, etc.

Checking 404 first lets you throw a specific error that your ErrorBoundary can handle nicely.

</details>

<details>
<summary>💡 Do I still need the ErrorBoundary component?</summary>

Yes! Don't change the `ErrorBoundary` component. It's still needed and will work perfectly with your new API. When you throw `new Response("Thread not found", { status: 404 })`, the ErrorBoundary catches it and shows the nice error message.

</details>

### 🤔 Before looking at the code

1. **How many lines of code are you removing vs adding?** Why is your custom API simpler to use than Supabase?

2. **What would happen if you forgot to update .env with VITE_API_URL?** What error would you see?

3. **Why does your API return an object for single threads but Supabase returns an array?** Which design is better?

### ✅ Reference implementation

**🔗 Commit**: [`7b98d84`](9/commits/7b98d84639b4e64337049f534cc2d14746ce3629)

### 💬 Discussion points

1. **API design impact**: The commit shows you're **removing** more lines than adding. Why? What does this tell you about good API design?

2. **Authentication**: Right now your API doesn't require authentication. Is this a problem? When would you add it?

3. **Error handling**: Compare the error handling between Supabase and your API. Which is better? What could go wrong with each approach?

4. **Single source of truth**: You now control both frontend and backend. What new possibilities does this open up? What new responsibilities do you have?

### 🧪 Test your solution

```bash
# Make sure both servers are running:

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Open browser to http://localhost:5173
# Click on different threads in the sidebar
# Watch the Network tab in DevTools:
# - Should see requests to localhost:3000/api/threads/:id
# - Should see requests to localhost:3000/api/threads/:id/messages
# - Both should return 200 status

# Test 404 handling:
# - Delete a thread (if you implemented delete in previous PRs)
# - Or manually visit http://localhost:5173/chat/00000000-0000-0000-0000-000000000000
# - Should see "Thread Not Found" error page
```

⚠️ **Common mistakes:**

- Forgetting to add `VITE_API_URL=http://localhost:3000` to `frontend/.env`
- Forgetting to restart the Vite dev server after changing `.env`
- Still trying to access `thread[0]` instead of using `thread` directly
- Not checking for 404 status before checking `response.ok`
- Backend not running on port 3000

---

<a name="step-4"></a>

## Step 4: Update backend README with new endpoints

### 🤔 Problem to solve

You've added two new endpoints, but if someone else (or future you) looks at your API documentation, they won't know these endpoints exist! Good documentation is crucial for APIs.

You need to document:

- What each endpoint does
- What URL parameters it expects
- What it returns (with examples)
- How to test it

### 💡 Key concepts

- **API documentation**: Clear description of every endpoint
- **URL parameters**: Document what `:id` represents
- **Example responses**: Show actual JSON, not just descriptions
- **Success and error cases**: Document both happy path and errors
- **Testing examples**: Help developers verify endpoints work

### 📝 Your task

Update `backend/README.md` to add documentation for your two new endpoints:

1. **Document GET /api/threads/:id**:

   - Describe what it does
   - Document the `:id` URL parameter
   - Show example success response (200)
   - Show example error response (404)

2. **Document GET /api/threads/:id/messages**:

   - Describe what it does
   - Document the `:id` URL parameter
   - Show example response with messages
   - Note that it returns empty array when no messages

3. **Update testing section**:
   - Add curl examples for both endpoints
   - Add browser testing instructions
   - Remind users to replace `{id}` with actual UUIDs

### 🔍 Implementation hints

<details>
<summary>💡 What format should API documentation use?</summary>

For each endpoint, include:

````markdown
### GET /api/endpoint/:param

Description of what it does

**URL Parameters:**

- `param` - What this parameter represents

**Response (200 OK):**

```json
{
  "example": "response"
}
```

**Response (404 Not Found):** (if applicable)

```json
{
  "error": "Error message"
}
```
````

</details>

<details>
<summary>💡 Should I use real or fake data in examples?</summary>

Use realistic fake data:

- ✅ UUIDs that look like UUIDs
- ✅ Realistic content and titles
- ✅ Proper timestamp format
- ❌ Don't use placeholders like "string" or "value"
</details>

<details>
<summary>💡 What should I include in testing examples?</summary>

Help developers test successfully:

```bash
# Explain what they need to do first
curl http://localhost:3000/api/threads

# Show how to use the result
# Copy one of the UUIDs and test with it
curl http://localhost:3000/api/threads/ACTUAL-UUID-HERE
```

Don't assume they'll figure it out!

</details>

### 🤔 Before looking at the code

1. **Who is API documentation for?** Just you, or others too?

2. **What makes documentation "good" vs "bad"?** Think of APIs you've used.

3. **Why include example responses?** Why not just describe them in words?

### ✅ Reference implementation

**🔗 Commit**: [`2f93bad`](9/commits/2f93badf3ef8576410e8c699ff5c0250e82985e1)

### 💬 Discussion points

1. **Documentation as a teaching tool**: How does writing documentation help you understand your own API better?

2. **Documentation maintenance**: How do you keep docs in sync with code? What happens when you change an endpoint but forget to update the docs?

3. **Alternative documentation tools**: Have you heard of Swagger/OpenAPI? What advantages might those provide over a simple README?

### 🧪 Test your solution

The best test for documentation is to hand it to someone else:

1. **Self-test**: Close your code and try to use your API following only the README
2. **Peer review**: Ask a classmate to test your API using only your documentation
3. **Questions to ask**:
   - Can they set up the project?
   - Can they test each endpoint successfully?
   - Do they understand what each endpoint does?
   - Are the examples helpful?

If they get stuck, your documentation needs improvement!

---

## 🎉 Congratulations!

You've significantly expanded your API! Here's what you built:

- Route parameters for dynamic URLs
- SQL WHERE clauses for filtering data
- Proper 404 error handling
- Nested RESTful resource endpoints
- Foreign key relationships in SQL
- Chronological data ordering
- Simplified frontend API calls
- Comprehensive API documentation

**Most importantly**: You can now view individual chat threads with all their messages through your own API!

### 🤔 Reflection questions

1. **Complexity growth**: You added two endpoints. How much more complex is your API now? Is it manageable?

2. **API design patterns**: Both endpoints use `:id` parameters. Do you see a pattern in how REST APIs are structured?

3. **Frontend/backend coordination**: Who decides the API response format—frontend or backend? What happens when they disagree?

4. **Next capabilities**: What other operations might you want? (Hint: Creating and deleting things!)

## 🚀 Next steps

In the next tutorial (PR 10), you'll add your first **write operation**:

- POST /api/threads/:id/messages - Add a message to a thread
- Learn about request bodies and `express.json()` middleware
- Understand SQL INSERT statements
- Handle data validation
- Use 201 Created status code

You'll also learn more about SQL injection, since you'll be accepting user input!

## 📚 Additional resources

- [Express Route Parameters](https://expressjs.com/en/guide/routing.html#route-parameters) - Official docs on `:param` syntax
- [SQL WHERE Clause](https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-WHERE) - PostgreSQL WHERE documentation
- [SQL ORDER BY](https://www.postgresql.org/docs/current/queries-order.html) - Understanding ASC and DESC
- [Foreign Keys in PostgreSQL](https://www.postgresql.org/docs/current/tutorial-fk.html) - How foreign keys work
