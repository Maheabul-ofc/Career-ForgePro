# CareerForge Pro - Local Development Setup

## Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)
- **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)
- **Stripe Account** - [Sign up](https://stripe.com) (for subscription features)

---

## 1. Clone the Repository

```bash
git clone <your-repo-url>
cd careerforge-pro
```

## 2. Frontend Setup

Install frontend dependencies from the project root:

```bash
npm install
```

## 3. Backend Setup

Navigate to the `server/` directory and install backend dependencies:

```bash
cd server
npm install
```

### Configure Environment Variables

Create a `.env` file inside the `server/` directory:


Edit `server/.env` with your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/careerforge
JWT_SECRET=your_secure_random_secret_here
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PRO_PRICE_ID=price_your-stripe-price-id
FRONTEND_URL=http://localhost:5173
```

> **Tip:** Generate a secure JWT secret with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Stripe Setup

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Create a product called "CareerForge Pro" with a recurring price of $12/month
3. Copy the **Price ID** (starts with `price_`) and add it to `STRIPE_PRO_PRICE_ID` in your `.env`

## 4. Start MongoDB

Make sure MongoDB is running locally:

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Windows
net start MongoDB
```

## 5. Run the Application

### Option A: Run frontend and backend separately

**Terminal 1 — Backend:**

```bash
cd server
npm run dev
```

Backend runs at: `http://localhost:5000`

**Terminal 2 — Frontend:**

```bash
# From project root
npm run dev
```

Frontend runs at: `http://localhost:5173`

### Option B: Use a process manager (optional)

Install `concurrently` globally:

```bash
npm install -g concurrently
```

Then from the project root:

```bash
concurrently "cd server && npm run dev" "npm run dev"
```

---

## Project Structure

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
├── server/               # Express.js backend
│   ├── config/           # Database config
│   ├── middleware/        # Auth & upload middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   │   ├── auth.js       # Register & login
│   │   ├── resume.js     # File upload & history
│   │   ├── analyze.js    # Basic keyword analysis
│   │   ├── ai-rewrite.js # AI-powered resume optimization
│   │   ├── stripe.js     # Subscription & checkout
│   │   └── pdf.js        # Puppeteer PDF generation
│   ├── utils/            # Helper utilities
│   │   ├── keywordMatcher.js  # Keyword extraction & matching
│   │   ├── aiRewriter.js      # OpenAI resume rewriting
│   │   └── extractText.js     # PDF/DOCX text extraction
│   └── index.js          # Server entry point
├── tailwind.config.js    # Tailwind configuration
├── vite.config.js        # Vite configuration
└── package.json          # Frontend dependencies
```

## API Endpoints

| Method | Endpoint                      | Description                         | Auth Required |
| ------ | ----------------------------- | ----------------------------------- | ------------- |
| POST   | `/api/auth/register`          | Register new user                   | No            |
| POST   | `/api/auth/login`             | Login user                          | No            |
| GET    | `/api/auth/me`                | Get current user info               | Yes           |
| POST   | `/api/resume/upload`          | Upload resume (PDF/DOCX)            | Yes           |
| GET    | `/api/resume/history`         | Get all saved analyses              | Yes           |
| GET    | `/api/resume/:id`             | Get single analysis detail          | Yes           |
| POST   | `/api/analyze`                | Basic keyword analysis              | Yes           |
| POST   | `/api/ai-rewrite`             | AI-powered resume rewriting         | Yes           |
| POST   | `/api/stripe/create-checkout` | Create Stripe checkout session      | Yes           |
| GET    | `/api/stripe/check-subscription` | Check subscription status        | Yes           |
| POST   | `/api/stripe/customer-portal` | Open Stripe customer portal         | Yes           |
| POST   | `/api/pdf/generate`           | Generate PDF from resume content    | Yes           |

## Features

### 🔍 JD Analysis Agent
Extracts and ranks keywords from job descriptions using frequency analysis and tech pattern matching.

### 🤖 AI Resume Rewriting
Uses OpenAI (GPT-4o-mini by default) to rewrite resume bullet points, naturally incorporating missing keywords while keeping experiences truthful.

### 💳 Stripe Subscriptions
- **Free tier**: 1 resume analysis
- **Pro tier ($12/mo)**: Unlimited analyses, AI rewriting, PDF export

### 📄 Puppeteer PDF Generation
Renders optimized resume content into a pixel-perfect, professionally formatted PDF using headless Chrome.

## Troubleshooting

- **MongoDB connection error:** Ensure MongoDB is running on `localhost:27017`
- **Port conflict:** Change `PORT` in `server/.env` or Vite port in `vite.config.js`
- **CORS issues:** The backend uses `cors()` middleware — ensure frontend points to the correct backend URL in `src/api/index.js`
- **OpenAI API error:** Check your `OPENAI_API_KEY` is valid and has credits
- **Stripe error:** Ensure `STRIPE_SECRET_KEY` and `STRIPE_PRO_PRICE_ID` are set correctly
