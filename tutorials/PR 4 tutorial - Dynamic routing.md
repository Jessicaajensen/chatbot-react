# Dynamic routing with React Router v7 - Step-by-step tutorial

## 🎯 Learning objectives

By completing this tutorial, you will:

- Understand what dynamic routes are and why they're essential for modern SPAs
- Configure dynamic route patterns using React Router v7's `routes.js` file
- Create new route components for different parts of your application
- Use the `Link` component for client-side navigation (no page reloads!)
- Extract and use URL parameters with the `useParams()` hook
- Build a chatbot application with proper URL structure for different conversations

## 📋 Prerequisites

Before starting this tutorial, you should:

- Have completed the previous tutorials on React components and state management
- Understand React hooks (`useState`, basic hook concepts)
- Be familiar with the existing chatbot project structure
- Know basic JavaScript destructuring syntax

## 📑 Table of Contents

1. [Add dynamic routes for chat threads and new chat](#step-1)
2. [Use useParams hook to access threadId from URL](#step-2)

## 🗺️ Overview

In this tutorial, you'll transform the chatbot from a single-page application into a multi-route application where each conversation thread has its own URL. This enables users to:

- Share links to specific conversations
- Use browser navigation (back/forward buttons)
- Bookmark specific chat threads
- Start new conversations at a dedicated URL

You'll implement this in two major steps:

1. **Set up dynamic routes** - Configure route patterns and create route components
2. **Access URL parameters** - Use the `useParams()` hook to make routes truly dynamic

---

<a name="step-1"></a>

## Step 1: Add dynamic routes for chat threads and new chat

### 🤔 Problem to solve

Currently, your chatbot application has only one route (`/`) that displays the home page. But what happens when users want to:

- Start a new conversation?
- View a specific conversation thread?
- Share a link to a particular chat?

Without proper routing, there's no way to navigate between different views or represent different application states in the URL. Each chat thread needs its own URL so users can navigate directly to it.

### 💡 Key concepts

**Dynamic routes** use URL parameters (like `:threadId`) to match multiple URLs with a single route definition:

- `/chat/1`, `/chat/2`, `/chat/999` all match the pattern `/chat/:threadId`
- The value after `/chat/` becomes available to your component as a parameter (much like you're used to from Express routes)

**Client-side navigation** uses React Router's `Link` component:

- Clicking a `Link` doesn't reload the page (unlike `<a>` tags)
- Navigation is instant because React Router just swaps components
- Your application state is preserved during navigation

**The `href()` utility function** generates dynamic URLs from route patterns:

```javascript
href("/chat/:threadId", { threadId: 5 }); // Returns: "/chat/5"
```

### 📝 Your task

Implement dynamic routing for the chatbot application:

1. **Update `routes.js`** to define two new routes nested under the layout:

   - A route for starting new chats: `/chat/new`
   - A dynamic route for viewing threads: `/chat/:threadId`

2. **Create `chat-new.jsx`** route component:

   - Should render an empty chat interface
   - Include a helpful header like "Start a new conversation"
   - Reuse existing `ChatMessages` and `ChatInput` components

3. **Create `chat-thread.jsx`** route component:

   - Should render a chat interface with some placeholder messages
   - Use the `defaultMessages` array to show existing conversation (we'll make it truly dynamic later)

4. **Replace `<a>` tags with `<Link>` components** in `Sidebar.jsx`:

   - Update `SidebarHeader` to use [`Link`](https://reactrouter.com/api/components/Link#link) for the "New" button
   - Update `ChatThreadItem` to use `Link` for thread links
   - Use the [`href()`](https://reactrouter.com/api/utils/href#href) function to generate thread URLs dynamically

5. **Clean up the thread data** in `layout.jsx`:
   - Remove the hardcoded `href` property from each thread object
   - The URLs will now be generated dynamically by the `href()` function

### 🔍 Implementation hints

<details>
<summary>💡 Hint: Route configuration syntax</summary>

React Router v7's `routes.js` uses a nested array structure:

```javascript
route("parent/path", "component.jsx", [
  route("child/path", "child-component.jsx"),
]);
```

Remember that route paths are relative to their parent. If the parent is `"/"`, then `"chat/new"` becomes `/chat/new`.

</details>

<details>
<summary>💡 Hint: Dynamic route parameters</summary>

To define a URL parameter, prefix it with a colon:

- `route("chat/:threadId", "...")` creates a parameter named `threadId`
- This matches `/chat/1`, `/chat/abc`, `/chat/anything`
</details>

<details>
<summary>💡 Hint: Using the Link component</summary>

Import from `react-router`:

```javascript
import { Link } from "react-router";
```

Replace `<a href="...">` with `<Link to="...">`:

```javascript
<Link to="/chat/new">New Chat</Link>
```

</details>

<details>
<summary>💡 Hint: Generating dynamic URLs</summary>

The `href()` function takes a route pattern and parameter object:

```javascript
import { href } from "react-router";

// In your component:
const url = href("/chat/:threadId", { threadId: thread.id });
```

</details>

### 🤔 Before looking at the code

Try to answer these questions before viewing the reference implementation:

1. Why do you think we need both `/chat/new` AND `/chat/:threadId`? Couldn't we just use the dynamic route for everything?
2. What will happen if you navigate to `/chat/new` - will it match the `:threadId` route?
3. How does React Router know which component to render when you visit `/chat/5`?

### ✅ Reference implementation

Once you've attempted the implementation, compare your solution with the reference:

**🔗 Commit**: [`8c4550b`](4/commits/8c4550bf9ea84c2e2beb0535f718d9c41983b8c9)

This commit shows:

- How to configure nested routes with parameters in `routes.js`
- Two new route components that reuse existing Chat components
- Conversion from `<a>` tags to `<Link>` components for better UX
- Using the `href()` utility to generate URLs from thread IDs
- Simplified data structure (removed hardcoded URLs)

### 💬 Discussion points

1. **Data-driven URLs**: We removed the `href` property from thread objects. How is this better than storing URLs in your data? What if your URL structure changed?

2. **Client-side vs server-side navigation**: Click a thread link and watch your browser's network tab. Notice anything? What are the performance implications?

### 🧪 Test your solution

Verify your implementation works correctly:

1. **Start the development server** and navigate to `http://localhost:5173`
2. **Click the "+ New" button** - you should navigate to `/chat/new` without a page reload
3. **Click any thread in the sidebar** - URL should change to `/chat/1`, `/chat/2`, etc.
4. **Check the browser's back button** - it should work to go back through your navigation history
5. **Type a URL directly**: Try `http://localhost:5173/chat/42` - you should see the thread view
6. **Inspect the Network tab**: Click around - you should see NO full page loads, only fast client-side navigation

---

<a name="step-2"></a>

## Step 2: Use useParams hook to access threadId from URL

### 🤔 Problem to solve

You now have a dynamic route (`/chat/:threadId`) that matches any thread URL, but there's a problem: the `ChatThread` component doesn't actually _use_ the thread ID from the URL!

Currently, every thread shows the same placeholder messages. To make this truly dynamic, you need to:

- Extract the `threadId` from the URL
- Display it to confirm the route is working
- Eventually use it to load the correct messages (in a future tutorial)

### 💡 Key concepts

**The `useParams()` hook** is React Router's way of accessing URL parameters:

```javascript
// URL: /chat/42
const { threadId } = useParams(); // threadId = "42"
```

Key things to know:

- Parameter names match what you defined in `routes.js` (`:threadId` → `threadId`)
- Values are always strings (even if they look like numbers)
- `useParams()` must be called inside a component that's rendered by a route

### 📝 Your task

Make the `ChatThread` component display which thread it's showing:

1. **Import the `useParams` hook** from `react-router`

2. **Extract the `threadId`** from the URL parameters using destructuring

3. **Display the thread ID** in the UI:

   - Add a header section at the top of the chat
   - Show something like "Conversation Thread #42"
   - Style it to make it clear this is dynamic content

### 🔍 Implementation hints

<details>
<summary>💡 Hint: Hook syntax</summary>

React Router hooks follow the same patterns as React hooks:

```javascript
import { useParams } from "react-router";

function MyComponent() {
  const { paramName } = useParams();
  // ...
}
```

</details>

<details>
<summary>💡 Hint: Destructuring the parameter</summary>

The parameter name must match what you defined in `routes.js`:

- Route: `route("chat/:threadId", ...)`
- Hook: `const { threadId } = useParams()`

Make sure the spelling matches exactly!

</details>

<details>
<summary>💡 Hint: Adding a header</summary>

Look at the `chat-new.jsx` component - it already has a header section you can use as reference. You can add a similar `<div className="chat-thread-header">` section.

</details>

### 🤔 Before looking at the code

Try to answer these questions:

1. What will `threadId` be if you navigate to `/chat/hello`? What about `/chat/123`?
2. The `useParams()` hook is called inside the component function. Why can't we call it outside (like at the module level)?
3. What happens if you try to use `useParams()` in the `Sidebar` component?

### ✅ Reference implementation

**🔗 Commit**: [`e3e6d7f`](4/commits/e3e6d7f95a95744c5010a5dd06f954d3812ad40a)

This commit demonstrates:

- Importing and using the `useParams()` hook
- Extracting URL parameters with destructuring
- Displaying dynamic content based on the URL
- Understanding the component's current limitations (shared state)

### 💬 Discussion points

1. **String vs number types**: URL parameters are always strings. If you need to use the `threadId` to fetch data from an API or database, do you need to convert it to a number? Why or why not?

2. **Shared state problem**: Notice the comment in the code about messages being "shared among all threads". Why is this happening? What React concept explains this behavior? (Hint: Think about component lifecycle and state initialization.)

3. **Future data loading**: Right now, we're just displaying the thread ID. In a real application, you'd use this ID to fetch the correct messages from a database. What would be the next steps to implement that?

### 🧪 Test your solution

Verify that URL parameters are working:

1. **Navigate to different threads** - `/chat/1`, `/chat/2`, `/chat/999`
2. **Check the header** - it should display the correct thread number
3. **Try non-numeric IDs** - visit `/chat/hello-world` - what happens?
4. **Test the shared state issue**:
   - Go to `/chat/1` and type a message
   - Navigate to `/chat/2` - notice your message is still there!
   - This is the expected behavior for now (you'll fix it later with data loading)
5. **Inspect React DevTools** - look at the `ChatThread` component's props and hooks to see the `threadId` value

---

## 🎉 Congratulations!

You've implemented dynamic routing in your chatbot application! Your app now:

- ✅ Has multiple routes with different URLs
- ✅ Uses client-side navigation for instant page transitions
- ✅ Extracts and displays URL parameters
- ✅ Provides shareable URLs for different conversation threads

### 🚀 Extra features if you have time

Want to take this further? Try these challenges:

1. **Breadcrumb navigation**: Add a breadcrumb at the top showing "Home > Chat > Thread #5" with links to navigate back.

2. **Keyboard shortcuts**: Add a keyboard shortcut (like `Ctrl+N`) to navigate to `/chat/new`.

## 📚 Additional resources

- [React Router Routes Configuration](https://reactrouter.com/start/framework/routing)
- [useParams Hook Documentation](https://reactrouter.com/api/hooks/useParams)
- [Link Component API Reference](https://reactrouter.com/api/components/Link)
