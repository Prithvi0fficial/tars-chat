# 💬 Real-Time Chat Application  

## 🌍 Live Demo

Vercel Deployment:  
[Click here](https://chat-npzjvqzst-prithvi0fficials-projects.vercel.app/)

---

## 📌 Project Overview

This is a production-ready real-time one-on-one chat application .

The application enables authenticated users to discover other users, initiate conversations, exchange messages in real time, react to messages, and manage their chat experience with modern UX patterns.

The project demonstrates:

- Real-time system design
- Clean TypeScript architecture
- Scalable schema modeling
- Responsive UI implementation
- Production deployment practices

---

## 🧱 Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS

### Backend & Real-Time Infrastructure
- Convex (Database + Realtime Subscriptions + Server Functions)

### Authentication
- Clerk

### Deployment
- Vercel (Frontend)
- Convex Production Deployment

---
## 🔐 Environment Variables Setup

This project requires environment variables for authentication and backend connectivity.

For security reasons, the `.env.local` file is NOT included in this repository.

You must create it manually.

---

### 1️⃣ Create Environment File

Create a file in the root directory:

```
.env.local
```

---

### 2️⃣ Add Required Variables

Add the following:

```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Convex Backend
NEXT_PUBLIC_CONVEX_URL=your_convex_url
CONVEX_DEPLOYMENT=your_convex_deployment_name
```

---

### 3️⃣ Where To Get These Keys

#### Clerk
1. Go to https://dashboard.clerk.com
2. Create / open your application
3. Copy:
   - Publishable Key
   - Secret Key

#### Convex
1. Run:
   ```
   npx convex dev
   ```
   OR
   ```
   npx convex deploy
   ```
2. Convex will generate:
   - Deployment name
   - URL
3. Copy values into `.env.local`

---

### ⚠️ Important

- Never commit `.env.local` to GitHub.
- Make sure `.gitignore` contains:
  ```
  .env.local
  ```

---

### 🚀 For Production (Vercel)

In Vercel:

1. Go to Project Settings → Environment Variables
2. Add the same variables there
3. Redeploy the project

## ✨ Features

### Core Features

- 🔐 Secure Authentication (Sign up / Login / Logout)
- 👤 User profile creation & storage
- 💬 One-on-one real-time messaging
- 🔎 Real-time user search
- 🧭 Sidebar with conversation preview
- 📱 Fully responsive layout (Mobile + Desktop)

---

### Advanced Features

- 🟢 Real-time online/offline indicator
- ✍️ Typing indicator (auto-timeout based)
- 🔔 Unread message count badge
- 📜 Smart auto-scroll behavior
- 🕒 Intelligent timestamp formatting:
  - Today → Time only
  - Previous days → Date + Time
  - Different year → Includes year
- 🗑 Soft delete (Sender only)
  - Message is marked deleted
  - Displays “This message was deleted”
  - Record remains in database
- ❤️ Message reactions
  - Toggle reactions
  - Real-time count updates
  - Prevent duplicate reactions per user
- ⚡ Real-time UI updates using Convex subscriptions
- 🎨 WhatsApp-inspired clean UI

---

## 🧠 Architecture Overview

### Database Schema (Convex)

Tables:

- `users`
- `conversations`
- `messages`
- `reactions`

### Key Design Decisions

- Conversations store `memberIds` for scalable querying.
- Messages use soft delete (`isDeleted`) instead of hard deletion.
- Reactions indexed by `(messageId, userId)` to prevent duplicates.
- Real-time updates powered by Convex reactive queries.
- Timestamp formatting handled on frontend for performance.
- Strict TypeScript used across backend and frontend.

---

## 🗂 Project Structure

```
app/
  chat/
  components/
  lib/
    formatTime.ts
convex/
  schema.ts
  users.ts
  conversations.ts
  messages.ts
  reactions.ts
```

### Separation of Concerns

- UI components separated from logic
- Utility functions isolated in `/lib`
- Convex backend isolated in `/convex`
- Clean mutation/query separation

---

## ⚙️ Local Development Setup

### 1️⃣ Clone Repository

```bash
git clone <your-repo-link>
cd <project-folder>
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
```

---

### 4️⃣ Run Convex Dev

```bash
npx convex dev
```

---

### 5️⃣ Start Next.js Dev Server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 🚀 Production Deployment

### Backend (Convex)

```
npx convex deploy
```

### Frontend (Vercel)

1. Push repository to GitHub
2. Import project in Vercel
3. Add required environment variables
4. Deploy

---

## 📱 Responsiveness

- Desktop → Sidebar + Chat panel
- Mobile → Full-screen chat view
- Tailwind breakpoints used properly
- No overflow or layout shifting issues
- Optimized for various screen sizes

---

## 🔐 Security Considerations

- Authentication required for all actions
- Backend validation via Convex mutations
- Users cannot delete messages they did not send
- Reactions validated server-side
- No direct client database access

---

## 📊 Performance Considerations

- Real-time subscriptions scoped per conversation
- Indexed schema for efficient querying
- Minimal re-renders using optimized React patterns
- Soft delete avoids unnecessary DB operations
- Lazy rendering of message list

---

## 🧪 Testing Checklist (Manual)

- [ ] User authentication works
- [ ] Real-time message sending
- [ ] Typing indicator appears and disappears
- [ ] Online status updates correctly
- [ ] Reactions update in real time
- [ ] Sender-only deletion works
- [ ] Unread badge updates
- [ ] Smart timestamp formatting
- [ ] Responsive layout works on mobile
- [ ] No console errors in production




---

## 📌 What This Project Demonstrates

- Production-level full-stack thinking
- Real-time system implementation
- Clean scalable schema modeling
- Strong TypeScript usage
- Modern frontend architecture
- UX-focused implementation

---

## 👤 Author

Your Name  
Email: prithvi8289@gmail.com 
GitHub: https://github.com/Prithvi0fficial
LinkedIn: www.linkedin.com/in/prithvi-v-


