# Create new thread via Express API - Step-by-step tutorial

## 📋 Table of contents

1. [Step 1: Implement POST /api/threads endpoint for creating new threads](#step-1)
2. [Step 2: Update frontend to create threads via local API](#step-2)
3. [Step 3: Document POST /api/threads endpoint](#step-3)

## 🗺️ Overview

In this tutorial, you'll implement the final piece of your CRUD migration from Supabase to your custom Express API: **creating new chat threads with their initial message**. This is a **compound operation** that creates two related database records in a single API request. You'll learn about sequential database operations, when to combine endpoints, and how to design APIs that match your application's business logic.

🎉 **Milestone**: After completing this tutorial, your frontend will be completely independent of Supabase's REST API!

---

<a name="step-1"></a>

## Step 1: Implement POST /api/threads endpoint for creating new threads

### 🤔 Problem to solve

Currently, when users start a new chat, the frontend (`chat-new.jsx`) makes two separate requests to Supabase:

1. First, create a new thread
2. Then, create the first message in that thread

You need to implement this functionality in your custom API. But here's a design question: Should you create two separate endpoints (POST /api/threads and POST /api/messages), or should you create one endpoint that does both operations?

**Key question**: What makes more sense from a business logic perspective - separating these operations or combining them?

### 💡 Key concepts

- **Compound operations**: API endpoints that create multiple related resources in one request
- **Sequential INSERT statements**: When one database insert depends on the result of another
- **RETURNING clause**: Getting the generated ID from the first insert to use in the second
- **Business logic in API design**: Endpoints should reflect how the application actually works
- **Transaction semantics**: Ensuring both operations succeed or neither does
- **201 Created status**: Appropriate response for successful resource creation

### 📝 Your task

Create a new endpoint in `backend/server.js` that handles POST requests to `/api/threads` and:

1. Accepts a request body with two required fields: `title` and `content`
2. Validates that both fields are present and not empty (after trimming whitespace)
3. Performs two sequential database operations:
   - First: Insert a new thread with the given title, using RETURNING to get its ID
   - Second: Insert a new message in that thread with type='user' and the given content
4. Returns 201 status with both the created thread and message data
5. Returns 400 for validation errors with helpful error messages

💭 **Think about this**: Why is it better to combine these operations into one endpoint rather than having the frontend make two separate requests?

### 🔍 Implementation hints

- Add this endpoint after the POST messages endpoint (logically grouping create operations)
- The request body structure should be: `{ title: "...", content: "..." }`
- Use the same validation pattern as other endpoints (check for presence, then trim and check for empty)
- For the first INSERT, use `RETURNING id, title, created_at` to get the generated thread data
- Store the thread ID from the first insert: `const thread = threads[0]`
- For the second INSERT, use the thread ID: `INSERT INTO messages (thread_id, type, content) VALUES (${thread.id}, 'user', ${trimmedContent})`
- Return an object with both pieces of data: `{ thread: {...}, message: {...} }`
- Remember to use 201 status for successful creation

### ⚠️ Common mistakes

- **Forgetting to trim inputs**: Always trim whitespace before validation
- **Not using RETURNING**: You need the thread ID from the first insert to create the message
- **Wrong status code**: Use 201 (Created) not 200 (OK) for resource creation
- **Incomplete response**: Return both the thread and message data so the frontend can navigate to the new thread

### ✅ Reference implementation

**🔗 Commit**: [`72614ce`](12/commits/72614ce)

### 💬 Discussion points

1. **Compound operations vs separate endpoints**: This implementation combines thread and message creation into one endpoint. What are the advantages? What would be the downsides of having two separate endpoints that the frontend calls sequentially?

2. **Transaction safety**: What happens if the thread creation succeeds but the message creation fails? In a production system, how would you ensure both operations succeed or both fail (atomicity)?

3. **Alternative designs**: Another approach would be to make the initial message optional (just create the thread, and the frontend adds the first message separately). What are the trade-offs of each approach?

4. **API design philosophy**: Should APIs reflect database structure (separate endpoints for separate tables) or business logic (one endpoint for one user action)? What factors should guide this decision?

### 🧪 Test your solution

Start your backend server and test with curl (or Thunder Client/Postman/httpie):

```bash
# Create a new thread with initial message
curl -X POST http://localhost:3000/api/threads \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Thread","content":"Hello, this is my first message!"}'

# Test validation - missing content
curl -X POST http://localhost:3000/api/threads \
  -H "Content-Type: application/json" \
  -d '{"title":"Thread without message"}'

# Test validation - empty title after trimming
curl -X POST http://localhost:3000/api/threads \
  -H "Content-Type: application/json" \
  -d '{"title":"   ","content":"Message with empty title"}'

# Verify the thread appears in the threads list
curl http://localhost:3000/api/threads

# Verify the message was created (use the thread ID from the response)
curl http://localhost:3000/api/threads/THREAD-ID-HERE/messages
```

---

<a name="step-2"></a>

## Step 2: Update frontend to create threads via local API

### 🤔 Problem to solve

The frontend's `chat-new.jsx` route still uses Supabase to create new threads. It makes two separate API calls:

1. POST to Supabase to create a thread
2. POST to Supabase to create the first message

You need to update this to use your new compound endpoint, which will actually simplify the frontend code 🤘

### 💡 Key concepts

- **Simplifying frontend logic**: Good API design can reduce frontend complexity
- **Single request vs multiple requests**: Better performance and simpler error handling
- **Environment variables**: Using VITE_API_URL instead of Supabase credentials
- **Error handling**: Properly handling validation errors (400) and other failures
- **Response destructuring**: Accessing nested data from the API response

### 📝 Your task

Update the `clientAction` function in `frontend/app/routes/chat-new.jsx` to:

1. Remove the Supabase URL and API key environment variables
2. Use `VITE_API_URL` instead
3. Replace the two Supabase POST requests with a single POST to your API
4. Send both `title` and `content` in the request body
5. Handle the response and redirect to the new thread
6. Keep the same validation and error handling structure

💭 **Before looking at the code**: How much simpler will this be compared to the current two-request approach?

### 🔍 Implementation hints

- The title generation logic stays the same (truncate to 50 characters)
- Your single fetch call should POST to `${apiUrl}/api/threads`
- Request body should be: `JSON.stringify({ title: title, content: content.trim() })`
- You only need one header: `"Content-Type": "application/json"` (no auth headers!)
- The response structure is: `{ thread: {...}, message: {...} }`
- Get the thread ID from the response: `data.thread.id`
- Redirect using: `` redirect(`/chat/${data.thread.id}`) ``

### 🔗 Compare before and after

**Before**: Two API calls, complex error handling, authentication headers  
**After**: One API call, simpler code, no authentication needed

### ✅ Reference implementation

**🔗 Commit**: [`c6e748b`](12/commits/c6e748b)

### 💬 Discussion points

1. **Code simplification**: Compare the old code (two requests) with the new code (one request). How many lines of code did you eliminate? What other benefits does this simplification provide?

2. **Error handling**: With two sequential requests, you had to handle partial failures (thread created but message failed). How does the compound endpoint improve this situation?

3. **Performance**: What's the performance impact of one HTTP request vs two? Consider network latency, connection overhead, and total time to complete the operation.

### 🧪 Test your solution

1. Start both your backend (`cd backend && npm run dev`) and frontend (`cd frontend && npm run dev`) in separate terminal windows
2. Open the application in your browser
3. Click the "+ New" button to start a new chat
4. Type a message and submit
5. Verify you're redirected to the new thread
6. Check that the thread appears in the sidebar
7. Verify the initial message is displayed
8. Open DevTools Network tab and submit another new chat - confirm only ONE request is made, and that it is made to your local API
9. Try submitting an empty message - verify validation error is shown

---

<a name="step-3"></a>

## Step 3: Document POST /api/threads endpoint

### 🤔 Problem to solve

Your new compound endpoint is more complex than the previous ones - it creates two database records and has multiple validation requirements. Good documentation is essential for other developers (and your future self) to understand how to use it correctly.

### 💡 Key concepts

- **Complete API documentation**: Request body, all response types, validation rules
- **Example-driven documentation**: Show actual request/response JSON
- **Testing documentation**: Curl commands that demonstrate the endpoint's behavior
- **Explaining compound operations**: Make it clear that this creates two database records

### 📝 Your task

Update `backend/README.md` to document the new endpoint:

1. Add a "POST /api/threads" section after the "GET /api/threads/:id/messages" section
2. Describe what the endpoint does (emphasize it creates BOTH thread and message)
3. Document the request body fields (title and content, both required)
4. Show the 201 Created response structure with both thread and message objects
5. Document all validation error cases (missing fields, empty values)
6. Add curl examples showing successful creation and validation failures
7. Add a note explaining that this is a compound operation

💭 **Think about this**: What information would be most helpful to someone using this endpoint for the first time?

### 🔍 Implementation hints

- Place the new section before "POST /api/threads/:id/messages" (creating thread before adding to thread)
- Follow the same format as existing endpoint documentation
- Show example UUIDs in responses (like "123e4567-e89b-12d3-a456-426614174000")
- For validation errors, show all three cases: missing title/content, empty title, empty content
- In the Testing section, add curl examples after the "Get messages" example
- Include at least two curl examples: one successful creation, one validation failure

### ✅ Reference implementation

**🔗 Commit**: [`b090d77`](12/commits/b090d77)

### 💬 Discussion points

1. **Documentation as specification**: Your documentation describes the "contract" between frontend and backend. What happens if your implementation doesn't match your documentation? Which should be considered the source of truth?

2. **Testing documentation**: The curl examples serve double duty - they document the API AND provide test commands. How does this help maintain API quality over time?

### 🧪 Test your solution

1. Read through your documentation as if you were a new developer on the project
2. Try following the curl examples exactly as written
3. Verify each example produces the response shown in the documentation
4. Check that all validation cases are covered

---

## 🎉 Congratulations!

You've successfully completed the migration from Supabase REST API to your custom Express API. This is a major milestone. Let's review what you've accomplished:

**Complete (almost) CRUD Implementation**:

- ✅ **C**reate - Threads (POST /api/threads) and Messages (POST /api/threads/:id/messages)
- ✅ **R**ead - All threads (GET /api/threads), Single thread (GET /api/threads/:id), Messages (GET /api/threads/:id/messages)
- ☑️ **U**pdate - (Not implemented in this project, but you probably have a good idea how you'd do it)
- ✅ **D**elete - Threads (DELETE /api/threads/:id)

**Complete Frontend Migration**:

- ✅ `layout.jsx` - Uses local API for threads list and deletion
- ✅ `chat-thread.jsx` - Uses local API for thread/messages and creating messages
- ✅ `chat-new.jsx` - Uses local API for creating new threads
- ✅ **Zero Supabase REST API dependencies remaining!**

**Key Learnings**:

- How to design compound operations that match business logic
- Sequential database operations using RETURNING
- How good API design simplifies frontend code
- The importance of comprehensive API documentation
- When to combine operations vs keeping them separate

## 🚀 Extra features if you have time

1. **Better error handling**: What if the message creation fails after the thread is created? Add error handling that deletes the orphaned thread. Or better yet, research database transactions and wrap both operations in a transaction.

2. **Validation improvements**: Add maximum length validation for title and content. Add a `maxLength` parameter to provide better user feedback.

3. **Response optimization**: The endpoint returns the full message object, but the frontend only needs the thread ID for redirect. Consider what data is actually needed and optimize the response size.

4. **Soft delete recovery**: If you implemented soft delete for threads (PR 11 extra feature), add the ability to "undelete" threads and restore them with their messages.

## 📚 Additional resources

- [REST API Design Best Practices](https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/)
- [PostgreSQL Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [Database Transaction ACID Properties](https://www.ibm.com/docs/en/cics-ts/5.4?topic=processing-acid-properties-transactions)
- [HTTP Status Codes for REST APIs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)
