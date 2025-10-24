// Create new file: frontend/app/routes/chat-thread-message-edit.jsx

import {
  useActionData,
  Form,
  redirect,
  Link,
  useParams,
  useRouteLoaderData,
} from "react-router";
import { apiFetch } from "../lib/apiFetch.js";
import { useState, useRef } from "react";

/**
 * Edit Message Route Component
 *
 * Nested route for editing individual message content.
 * Similar pattern to thread title editing but for messages.
 */
export default function ChatThreadMessageEdit() {
  const { messageId } = useParams();
  const { messages } = useRouteLoaderData("routes/chat-thread");
  const actionData = useActionData();

  // Find the specific message being edited
  const message = messages.find((m) => m.id === messageId);

  // If message not found or is a bot message, show error
  if (!message) {
    return (
      <div className="edit-message-overlay">
        <div className="edit-message-form">
          <div className="error-message">Message not found</div>
          <Link to=".." className="cancel-button">
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  if (message.type === "bot") {
    return (
      <div className="edit-message-overlay">
        <div className="edit-message-form">
          <div className="error-message">Bot messages cannot be edited</div>
          <Link to=".." className="cancel-button">
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  const [hasChanges, setHasChanges] = useState(false);
  const formRef = useRef(null);

  const handleInputChange = (e) => {
    setHasChanges(e.target.value !== message.content);
  };

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
    <div className="edit-message-overlay">
      <Form method="post" className="edit-message-form" ref={formRef}>
        <div className="form-field">
          <label htmlFor="content">Edit message</label>
          <textarea
            id="content"
            name="content"
            defaultValue={message.content}
            autoFocus
            required
            rows="4"
            className="message-textarea"
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
 * Handles the form submission to update the message content.
 */
export async function clientAction({ params, request }) {
  const formData = await request.formData();
  const content = formData.get("content");

  // Validate content
  if (!content || !content.trim()) {
    return { error: "Content cannot be empty" };
  }

  try {
    const response = await apiFetch(`/api/messages/${params.messageId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: content.trim() }),
    });

    if (response.status === 400) {
      const error = await response.json();
      return { error: error.error || "Invalid content" };
    }

    if (response.status === 403) {
      const error = await response.json();
      return { error: error.error || "Cannot edit this message" };
    }

    if (response.status === 404) {
      return { error: "Message not found" };
    }

    if (!response.ok) {
      return { error: `Failed to update message: ${response.status}` };
    }

    // Redirect back to thread view
    return redirect(`/chat/${params.threadId}`);
  } catch (error) {
    return { error: error.message };
  }
}