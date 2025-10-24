import {
  useActionData,
  Form,
  redirect,
  Link,
  useRouteLoaderData,
} from "react-router";
import { apiFetch } from "../lib/apiFetch.js";
import { useState, useRef } from "react";

/**
 * Edit Thread Title Route Component
 *
 * Enhanced with:
 * - Cancel confirmation when there are unsaved changes
 * - Keyboard shortcuts (Escape to cancel, Ctrl/Cmd+Enter to save)
 * - Visual feedback for keyboard shortcuts
 */
export default function ChatThreadEdit() {
  const { thread } = useRouteLoaderData("routes/chat-thread");
  const actionData = useActionData();

  // Track if the input has been changed
  const [hasChanges, setHasChanges] = useState(false);
  
  // Reference to the form for programmatic submission
  const formRef = useRef(null);

  // Handle input changes to track if user made modifications
  const handleInputChange = (e) => {
    setHasChanges(e.target.value !== thread.title);
  };

  // Handle cancel with confirmation if there are unsaved changes
  const handleCancel = (e) => {
    if (hasChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );
      if (!confirmed) {
        e.preventDefault();
      }
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    // Escape key to cancel
    if (e.key === "Escape") {
      if (hasChanges) {
        const confirmed = window.confirm(
          "You have unsaved changes. Are you sure you want to cancel?"
        );
        if (confirmed) {
          window.history.back();
        }
      } else {
        window.history.back();
      }
    }
    
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <div className="edit-title-overlay">
      <Form method="post" className="edit-title-form" ref={formRef}>
        <div className="form-field">
          <label htmlFor="title">Edit thread title</label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={thread.title}
            autoFocus
            required
            className="title-input"
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <div className="keyboard-hints">
            <small>💡 Press <kbd>Esc</kbd> to cancel • <kbd>Ctrl/Cmd+Enter</kbd> to save</small>
          </div>
        </div>

        <div className="form-buttons">
          <button type="submit" className="save-button">
            Save
          </button>
          <Link to=".." className="cancel-button" onClick={handleCancel}>
            Cancel
          </Link>
        </div>
      </Form>
      {actionData?.error && (
        <div className="error-message">{actionData.error}</div>
      )}
    </div>
  );
}

/**
 * CLIENT ACTION FUNCTION
 * Handles the form submission to update the thread title.
 */
export async function clientAction({ params, request }) {
  const formData = await request.formData();
  const title = formData.get("title");

  // Validate title
  if (!title || !title.trim()) {
    return { error: "Title cannot be empty" };
  }

  try {
    const response = await apiFetch(`/api/threads/${params.threadId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: title.trim() }),
    });

    if (response.status === 400) {
      const error = await response.json();
      return { error: error.error || "Invalid title" };
    }

    if (response.status === 404) {
      return { error: "Thread not found" };
    }

    if (!response.ok) {
      return { error: `Failed to update title: ${response.status}` };
    }

    return redirect("..");
  } catch (error) {
    return { error: error.message };
  }
}