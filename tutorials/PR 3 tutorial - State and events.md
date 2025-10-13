# React State and Event Handling - Step-by-Step Tutorial

## 🎯 Learning Objectives

By the end of this tutorial, you will understand and be able to implement:

- **Props destructuring** patterns for cleaner, more maintainable code
- **Event handling** in React components with onClick and onSubmit
- **React hooks**, specifically `useState` for managing component state
- **State lifting** and callback props for parent-child communication
- **Form handling** with controlled and uncontrolled component patterns
- **Computed state** and real-time data filtering
- **Accessibility** considerations for interactive elements

## 📋 Prerequisites

You should be comfortable with:

- Basic React component creation and JSX syntax ([PR #1](../pull/1))
- Rendering lists with `.map()` and keys ([PR #2](../pull/2))
- ES6 features like destructuring, arrow functions, and template literals
- Basic CSS and HTML concepts

## 🗺️ Overview

In this tutorial, we'll build upon our basic chat application by adding interactive features. You'll learn how to handle user interactions, manage changing data with state, and create responsive user interfaces. We'll start with simple button clicks and progress to complex form handling and real-time filtering.

---

## Step 1: Mastering props destructuring

### 🤔 Problem to solve

As React applications grow, accessing props with `props.propName` everywhere becomes verbose and makes components harder to read. You need a cleaner way to work with props that makes your component interfaces more explicit and maintainable.

### 💡 Key concepts

- **Props destructuring** extracts specific props directly in function parameters
- **Default values** prevent errors when props are undefined
- **Self-documenting code** makes component interfaces clearer at a glance

### 📝 Your task

Refactor all components in the chat application to use props destructuring:

1. Open each component file (`Chat.jsx`, `Sidebar.jsx`, and components within them)
2. Replace `props.propName` access patterns with destructured parameters
3. Add sensible default values for props that might be undefined (especially arrays and objects)
4. Ensure the application still works correctly after your changes

### 🔍 Implementation hints

- Function parameters support destructuring syntax: `function MyComponent({ propName })`
- Default values use the `=` operator: `{ threads = [] }`
- Consider what happens if a parent forgets to pass a prop—what's a safe fallback?
- Test with missing props to verify your defaults work correctly

### 💡 Think about this

Before implementing: Which props are most critical to have defaults for? What could break if an array prop is `undefined` when you try to call `.map()` on it?

### ✅ Reference implementation

**🔗 Commit**: [`edc0b74`](3/commits/edc0b74ee1c4a61ba284bab32c1176a4fc19a2e9)

### 💬 Discussion points

1. **Why are default values important?** What happens if a parent component forgets to pass a required prop?
2. **How does destructuring make code more maintainable?** Consider a component that uses 5-6 different props.

### 🧪 Test your solution

- Remove a default value and observe what error appears in the browser console
- Pass `undefined` for a prop and verify your defaults handle it gracefully
- Check that the `ChatThreadsList` component works even without the `threads` prop

---

## Step 2: Adding interactive UI elements

![hover-button-chat-thread](https://github.com/user-attachments/assets/841f39d3-f796-435f-9098-d473f13fa9ab)

### 🤔 Problem to solve

User's might want to be able to delete a chat thread. First you need to add delete buttons to each chat thread that appear on hover and provide clear visual feedback about their destructive action.

### 💡 Key concepts

- **Semantic HTML** using proper button elements for interactions
- **CSS hover states** for progressive disclosure of UI elements
- **Accessibility** with ARIA labels and focus management
- **Flexbox layouts** for aligning interactive elements

### 📝 Your task

Add a delete button to each thread item in the chat sidebar:

1. Add a `<button>` element to the `ChatThreadItem` component
2. Style it to appear only on hover using CSS transitions
3. Use a red color scheme to indicate it's a destructive action
4. Add proper accessibility attributes (`aria-label`, `type="button"`)
5. Position it using flexbox so it aligns to the right of each thread

### 🔍 Implementation hints

- Use `opacity: 0` by default and `opacity: 1` on hover for the show/hide effect
- Add a `transition` property for smooth appearance
- The button should have `type="button"` to prevent form submission
- Consider using an emoji or icon (like 🗑️ or ✕) for the button content
- Think about hover states on both the parent container and the button itself

### ✅ Reference implementation

**🔗 Commit**: [`17812b4`](3/commits/17812b46701fd489a722fced2e81579fa07fb7f2)

### 💬 Discussion points

1. **Why hide buttons until hover?** What are the UX benefits of progressive disclosure?
2. **How do accessibility attributes help users?** Consider users with screen readers or keyboard navigation.

### ⚠️ Common mistakes

- Forgetting `type="button"` makes buttons submit forms unexpectedly
- Missing hover states confuse users about clickable elements
- Poor color choices don't communicate button purpose

### 🧪 Test your solution

- Inspect the CSS to understand how your hover effect works
- Try tabbing through the interface - can you focus the delete buttons with a keyboard?
- Hover over different threads and verify the buttons appear smoothly

---

## Step 3: Handling events and debugging

<img width="1198" height="386" alt="console-log-on-button-click" src="https://github.com/user-attachments/assets/800b9bfc-c840-445c-b875-a7c199375402" />

### 🤔 Problem to solve

Pretty buttons are useless without functionality! You need to respond to user clicks on the delete button and understand how events work in React. The challenge: the button is inside a link, so you need to prevent the link from being triggered when clicking delete.

### 💡 Key concepts

- **Event handlers** functions that respond to user interactions
- **Event objects** contain information about what happened
- **Event.stopPropagation()** prevents unwanted event bubbling
- **Console logging** for debugging and development

### 📝 Your task

Make the delete button respond to clicks without triggering the parent link:

1. Create an event handler function called `handleDeleteClick`
2. Attach it to the delete button's `onClick` prop
3. Use `event.stopPropagation()` to prevent the click from bubbling to the parent link
4. Log useful debugging information to the console (thread id, title, timestamp)
5. Test that clicking the delete button doesn't navigate to the thread

### 🔍 Implementation hints

- Event handler functions receive an event object as their first parameter
- The event object has methods like `stopPropagation()` and `preventDefault()`
- Consider what data would be useful for debugging: thread information, event details, timestamps
- Use `console.log()` with an object to see structured data in the console

### 💡 Think about this

What's the difference between `stopPropagation()` and `preventDefault()`? When would you use each one?

### ✅ Reference implementation

**🔗 Commit**: [`2034b20`](3/commits/2034b200f56338eddcac3d02a98b982aa17b7754)

### 💬 Discussion points

1. **Why is `stopPropagation()` necessary?** What happens if you remove it?
2. **What information is useful for debugging?** How can console logs help during development?

### 🧪 Test your solution

- Open your browser's developer tools (F12) and click delete buttons
- Verify that clicking the delete button logs to the console but doesn't navigate
- Try clicking the thread title itself - it should still navigate to the thread
- Experiment: try removing `stopPropagation()` and see what happens

---

## Step 4: Managing state with React hooks

![delete-thread-on-click](https://github.com/user-attachments/assets/38a59ae1-1df3-49c1-80a0-bfad362747a2)

### 🤔 Problem to solve

Console logging is great for debugging, but users expect buttons to actually do something! You need to transform the static `threads` array into dynamic state that can be modified when users click delete. This requires understanding where state should live and how to communicate changes up the component tree.

### 💡 Key concepts

- **useState hook** for managing dynamic data
- **State updates** must be immutable (create new arrays, don't modify existing ones)
- **Callback props** for passing functions to child components
- **Unidirectional data flow** - data flows down, events flow up

### 📝 Your task

Transform the static threads array into stateful data and implement actual deletion:

1. In `layout.jsx`, convert the `threads` array to state using `useState`
2. Create a `deleteThread` function that removes a thread by its ID
3. Use `filter()` to create a new array without the deleted thread (don't mutate!)
4. Pass the `deleteThread` function down through props: Layout → Sidebar → ChatThreadsList → ChatThreadItem
5. In `ChatThreadItem`, call the `onDeleteThread` callback instead of just logging
6. Test that clicking delete actually removes threads from the UI

### 🔍 Implementation hints

- Import `useState` from React: `import { useState } from 'react'`
- Use the functional form of `setState` when the new state depends on the old state
- The `filter()` method returns a new array containing only items that pass a test
- Each component in the chain needs to accept and pass down the callback prop
- Think about prop names: `onDeleteThread` in the child, `deleteThread` in the parent

### 💡 Think about this

Before implementing: How would you remove an item from an array without modifying the original array? Why is immutability important in React?

### ✅ Reference implementation

**🔗 Commit**: [`33de560`](3/commits/33de56090b7491b82d2caf6028bb3140f6c0c5c4)

### 💬 Discussion points

1. **Why use `filter()` instead of `splice()`?** What's the difference between mutating and creating new arrays?
2. **How does the callback pattern work?** Trace the path from clicking delete to updating state.

### 🧪 Test your solution

- Click delete buttons and watch threads disappear from the UI
- Open React DevTools to see state changes in real-time
- What happens if you forget to pass `onDeleteThread` to a child component?
- Challenge: try modifying the delete function to restore a thread after 3 seconds using `setTimeout`

---

## Step 5: Form handling and component state

![pending-submit-on-chat-input](https://github.com/user-attachments/assets/49f35a2b-682f-44cd-88ae-66458b65f930)

### 🤔 Problem to solve

The chat input looks like a form but doesn't behave like one. You need to add proper form submission handling, implement loading states to show when something is processing, and provide user feedback during operations. This is crucial for good user experience, especially with async operations.

### 💡 Key concepts

- **Form elements** and semantic HTML for better accessibility
- **onSubmit handlers** vs onClick handlers
- **Component-level state** with useState
- **Conditional rendering** based on state values
- **Async operation simulation** for realistic user experience

### 📝 Your task

Transform the ChatInput component into a proper interactive form:

1. Wrap the textarea and button in a `<form>` element
2. Add state to track whether the form is submitting: `isSubmitting`
3. Create a `handleSubmit` function that:
   - Prevents default form submission (no page refresh!)
   - Sets `isSubmitting` to true
   - Simulates an async operation with `setTimeout` (1 second)
   - Sets `isSubmitting` back to false after the delay
4. Attach the handler to the form's `onSubmit` prop
5. Disable the submit button while `isSubmitting` is true
6. Show different button text while submitting (e.g., "Sending...")

### 🔍 Implementation hints

- Forms trigger submit events, not click events - use `onSubmit` on the `<form>` element
- Always call `event.preventDefault()` in form submit handlers to prevent page reload
- Use conditional rendering: `{isSubmitting ? "Sending..." : "Send"}`
- The `disabled` attribute on buttons prevents interaction during processing
- `setTimeout` mimics async operations like API calls for now

### 💡 Think about this

What happens if you forget `event.preventDefault()`? Try it and see! Also, why disable the button during submission?

### ✅ Reference implementation

**🔗 Commit**: [`c1f8119`](3/commits/c1f8119808be387e49af90c3e0325f2568b6704c)

### 💬 Discussion points

1. **Why use a form element instead of just div + button?** Consider keyboard users and screen readers.
2. **When should you show loading states?** How do they improve user experience?

### ⚠️ Common mistakes

- Forgetting `event.preventDefault()` causes page refreshes
- Not disabling buttons during submission allows double-clicks
- Missing loading states leave users wondering if something happened

### 🧪 Test your solution

- Try submitting the form multiple times quickly. What prevents duplicate submissions?
- Press Enter while focused in the textarea. Does the form submit properly?
- Watch the button text and state change during submission

---

## Step 6: State lifting and parent-child communication

![add-message-on-submit](https://github.com/user-attachments/assets/2119afe2-d10d-4e20-b1c3-e7d3f138b254)

### 🤔 Problem to solve

The chat input can submit but messages don't appear anywhere! You need to connect form submission to the messages list. This requires understanding where state should live and how child components communicate changes back to parents. The `ChatInput` and `ChatMessages` components are siblings, so their shared state must live in their common parent.

### 💡 Key concepts

- **State lifting** - moving state up to the nearest common parent
- **Callback props** for child-to-parent communication
- **FormData API** for uncontrolled form handling
- **Immutable updates** with spread operator
- **Form validation** and user experience

### 📝 Your task

Connect form submission to the messages list through lifted state:

1. In the `Home` component, convert the `messages` array to state using `useState`
2. Create an `addMessage` function that:
   - Accepts form data as a parameter
   - Extracts the message text using the FormData API
   - Validates that the message isn't empty (trim whitespace!)
   - Adds a new message object to the messages array immutably
   - Generates a unique ID for each message (use `Date.now()` for now)
3. Pass the `addMessage` function to `ChatInput` as a prop
4. In `ChatInput`, modify `handleSubmit` to:
   - Create a FormData object from the form
   - Call the `onAddMessage` callback with the form data
   - Reset the form after successful submission
5. Add a `name="message"` attribute to the textarea so FormData can find it
6. Test by typing messages and seeing them appear in the chat

### 🔍 Implementation hints

- The FormData API: `new FormData(event.target)` gets all form field values
- Extract values with `formData.get('fieldName')`
- Use the spread operator for immutable array updates: `[...oldArray, newItem]`
- The `.trim()` method removes whitespace from strings
- Forms have a `.reset()` method to clear all fields
- Early return pattern: `if (!message) return;` prevents empty submissions

### 💡 Think about this

Where should the messages state live? In ChatInput, ChatMessages, or Home? What are the trade-offs of each choice?

### ✅ Reference implementation

**🔗 Commit**: [`88ed179`](3/commits/88ed1791b4ccfda6c71e289193d40b7393a187fa)

### 💬 Discussion points

1. **What's the difference between controlled and uncontrolled forms?** When would you use each approach?
2. **Why validate empty messages?** How does this improve user experience?

### 🧪 Test your solution

- Type messages and watch them appear in the chat!
- Try submitting an empty message or just spaces. What happens and why?
- Notice how the form clears after submission
- Challenge: modify the addMessage function to add a timestamp to each message

---

## Step 7: Advanced state patterns with real-time filtering

![filter-chat-threads](https://github.com/user-attachments/assets/2e4ee14b-a3b3-4f70-8daf-1b1719a94b82)

### 🤔 Problem to solve

As users accumulate many chat threads, finding specific conversations becomes difficult. You need to add search functionality that filters threads in real-time as users type. This introduces the concept of controlled components and computed state - important patterns for creating responsive, interactive UIs.

### 💡 Key concepts

- **Controlled components** where React manages input values
- **Computed state** - deriving data without additional useState
- **Real-time filtering** with array methods
- **Case-insensitive search** for better user experience
- **When to compute vs store** - performance considerations

### 📝 Your task

Add a search input that filters the thread list in real-time:

1. In the `ChatThreadsList` component, add state for the search value
2. Create an `<input>` element above the threads list
3. Make it a **controlled component** by:
   - Setting its `value` prop to the search state
   - Handling `onChange` events to update the state
4. Compute filtered threads (don't use `useState` for this!):
   - Use `filter()` to create a new array of matching threads
   - Use `includes()` to check if the thread title contains the search text
   - Convert both to lowercase for case-insensitive matching
5. Pass `filteredThreads` instead of `threads` to the list component
6. Test by typing in the search box and watching threads filter instantly

### 🔍 Implementation hints

- Controlled components: `<input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />`
- The event object has `e.target.value` containing the current input value
- Computed values are just regular variables: `const filtered = array.filter(...)`
- String methods: `.toLowerCase()` and `.includes(substring)`
- Think about when to compute: is this data that changes based on other state?
- Add a placeholder to guide users: `placeholder="Search threads..."`

### 💡 Think about this

Should `filteredThreads` be stored in state with `useState`, or computed on each render? What are the performance implications? When would you choose one approach over the other?

### ✅ Reference implementation

**🔗 Commit**: [`6425c64`](3/commits/6425c6405fc04155a264ccb683c11fb31698bb22)

### 💬 Discussion points

1. **Controlled vs uncontrolled components**: What are the benefits and drawbacks of each approach?
2. **When should you compute state vs store it?** Consider memory usage and re-render frequency.

### 🧪 Test your solution

- Type in the search box and watch threads filter in real-time!
- Try partial matches (e.g., typing "work" to find "Work project")
- Test case-insensitivity (uppercase and lowercase searches should work the same)
- What happens if you search for something that doesn't match any threads?
- Challenge: try implementing "clear search" functionality - where would you add it?

---

## 🚀 Extra features if you have time

### Challenge 1: Enhanced form validation

- Add minimum message length requirements
- Show validation errors to users
- Prevent submission of whitespace-only messages

### Challenge 2: Advanced filtering

- Add filtering by thread topic or date
- Implement multiple search terms with AND/OR logic
- Add search history dropdown

### Challenge 3: Keyboard shortcuts

- Implement Ctrl+K for focusing search
- Add Enter/Escape handling for search
- Tab navigation improvements

---

## 📚 Additional resources

### React documentation

- [useState hook](https://react.dev/reference/react/useState)
- [Responding to Events](https://react.dev/learn/responding-to-events)
- [State: A Component's Memory](https://react.dev/learn/state-a-components-memory)

### Advanced topics for future learning

- useEffect for side effects and lifecycle management
- Custom hooks for reusable stateful logic
- Context API for global state management
- useReducer for complex state logic

### Best practices

- Always use keys when rendering lists
- Keep state as close to where it's used as possible
- Prefer computed state over storing derived data
- Use semantic HTML for better accessibility
- Implement proper loading and error states

---

**🏁 Congratulations:** You've completed a comprehensive tutorial on React state management and event handling! You now understand:

✅ How to structure components with clean props destructuring  
✅ Creating interactive UIs with proper event handling  
✅ Managing dynamic data with React hooks  
✅ Implementing parent-child communication patterns  
✅ Building forms with proper validation and feedback  
✅ Advanced state patterns with computed data and real-time filtering

These concepts form the foundation for building modern, interactive React applications. Keep practicing and experimenting with different state patterns 🤘
