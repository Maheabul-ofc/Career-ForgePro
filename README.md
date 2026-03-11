# CareerForge Pro - Local Development Setup

## Prerequisites

Make sure the following are installed:

* **Node.js** (v18 or higher)
* **MongoDB** (v6 or higher)
* **Git**
* **OpenAI API Key**
* **Stripe Account** (for subscription features)

---

# 1. Clone the Repository

```bash
git clone <your-repo-url>
cd careerforge-pro
```

---

# 2. Frontend Setup

Install frontend dependencies from the project root:

```bash
npm install
```

---

# 3. Backend Setup

Navigate to the server directory and install backend dependencies:

```bash
cd server
npm install
```

### Configure Environment Variables

Create a `.env` file inside the `server/` directory.

```
server/.env
```

Add the following variables:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/careerforge
JWT_SECRET=your_secure_random_secret_here
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PRO_PRICE_ID=price_your-stripe-price-id
FRONTEND_URL=http://localhost:5173
VITE_API_URL=https://career-forgepro.onrender.com
```

### Generate Secure JWT Secret

Run this command:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

# Stripe Setup

1. Go to **Stripe Dashboard → Products**
2. Create a product named **CareerForge Pro**
3. Add a recurring price of **$12/month**
4. Copy the **Price ID** (starts with `price_`)
5. Add it to `.env`

```
STRIPE_PRO_PRICE_ID=price_your-stripe-price-id
```

---

# 4. Start MongoDB

Ensure MongoDB is running locally.

### macOS (Homebrew)

```bash
brew services start mongodb-community
```

### Ubuntu / Debian

```bash
sudo systemctl start mongod
```

### Windows

```bash
net start MongoDB
```

---

# 5. Run the Application

## Option A: Run frontend and backend separately

### Terminal 1 — Backend

```bash
cd server
npm run dev
```

Backend runs at:

```
http://localhost:5000
```

### Terminal 2 — Frontend

From the project root:

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## Option B: Run both together (optional)

Install concurrently:

```bash
npm install -g concurrently
```

Run both services:

```bash
concurrently "cd server && npm run dev" "npm run dev"
```

---

# Project Structure

```
careerforge-pro/
├── public/               # Static assets
├── src/                  # React frontend (Vite + Tailwind)
│   ├── api/              # Axios API client
│   ├── components/       # Reusable UI components
│   ├── context/          # React context (Auth)
│   ├── pages/            # Page components
│   ├── index.css         # Tailwind styles
│   └── main.jsx          # App entry point
│
├── server/               # Express.js backend
│   ├── config/           # Database config
│   ├── middleware/       # Auth & upload middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   │   ├── auth.js       # Register & login
│   │   ├── resume.js     # File upload & history
│   │   ├── analyze.js    # Basic keyword analysis
│   │   ├── ai-rewrite.js # AI-powered resume optimization
│   │   ├── stripe.js     # Subscription & checkout
│   │   └── pdf.js        # Puppeteer PDF generation
│   │
│   ├── utils/            # Helper utilities
│   │   ├── keywordMatcher.js  # Keyword extraction & matching
│   │   ├── aiRewriter.js      # OpenAI resume rewriting
│   │   └── extractText.js     # PDF/DOCX text extraction
│   │
│   └── index.js          # Server entry point
│
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

# API Endpoints

| Method | Endpoint                       | Description                      | Auth Required |
| ------ | ------------------------------ | -------------------------------- | ------------- |
| POST   | /api/auth/register             | Register new user                | No            |
| POST   | /api/auth/login                | Login user                       | No            |
| GET    | /api/auth/me                   | Get current user info            | Yes           |
| POST   | /api/resume/upload             | Upload resume (PDF/DOCX)         | Yes           |
| GET    | /api/resume/history            | Get all saved analyses           | Yes           |
| GET    | /api/resume/:id                | Get single analysis detail       | Yes           |
| POST   | /api/analyze                   | Basic keyword analysis           | Yes           |
| POST   | /api/ai-rewrite                | AI-powered resume rewriting      | Yes           |
| POST   | /api/stripe/create-checkout    | Create Stripe checkout session   | Yes           |
| GET    | /api/stripe/check-subscription | Check subscription status        | Yes           |
| POST   | /api/stripe/customer-portal    | Open Stripe customer portal      | Yes           |
| POST   | /api/pdf/generate              | Generate PDF from resume content | Yes           |

---

# Features

## JD Analysis Agent

Extracts and ranks keywords from job descriptions using frequency analysis and tech pattern matching.

---

## AI Resume Rewriting

Uses OpenAI (GPT-4o-mini by default) to rewrite resume bullet points and naturally incorporate missing keywords while keeping experiences truthful.

---

## Stripe Subscriptions

Free Tier:

* 1 resume analysis

Pro Tier ($12/month):

* Unlimited analyses
* AI rewriting
* PDF export

---

## Puppeteer PDF Generation

Renders optimized resume content into a professionally formatted PDF using headless Chrome.

---

# Troubleshooting

### MongoDB connection error

Ensure MongoDB is running:

```
localhost:27017
```

---

### Port conflict

Change:

```
PORT in server/.env
```

or

```
Vite port in vite.config.js
```

---

### CORS issues

Ensure the frontend points to the correct backend URL in:

```
src/api/index.js
```

---

### OpenAI API error

Check that your `OPENAI_API_KEY`:

* is valid
* has available credits

---

### Stripe error

Ensure the following variables are correct:

```
STRIPE_SECRET_KEY
STRIPE_PRO_PRICE_ID
```
