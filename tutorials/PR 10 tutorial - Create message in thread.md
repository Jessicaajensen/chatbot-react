# Creating messages - Your first write operation - Step-by-step tutorial

## 📋 Table of contents

1. [Step 1: Add express.json() middleware for parsing request bodies](#step-1)
2. [Step 2: Implement POST /api/threads/:id/messages endpoint](#step-2)
3. [Step 3: Update frontend to create messages via local API](#step-3)
4. [Step 4: Add POST endpoint documentation](#step-4)

## 🗺️ Overview

So far, you've built endpoints that **read** data (GET requests). Now it's time to **create** data 🤘 In this tutorial, you'll implement your first POST endpoint to add messages to threads.

This is a significant milestone because write operations are more complex than read operations:

- You need to parse request bodies (JSON data sent from the client)
- You must validate user input (never trust what clients send!)
- You use INSERT instead of SELECT in SQL
- You return different status codes (201 for created resources)
- Security becomes even more important

By the end, users will be able to type messages in your chat interface and save them to the database through your custom API.

**Key difference**: GET requests fetch existing data. POST requests create new data.

## 🧑‍💻 Today's starting point

If you haven't fully completed the prior tutorials, you may copy the starting point of this tutorial by running this command in the root of your local repository:

```bash
npx degit --force bewildergeist/chatbot-react-postgres#pr-10-start
```

**Important**: Make a commit of this initial version before you start changing anything.

---

<a name="step-1"></a>

## Step 1: Add express.json() middleware for parsing request bodies

### 🤔 Problem to solve

When a client sends a POST request with JSON data (like a new message), the data arrives as a stream of bytes in the request body. Express doesn't automatically parse this into JavaScript objects—you need _middleware_ to do that.

Without this middleware, `req.body` would be `undefined`, and you couldn't access the data the client sent!

### 💡 Key concepts

- **Middleware**: Functions that process requests before they reach your route handlers
- **Request body**: Data sent by the client in POST/PUT/PATCH requests
- **express.json()**: Built-in Express middleware that parses JSON
- **Middleware order**: The order you add middleware matters!
- **GET vs POST**: GET requests have no body; POST requests do

### 📝 Your task

Add the `express.json()` middleware to your Express app in `backend/server.js`:

1. **Find the middleware section** in server.js (after CORS, before routes)

2. **Add express.json() middleware**:
   - Call `app.use(express.json())`
   - Place it after CORS but before your route definitions
   - Add comments explaining what it does and why it's needed now

### 🔍 Implementation hints

<details>
<summary>💡 Where exactly should I add this?</summary>

In the middleware section, after CORS:

```javascript
app.use(cors()); // Existing CORS middleware

// Add your new middleware here
app.use(express.json());

// Routes come after middleware
app.get("/api/threads", ...);
```

Middleware runs in the order you add it!

</details>

<details>
<summary>💡 Why didn't we need this before?</summary>

GET requests don't have a request body—they only fetch data. Now that you're implementing POST (which sends data), you need to parse that incoming data.

Think of it like mail: GET is asking "what's in my mailbox?" POST is sending a letter—you need someone to open and read the letter (that's express.json()).

</details>

<details>
<summary>💡 What does express.json() actually do?</summary>

It:

1. Checks if the request has a JSON body (Content-Type: application/json)
2. Parses the JSON string into a JavaScript object
3. Attaches that object to `req.body`
4. Makes it available to your route handlers

Without it, you'd have to manually parse the JSON from the raw request stream.

</details>

### 🤔 Before looking at the code

1. **What would happen if you forgot to add this middleware?** How would your POST endpoint behave?

2. **Why does the order of middleware matter?** What if you put express.json() after your routes?

3. **Is this middleware needed for GET requests?** Why or why not?

### ✅ Reference implementation

**🔗 Commit**: [`6958c4d`](10/commits/6958c4d515c10b1868ad1f74bc3487b1322b91cb)

### 💬 Discussion points

1. **Middleware pipeline**: Express processes requests through a chain of middleware functions. Each one can modify the request, add data to it, or end the response. How is this different from just calling helper functions?

2. **Built-in vs custom middleware**: Express has built-in middleware like `express.json()`. You could also write your own. What kind of custom middleware might be useful? (Think: logging, authentication, request timing)

3. **Security consideration**: What if someone sends a massive JSON file? Should there be limits on body size? (Hint: express.json() has options for this!)

### 🧪 Test your solution

You can't fully test this until the next step (when you add the POST endpoint), but you can:

1. Add the middleware
2. Restart your server with `npm run dev`
3. Make sure there are no errors
4. Verify your existing GET endpoints still work

The middleware won't break anything—it just quietly parses JSON bodies when they arrive.

---

<a name="step-2"></a>

## Step 2: Implement POST /api/threads/:id/messages endpoint

### 🤔 Problem to solve

Users can view messages but can't create new ones! You need an endpoint that:

1. Accepts a POST request with message data (type and content)
2. Validates the data (is it complete? is it valid?)
3. Inserts the new message into the database
4. Returns the created message with a 201 status

This is significantly more complex than GET endpoints because you must validate user input and handle multiple error cases.

### 💡 Key concepts

**SQL Concepts**:

- **INSERT INTO**: SQL command to add new rows
- **VALUES**: Specifies what data to insert
- **RETURNING**: PostgreSQL feature that returns the inserted row (including auto-generated fields)

**API Concepts**:

- **POST method**: HTTP verb for creating resources
- **Request body validation**: Checking user input before using it
- **201 Created**: Success status for resource creation (not 200!)
- **400 Bad Request**: Client sent invalid data
- **Input sanitization**: Trimming whitespace, cleaning data

**Security**:

- **Never trust user input**: Always validate on the server
- **Parameterized queries**: The sql`` template prevents SQL injection
- **Helpful error messages**: Tell users what's wrong without exposing internals

### 📝 Your task

Create a new POST endpoint in `backend/server.js`:

1. **Define the route**:

   - Use `app.post("/api/threads/:id/messages", async (req, res) => {...})`
   - Extract `threadId` from `req.params.id`
   - Extract `type` and `content` from `req.body`

2. **Validate the input** (in this order):

   - Check if `type` and `content` are provided (required fields)
   - Check if `type` is either "user" or "bot" (validation rule)
   - Trim `content` and check it's not empty (sanitization + validation)
   - Return 400 status with error messages for any validation failure

3. **Insert the message**:

   - Use SQL INSERT statement
   - Insert into `messages` table with columns: `thread_id`, `type`, `content`
   - Use VALUES clause with your variables
   - Add `RETURNING *` to get back the inserted row

4. **Return the result**:

   - Send 201 status (Created, not 200!)
   - Return the first element from results array: `messages[0]`

5. **Handle errors**:
   - Wrap in try/catch
   - Log errors to console
   - Return 500 status for database errors

### 🔍 Implementation hints

<details>
<summary>💡 How do I validate required fields?</summary>

Check if they exist and return early if not:

```javascript
if (!type || !content) {
  return res.status(400).json({
    error: "Both 'type' and 'content' are required",
  });
}
```

The `return` is important—it stops execution so you don't continue with invalid data.

</details>

<details>
<summary>💡 How do I validate the type field?</summary>

```javascript
if (type !== "user" && type !== "bot") {
  return res.status(400).json({
    error: "Type must be either 'user' or 'bot'",
  });
}
```

This matches your database CHECK constraint.

</details>

<details>
<summary>💡 What does the INSERT statement look like?</summary>

```javascript
const messages = await sql`
  INSERT INTO messages (thread_id, type, content)
  VALUES (${threadId}, ${type}, ${trimmedContent})
  RETURNING *
`;
```

The RETURNING clause is PostgreSQL-specific magic that gives you back the inserted row!

</details>

<details>
<summary>💡 Why trim the content?</summary>

Users might accidentally add spaces:

```javascript
const trimmedContent = content.trim();
if (trimmedContent.length === 0) {
  return res.status(400).json({ error: "Content cannot be empty" });
}
```

This prevents saving messages that are just whitespace.

</details>

<details>
<summary>💡 Why return 201 instead of 200?</summary>

HTTP status codes have specific meanings:

- **200 OK**: Request succeeded (generic success)
- **201 Created**: Request succeeded AND a new resource was created

201 is more specific and follows REST conventions better.

</details>

### 🤔 Before looking at the code

1. **Why validate on the server** when you could validate on the client? Can't users just check the form before submitting?

2. **What's the order of validation?** Does it matter if you check for empty content before checking the type?

3. **What happens to `id` and `created_at`?** You're not inserting those—where do they come from?

### ✅ Reference implementation

**🔗 Commit**: [`1f01f45`](10/commits/1f01f453d8b60725ab97bb223a1b496df0da18bd)

### 💬 Discussion points

1. **Defense in depth**: Notice you validate in multiple layers (client-side for UX, server-side for security, database constraints as last resort). Why is this redundancy important? What if each layer fails?

2. **Error messages**: Compare these error messages:

   - ❌ "Invalid data"
   - ✅ "Type must be either 'user' or 'bot'"

   What makes a good error message? How detailed should you be?

3. **SQL injection**: Even though the sql`` template protects you, imagine if you used string concatenation:

   ```javascript
   // DANGEROUS - Don't do this!
   await sql`INSERT INTO messages VALUES ('${type}', '${content}')`;
   ```

   What malicious SQL could someone inject through the `content` field?

4. **RETURNING clause**: Why is this useful? What if PostgreSQL didn't have RETURNING—how else could you get the inserted row's ID?

### 🧪 Test your solution

```bash
# Make sure your backend is running
cd backend
npm run dev

# Via curl, Thunder Client, Postman, or similar:
# Test creating a valid message (replace UUID with real thread ID)
curl -X POST http://localhost:3000/api/threads/YOUR-THREAD-ID/messages \
  -H "Content-Type: application/json" \
  -d '{"type":"user","content":"Hello from curl!"}'

# Expected: 201 status with the created message including id and created_at

# Test validation - missing content
curl -X POST http://localhost:3000/api/threads/YOUR-THREAD-ID/messages \
  -H "Content-Type: application/json" \
  -d '{"type":"user"}'

# Expected: 400 status with error about required fields

# Test validation - invalid type
curl -X POST http://localhost:3000/api/threads/YOUR-THREAD-ID/messages \
  -H "Content-Type: application/json" \
  -d '{"type":"admin","content":"Should fail"}'

# Expected: 400 status with error about type validation

# Test validation - empty content
curl -X POST http://localhost:3000/api/threads/YOUR-THREAD-ID/messages \
  -H "Content-Type: application/json" \
  -d '{"type":"user","content":"   "}'

# Expected: 400 status with error about empty content
```

⚠️ **Common mistakes**:

- Forgetting `await` before the SQL query
- Not returning early after validation errors (continues to INSERT with invalid data)
- Returning 200 instead of 201
- Returning the whole array instead of `messages[0]`
- Not trimming the content before validation
- Forgetting the `return` keyword before `res.status(400)`

---

<a name="step-3"></a>

## Step 3: Update frontend to create messages via local API

### 🤔 Problem to solve

Your backend can now create messages, but your frontend is still POST'ing to Supabase. You need to:

1. Update the `clientAction` to call your local API
2. Send the right data format
3. Handle validation errors from your API

The good news: your API is simpler to use than Supabase's!

### 💡 Key concepts

- **clientAction**: React Router function that handles form submissions
- **POST with JSON**: Sending structured data to the server
- **Content-Type header**: Tells the server what format you're sending
- **Status code handling**: Different responses for different errors
- **Client-side validation**: Fast feedback before hitting the server
- **Server-side validation**: The real security check

### 📝 Your task

Update the `clientAction` function in `frontend/app/routes/chat-thread.jsx`:

1. **Change API URL**:

   - Replace Supabase URL/key with `VITE_API_URL`
   - Build URL: `${apiUrl}/api/threads/${params.threadId}/messages`

2. **Simplify the request body**:

   - Remove `thread_id` from the body (it's now in the URL!)
   - Keep only `type` and `content`

3. **Simplify headers**:

   - Remove authentication headers (apikey, Authorization)
   - Keep only `Content-Type: application/json`

4. **Handle validation errors**:

   - Check specifically for 400 status (validation error)
   - Parse the error message from response body
   - Still check for other errors (!response.ok)

5. **Keep client-side validation**:
   - Don't remove the empty content check
   - Client validation = better UX (instant feedback)
   - Server validation = security (never bypass this)

### 🔍 Implementation hints

<details>
<summary>💡 What should the fetch call look like?</summary>

```javascript
const response = await fetch(
  `${apiUrl}/api/threads/${params.threadId}/messages`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newMessage),
  }
);
```

Much simpler than Supabase—no authentication headers!

</details>

<details>
<summary>💡 How do I handle 400 errors specifically?</summary>

```javascript
if (response.status === 400) {
  const error = await response.json();
  return { error: error.error || "Invalid message data" };
}
```

This gives users the specific validation error from the server.

</details>

<details>
<summary>💡 Why keep client-side validation?</summary>

Two reasons:

1. **UX**: Instant feedback (no server round-trip)
2. **Server load**: Don't waste server resources on obviously invalid requests

But **never rely on it for security**—users can bypass client-side validation. (How? Think about how you might edit HTML or JS via DevTools or make requests using curl/Thunder Client/Postman directly to a production website).

</details>

<details>
<summary>💡 Why remove thread_id from the body?</summary>

It's redundant! You already have it in the URL:

```
POST /api/threads/abc-123/messages
Body: { "type": "user", "content": "Hi" }
```

The server gets `thread_id` from `req.params.id`. No need to send it twice.

</details>

### 🤔 Before looking at the code

1. **What's the advantage of URL parameters over body parameters?** Why put `thread_id` in the URL instead of the body?

2. **What happens if both client and server validation fail?** Which error message does the user see?

3. **Could a user bypass client-side validation?** How? Why doesn't this break security?

### ✅ Reference implementation

**🔗 Commit**: [`56d54b8`](10/commits/56d54b842e2d5c4dcdf74a613906fe1b6f8826e4)

### 💬 Discussion points

1. **Layered validation**: You now have validation in three places:

   - Client (JavaScript check)
   - Server (Node.js validation)
   - Database (CHECK constraints)

   Why three layers? Isn't that redundant?

2. **Error handling strategy**: Compare these approaches:

   ```javascript
   // Approach A: Check status codes explicitly
   if (response.status === 400) {
     /* handle validation */
   } else if (response.status === 500) {
     /* handle server error */
   }

   // Approach B: Just check response.ok
   if (!response.ok) {
     /* handle all errors the same */
   }
   ```

   What are the tradeoffs? When would you use each?

3. **API design simplicity**: Your API is simpler than Supabase's (no auth, thread_id in URL). But Supabase supports many apps—yours supports one. How does this relate to the tradeoff between general-purpose and specific-purpose tools?

### 🧪 Test your solution

```bash
# Make sure both servers are running:
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev

# Open browser to http://localhost:5173
# 1. Click on a thread
# 2. Type a message in the input
# 3. Press Enter or click Send
# 4. Message should appear immediately in the chat
# 5. Refresh page - message should still be there (saved to DB!)

# Test validation in the UI:
# 1. Try to send an empty message (just spaces)
# 2. Should see error: "Message cannot be empty"
# 3. This is client-side validation (instant)

# Check the Network tab in DevTools:
# 1. Open DevTools (F12) → Network tab
# 2. Send a message
# 3. Look for POST request to localhost:3000
# 4. Status should be 201 Created
# 5. Response should contain your message with id and timestamp
```

⚠️ **Common mistakes**:

- Forgetting to update `.env` with `VITE_API_URL=http://localhost:3000`
- Forgetting to restart Vite dev server after changing `.env`
- Still including `thread_id` in request body
- Wrong URL format (missing `/api` prefix or incorrect path)
- Backend not running on port 3000

---

<a name="step-4"></a>

## Step 4: Add POST endpoint documentation

### 🤔 Problem to solve

You've built a POST endpoint, but how will other developers (or future you) know:

- What data to send?
- What format to use?
- What responses to expect?
- How to test it?

Good API documentation is essential! Unlike GET endpoints (which you can test in a browser), POST endpoints need specific tools and knowledge.

### 💡 Key concepts

- **Request documentation**: What clients need to send
- **Response documentation**: What clients will receive
- **Status codes**: Document all possible responses (201, 400, 500)
- **Example data**: Realistic examples are better than placeholders
- **Testing tools**: POST requires curl, Postman, or similar

### 📝 Your task

Update `backend/README.md` to document your new endpoint:

1. **Add endpoint section** (before the Testing section):

   - HTTP method and path: `POST /api/threads/:id/messages`
   - Description of what it does
   - URL parameters (`:id`)

2. **Document the request**:

   - Show example request body with proper JSON formatting
   - List all required fields
   - Explain what each field does and its constraints

3. **Document success response**:

   - Show 201 Created status
   - Example response body (the created message)
   - Include all fields (id, thread_id, type, content, created_at)

4. **Document error responses**:

   - Show all 400 Bad Request cases
   - Example error for missing fields
   - Example error for invalid type
   - Example error for empty content

5. **Update testing section**:
   - Add curl examples for creating messages
   - Add curl examples for testing validation (intentionally invalid data)
   - Explain POST can't be tested in browser
   - Suggest alternative tools (Postman, Thunder Client)

### 🔍 Implementation hints

<details>
<summary>💡 How should I format the request body documentation?</summary>

````markdown
**Request Body:**

```json
{
  "type": "user",
  "content": "This is my message"
}
```

**Request Body Fields:**

- `type` (required) - Must be either `"user"` or `"bot"`
- `content` (required) - The message text (cannot be empty)
````

Clear, specific, with constraints!

</details>

<details>
<summary>💡 Should I show real UUIDs or placeholders?</summary>

Use realistic-looking UUIDs:

```json
{
  "id": "789e4567-e89b-12d3-a456-426614174000",
  "thread_id": "123e4567-e89b-12d3-a456-426614174000",
  ...
}
```

This shows the actual format. Placeholders like `"string"` are less helpful.

</details>

<details>
<summary>💡 What curl examples should I include?</summary>

At minimum:

1. **Successful creation**: Shows the happy path
2. **Validation error**: Shows what happens when data is invalid
3. **Different validation cases**: Missing field, invalid type, empty content

This teaches developers how your validation works.

</details>

<details>
<summary>💡 Why mention tools like Postman?</summary>

Many developers don't realize you can't test POST in a browser address bar. Mentioning tools:

- Helps beginners understand the limitation
- Provides alternatives (curl is intimidating for some)
- Shows professionalism (good docs consider the audience)
</details>

### 🤔 Before looking at the code

1. **Who is documentation for?** Just other developers on your team? Future maintainers? Users of your API?

2. **How much detail is too much?** Should you document implementation details, or just the interface?

3. **How do you keep docs in sync with code?** What happens if you change the validation but forget to update the docs?

### ✅ Reference implementation

**🔗 Commit**: [`5698ab0`](10/commits/5698ab0c438ef1a61de37d177a9620333681057c)

### 💬 Discussion points

1. **Documentation-driven development**: Some teams write the API documentation _before_ implementing the endpoint. What are the advantages? Could documentation serve as a specification?

2. **Auto-generated documentation**: Tools like Swagger/OpenAPI can generate docs from your code. What are the pros and cons compared to hand-written documentation like a README?

3. **Examples vs specification**: Your docs include examples. OpenAPI includes schemas (formal specifications). Which is more useful? For whom?

4. **Testing documentation**: How would you verify your documentation is correct? Could you automate this?

### 🧪 Test your solution

The best test for documentation is to follow it yourself:

1. **Read your documentation** as if you've never seen this API before

2. **Copy the curl examples exactly** and run them:

   ```bash
   # Does the example work?
   # Are the field names correct?
   # Are the UUIDs in the right format?
   ```

3. **Try to break it**:

   - What if you send extra fields?
   - What if you omit optional fields? (None, but worth thinking about)
   - What error messages do you actually get?

4. **Peer review**:
   - Ask a classmate to use your API based only on the docs
   - Where do they get confused?
   - What questions do they ask?
   - Update your docs based on their feedback!

**Good documentation answers questions before they're asked.**

---

## 🎉 Congratulations!

You've completed your first **write operation**! This is an important milestone. Here's what you've built:

☑️ JSON body parsing with express.json() middleware  
☑️ POST endpoint for creating resources  
☑️ SQL INSERT with RETURNING clause  
☑️ Comprehensive input validation  
☑️ Proper HTTP status codes (201, 400, 500)  
☑️ Frontend integration with POST requests  
☑️ Complete API documentation

**Most importantly**: You can now create new messages through your UI and save them to your database!

### 🤔 Reflection questions

1. **Read vs write complexity**: Compare your GET endpoints (PRs 8-9) with this POST endpoint. Why is writing data more complex than reading it?

2. **Validation philosophy**: You validate in multiple places. Some developers say "validate once, close to the data." Others say "validate at every boundary." What do you think? What are the tradeoffs?

3. **REST principles**: Your endpoint is `POST /threads/:id/messages` (nested resource). Why not `POST /messages` with thread_id in the body? How does URL structure communicate relationships?

4. **Error messages**: You return different 400 errors for different validation failures. Would it be simpler to return one generic "validation error"? Why or why not?

5. **Security mindset**: List three things that could go wrong if you removed validation. What's the worst-case scenario?

## 🚀 Next steps

In the next tutorial (PR 11), you'll implement **delete operations**:

- DELETE /api/threads/:id - Delete a thread
- Learn about CASCADE deletion (what happens to messages?)
- Handle 404 errors (deleting non-existent resources)
- Update frontend to delete threads
- Understand idempotency (what if you delete twice?)

You'll also see how database constraints (ON DELETE CASCADE) make your life easier!

## 📚 Additional resources

- [HTTP POST Method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST) - MDN documentation
- [SQL INSERT Statement](https://www.postgresql.org/docs/current/sql-insert.html) - PostgreSQL INSERT docs
- [RETURNING Clause](https://www.postgresql.org/docs/current/dml-returning.html) - PostgreSQL RETURNING explanation
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status) - Complete MDN reference
- [REST API Design Best Practices](https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/) - REST design patterns
- [Input Validation Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) - OWASP guide
- [SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) - OWASP security guide
- [curl Tutorial](https://curl.se/docs/manual.html) - Learn curl for API testing
- ...or check out [Postman](https://learning.postman.com/), [Thunder Client](https://www.thunderclient.com/) or [httpie](https://httpie.io/cli) for other alternative API testing tools
