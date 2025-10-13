# Delete thread via Express API - Step-by-step tutorial

## 📋 Table of contents

1. [Step 1: Implement DELETE /api/threads/:id endpoint](#step-1)
2. [Step 2: Update frontend thread deletion to use local API](#step-2)
3. [Step 3: Document DELETE /api/threads/:id endpoint](#step-3)

## 🗺️ Overview

In this tutorial, you'll implement the ability to delete threads through your custom Express API. This is your first **destructive operation** - an action that permanently removes data from the database. You'll learn how to handle DELETE HTTP requests, leverage database CASCADE constraints, and understand the important responsibility that comes with implementing delete functionality.

⚠️ **Important**: Unlike read operations or creating new data, delete operations are irreversible. This tutorial emphasizes the care and consideration required when implementing such features.

---

<a name="step-1"></a>

## Step 1: Implement DELETE /api/threads/:id endpoint

### 🤔 Problem to solve

Currently, users can view and create threads through your API, but there's no way to remove unwanted threads. The frontend already has a delete button that uses Supabase directly, but you need to implement deletion through your own API to maintain consistency and control.

**Key question**: When you delete a thread, what should happen to all the messages in that thread?

### 💡 Key concepts

- **DELETE HTTP method**: Used for removing resources from a server
- **Destructive operations**: Actions that permanently remove data (cannot be undone)
- **ON DELETE CASCADE**: Database constraint that automatically deletes related records
- **RETURNING clause**: Allows you to confirm whether a deletion actually occurred
- **404 vs 200 responses**: Not found vs successful deletion

### 📝 Your task

Create a new endpoint in `backend/server.js` that:

1. Handles DELETE requests to `/api/threads/:id`
2. Extracts the thread ID from the URL parameters
3. Deletes the thread from the database using a SQL DELETE statement
4. Returns 404 if the thread doesn't exist
5. Returns 200 with a confirmation message if deletion succeeds

💭 **Think about this**: How can you tell if a thread was actually deleted versus it never existing in the first place?

### 🔍 Implementation hints

- Use `app.delete()` to define the route (similar to `app.get()` and `app.post()`)
- The SQL syntax is: `DELETE FROM table_name WHERE condition RETURNING columns`
- Check if the result array is empty to determine if anything was deleted
- Remember: The database CASCADE constraint will automatically delete associated messages

### ⚠️ Important considerations

- **This is permanent**: Once deleted, the data cannot be recovered
- **Cascade effects**: All messages in the thread will also be deleted
- **Idempotency**: What happens if the same delete request is sent twice?

### ✅ Reference implementation

**🔗 Commit**: [`d28a685`](11/commits/d28a685)

### 💬 Discussion points

1. **Why use RETURNING?** The DELETE statement could work without it. What advantage does `RETURNING id` give us?

2. **Soft deletes vs hard deletes**: This implementation permanently removes data from the database (hard delete). An alternative approach is "soft delete" where you add a `deleted_at` timestamp column and filter out deleted records in queries. What are the trade-offs?

3. **Authorization**: Currently, anyone can delete any thread. In a real application, how would you verify that the user has permission to delete this specific thread?

### 🧪 Test your solution

Start your backend server and test with curl:

```bash
# First, get a thread ID from your database
curl http://localhost:3000/api/threads

# Delete a thread (replace with actual UUID)
curl -X DELETE http://localhost:3000/api/threads/YOUR-THREAD-ID

# Try deleting the same thread again (should get 404)
curl -X DELETE http://localhost:3000/api/threads/YOUR-THREAD-ID

# Verify messages were also deleted (should return empty array or 404)
curl http://localhost:3000/api/threads/YOUR-THREAD-ID/messages
```

---

<a name="step-2"></a>

## Step 2: Update frontend thread deletion to use local API

### 🤔 Problem to solve

The delete button in the sidebar works, but it's still calling Supabase directly. You need to update the frontend to use your new DELETE endpoint instead, completing the migration away from Supabase for thread deletion.

### 💡 Key concepts

- **DELETE requests in fetch API**: Specifying HTTP method in request options
- **RESTful URLs**: Using resource IDs in the URL path, not query parameters
- **Simplified requests**: No authentication headers needed with your own API (for now)

### 📝 Your task

Update the `clientAction` function in `frontend/app/routes/layout.jsx` to:

1. Remove Supabase URL and API key usage
2. Use your local API URL (`VITE_API_URL`) instead
3. Make a DELETE request to `/api/threads/${threadId}`
4. Keep the same error handling structure

🔍 **Compare**: Look at how the Supabase DELETE request is structured vs how simple your API call can be.

### 🔍 Implementation hints

- Use the fetch API with `method: "DELETE"` in the options object
- The URL should follow the pattern: `${apiUrl}/api/threads/${threadId}`
- DELETE requests typically don't have a request body
- No special headers are needed (unlike Supabase which requires `apikey` and `Authorization`)

### ✅ Reference implementation

**🔗 Commit**: [`c8467ff`](11/commits/c8467ff)

### 💬 Discussion points

1. **User experience**: Should you add a confirmation dialog before deleting? The operation is irreversible - how do you balance safety with convenience?

2. **Error handling**: What should happen if the delete fails? The reference implementation returns an error object. How could you display this to the user?

### 🧪 Test your solution

1. Start both your backend (`cd backend && npm run dev`) and frontend (`cd frontend && npm run dev`)
2. Open the application in your browser
3. Try deleting a thread using the delete button in the sidebar
4. Verify the thread disappears from the list
5. Verify with DevTools' Network tab that a DELETE request was sent to your API
6. Check your backend server logs to see the DELETE request
7. Verify in your database that both the thread and its messages were removed

---

<a name="step-3"></a>

## Step 3: Document DELETE /api/threads/:id endpoint

### 🤔 Problem to solve

Documentation is crucial for APIs, especially for destructive operations. Other developers (including your future self) need to understand what this endpoint does, what responses to expect, and how to test it safely.

### 💡 Key concepts

- **API documentation**: Clear description of endpoints, parameters, and responses
- **Destructive operation warnings**: Explicitly noting permanent data loss
- **Testing examples**: Showing both success and error cases

### 📝 Your task

Update `backend/README.md` to document the DELETE endpoint:

1. Add a new section after the POST endpoint documentation
2. Describe what the endpoint does (including CASCADE behavior)
3. Document both 200 (success) and 404 (not found) responses
4. Add curl examples for testing
5. **Warn users** about the permanent nature of this operation

💭 **Think about this**: What information would you want to know before using a delete endpoint for the first time?

### 🔍 Implementation hints

- Follow the same format as the existing endpoint documentation
- Include example request and response JSON
- Add curl commands that show both successful deletion and 404 error
- Consider adding a note about the CASCADE deletion of messages

### ✅ Reference implementation

**🔗 Commit**: [`265fd01`](11/commits/265fd01)

### 💬 Discussion points

1. **Testing destructive operations**: The documentation includes a curl example with a fake UUID (`00000000-0000-0000-0000-000000000000`) to test 404 responses. Why is this a good practice? How does it allow testing without risking real data?

2. **Documentation as a contract**: API documentation is essentially a contract with users of your API. What happens if your implementation doesn't match your documentation?

### 🧪 Test your solution

1. Read through your documentation as if you were a new developer
2. Try following the curl examples exactly as written
3. Verify that the responses match what the documentation says
4. Check that the warning about permanent deletion is clear and prominent

---

## 🎉 Congratulations!

You've successfully implemented thread deletion in your Express API! This completes another piece of the CRUD puzzle:

- **C**reate (POST messages)
- **R**ead (GET threads and messages)
- **U**pdate (not yet implemented)
- **D**elete (just completed!)

You've learned:

- How to handle DELETE HTTP requests in Express
- The importance of CASCADE constraints in relational databases
- How to use RETURNING to confirm deletion
- The responsibility that comes with implementing destructive operations
- How to document potentially dangerous API endpoints

## 🚀 Extra features if you have time

1. **Confirmation step**: Add a confirmation dialog in the frontend before deleting (use `window.confirm()`)

2. **Soft delete**: Instead of permanently deleting threads, add a `deleted_at` timestamp column and modify your queries to filter out deleted threads. This allows "undeleting" threads.

3. **Delete messages**: Add an endpoint to delete individual messages: `DELETE /api/threads/:threadId/messages/:messageId`

4. **Delete statistics**: Make the DELETE endpoint return how many messages were also deleted due to CASCADE: `{ message: "Thread deleted", messagesDeleted: 5 }`

## 📚 Additional resources

- [MDN: HTTP DELETE method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/DELETE)
- [PostgreSQL DELETE documentation](https://www.postgresql.org/docs/current/sql-delete.html)
- [Database CASCADE constraints explained](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
