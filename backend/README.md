# Chatbot Backend API

Express.js REST API for the chatbot application. This API connects to a PostgreSQL database hosted on Supabase.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Make a copy of `.env.example` in the `backend` folder and call it `.env`. (**Note:** This is a separate `.env` file from the one in the `frontend` folder.)

Edit `backend/.env` and add your Supabase database connection string:

```env
DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
PORT=3000
```

To find your DATABASE_URL:

1. Go to your Supabase project dashboard
2. Click the **Connect** button in the header
3. Under **Connection String** > **URI**, copy the connection string listed under **Transaction pooler**.
4. Replace `[YOUR-PASSWORD]` with your database password

### 3. Start the Server

Development mode (with auto-restart on file changes):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### GET /

Health check endpoint to verify the server is running.

**Response:**

```json
{
  "message": "Chatbot API Server 🤖",
  "version": "1.0.0"
}
```

### GET /api/threads

Fetches all chat threads, ordered by creation date (newest first).

**Response:**

```json
[
  {
    "id": "uuid",
    "title": "Thread title",
    "created_at": "2025-10-13T10:30:00Z"
  }
]
```

### GET /api/threads/:id

Fetches a single thread by its ID.

**URL Parameters:**

- `id` - The UUID of the thread

**Response (200 OK):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "My chat thread",
  "created_at": "2025-10-13T10:30:00Z"
}
```

**Response (404 Not Found):**

```json
{
  "error": "Thread not found"
}
```

### GET /api/threads/:id/messages

Fetches all messages for a specific thread, ordered chronologically (oldest first).

**URL Parameters:**

- `id` - The UUID of the thread

**Response:**

```json
[
  {
    "id": "uuid",
    "thread_id": "uuid",
    "type": "user",
    "content": "Hello, how are you?",
    "created_at": "2025-10-13T10:30:00Z"
  },
  {
    "id": "uuid",
    "thread_id": "uuid",
    "type": "bot",
    "content": "I'm doing well, thank you!",
    "created_at": "2025-10-13T10:30:15Z"
  }
]
```

**Note:** Returns an empty array `[]` if the thread has no messages.

## Testing

### Test with curl

```bash
# Health check
curl http://localhost:3000/

# Get all threads
curl http://localhost:3000/api/threads

# Get a specific thread (replace with an actual UUID from your database)
curl http://localhost:3000/api/threads/123e4567-e89b-12d3-a456-426614174000

# Get messages for a thread
curl http://localhost:3000/api/threads/123e4567-e89b-12d3-a456-426614174000/messages
```

### Test with Browser

Open your browser and navigate to:

- `http://localhost:3000/` - Should show the welcome message
- `http://localhost:3000/api/threads` - Should show the list of threads
- `http://localhost:3000/api/threads/{id}` - Replace `{id}` with an actual thread UUID
- `http://localhost:3000/api/threads/{id}/messages` - Shows messages for a specific thread

## Project Structure

```
backend/
├── .env.example      # Environment variables template
├── .gitignore        # Git ignore rules
├── db.js             # Database connection setup
├── package.json      # Node.js dependencies and scripts
├── server.js         # Express server and API routes
└── README.md         # This file
```

## Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [Postgres.js Documentation](https://github.com/porsager/postgres)
