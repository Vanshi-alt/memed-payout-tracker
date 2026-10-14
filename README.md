# Meme’d — Campaign Payout Tracker

A full-stack campaign management platform that connects brands and creators, tracks campaign submissions, and calculates creator payouts based on view milestones.

## Overview

Meme’d helps brands create and manage promotional campaigns while allowing creators to discover campaigns, submit social media posts, and track their earnings through a centralized dashboard.

The platform simulates view updates and calculates payouts according to predefined campaign milestones and available budgets.

## Features

### Authentication & User Roles
- User signup and login
- Separate **Brand** and **Creator** roles
- JWT-based authentication
- Password hashing with bcrypt

### Brand Dashboard
- Create campaigns for Instagram and YouTube
- Set campaign budgets
- Configure view-based payout milestones
- View campaign performance and spending
- Track remaining campaign budgets

### Creator Dashboard
- Browse live campaigns
- View campaign budgets and payout milestones
- Submit social media post URLs
- Track post views and earnings
- Update simulated view counts and see payout calculations

### Payout Engine
- Calculates payouts using configured view milestones
- Tracks cumulative creator earnings
- Prevents payouts from exceeding the campaign's remaining budget
- Updates campaign spending as payouts are allocated

> **Note:** View counts are simulated for demonstration purposes. The application does not independently verify views through Instagram or YouTube APIs, and payout calculations do not represent actual money transfers.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcryptjs |
| API Communication | REST APIs |
| Deployment | Vercel (frontend), Render (backend) |

## Project Structure

```text
memed-payout-tracker/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   └── lib/
│   └── package.json
├── .gitignore
└── README.md
```

*The structure above summarizes the main areas of the project; individual files may vary.*

## Getting Started

### Prerequisites

- Node.js and npm
- A MongoDB Atlas cluster or compatible MongoDB instance
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Vanshi-alt/memed-payout-tracker.git
cd memed-payout-tracker
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret
```

Use the exact environment variable names expected by your backend configuration. Never commit real credentials or secrets.

### 3. Start the backend

For development:

```bash
npm run dev
```

To build and run the compiled application:

```bash
npm run build
npm start
```

The backend is expected to run at `http://localhost:4000`, with API routes under `/api`.

### 4. Configure the frontend

Open a separate terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 5. Start the frontend

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## API Endpoints

The backend exposes the following main endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| POST | `/api/campaigns` | Create a campaign (Brand) |
| GET | `/api/campaigns/mine` | Retrieve the brand's campaigns |
| GET | `/api/campaigns/live` | Browse live campaigns |
| POST | `/api/submissions` | Submit a creator post |
| PATCH | `/api/submissions/:id/views` | Update simulated views and payout |
| GET | `/api/submissions/mine` | Retrieve creator submissions and earnings |

Protected endpoints require a valid JWT in the `Authorization` header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## Payout Calculation

Each campaign defines milestones containing a view threshold and payout amount.

For example:

| Views reached | Target payout |
|---:|---:|
| 1,000 | ₹100 |
| 5,000 | ₹500 |
| 10,000 | ₹1,000 |

When a creator's simulated views increase, the application calculates the applicable target payout and allocates the additional amount, subject to the campaign's remaining budget.

Campaign spending and creator earnings are updated accordingly. Actual payouts depend on the application's simulated accounting logic; no payment gateway or real-money transfer is implied.

## Deployment

### Frontend — Vercel
1. Import the GitHub repository into Vercel.
2. Set the project root directory to `frontend`.
3. Add `NEXT_PUBLIC_API_URL` using the deployed backend URL, ending in `/api`.
4. Deploy the application.

### Backend — Render
1. Create a Web Service connected to the GitHub repository.
2. Set the root directory to `backend`.
3. Set the build command to `npm install && npm run build`.
4. Set the start command to `npm start`.
5. Configure `MONGODB_URI`, `JWT_SECRET`, and any other required environment variables.
6. Ensure MongoDB Atlas network access permits connections from the backend host.

**Deployment status:** Add the live frontend and backend URLs here once both deployments are working.

- Frontend: `https://memed-payout-tracker-delta.vercel.app/`
- Backend: `https://memed-payout-tracker-lqp0.onrender.com`

## Security Considerations

- Keep `.env` and `.env.local` out of version control.
- Use strong secrets and securely managed database credentials.
- Restrict database network access where possible.
- Validate user input and enforce role-based authorization on protected endpoints.
- Treat simulated views as demo data, not verified social platform metrics.

## Future Improvements

- Integrate official social platform APIs where access permits
- Automate and verify view tracking
- Add a payment gateway and payout history
- Add campaign analytics and performance charts
- Improve automated test coverage
- Add notifications for submissions and payout milestones

## Author

**Vanshika Sharma**

Full-Stack Development | React | Next.js | Node.js | Express.js | MongoDB

GitHub: [Vanshi-alt](https://github.com/Vanshi-alt)

---

Built as a full-stack demonstration of campaign management, role-based workflows, and milestone-driven payout tracking.
