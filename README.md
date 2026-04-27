# CS46X-UniFreelancer
Team 37 for the OSU 2025 Capstone Project **UniFreelancer Academy** <br />

UniFreelancer Academy is a collaborative learning platform that empowers freelancers and students to upskill through peer-led micro-courses, real-world projects, and mentorship.  
UniFreelancer Academy connects aspiring professionals with mentors and micro-learning experiences designed around practical freelancing skills.  

**Live Site:** [https://unifreelancer-1.onrender.com](https://unifreelancer-1.onrender.com)

This repository hosts the codebase, documentation, and project management rails for our capstone development.

---

### Team Roster
Aidan Caughey  | Testing Manager | caugheya@oregonstate.edu <br />
Aiden McCoy    | Backend Development | mccoaide@oregonstate.edu <br />
Baron Baker    | Database Manager | bakerbar@oregonstate.edu <br />
Daniel Molina  | Frontend Development | molindan@oregonstate.edu <br />
Nafizur Rahman | Frontend Development | rahmanna@oregonstate.edu <br />

---

## Development Workflow
We follow a structured Git workflow to ensure code quality and collaboration efficiency:
- All new work is done in a feature branch.
- Changes are submitted via Pull Request (PR).
- Each PR requires at least one code review before merging.
- After approval, the PR can be merged into the main branch.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Create React App) |
| Backend | Node.js / Express |
| Database | MongoDB Atlas |
| Authentication | JWT |
| Payments | Stripe |
| Media Storage | Cloudinary |
| Video Meetings | Zoom Meeting SDK |
| AI / LLM | Ollama |
| Hosting | Render |

---

## Configuration

The following environment variables are required to run the application. They must be set in a `.env` file inside the `server/` directory for local work, or configured as environment variables in your Render dashboard for production.

### Server Environment Variables (`server/.env`)

```env
# Server
PORT=5000

# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret

# Frontend
FRONTEND_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:5000

# Cloudinary (media uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe (payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Zoom Meeting SDK
ZOOM_MEETING_SDK_KEY=your_zoom_sdk_key
ZOOM_MEETING_SDK_SECRET=your_zoom_sdk_secret

# AI / LLM (Ollama via Render or remote host)
AI_PROVIDER=ollama
REMOTE_LLM_URL=your_remote_ollama_url
REMOTE_LLM_SECRET=your_remote_llm_secret
```

Never commit `.env` files to version control. Use gitignore. See [CONTRIBUTING.md](./CONTRIBUTING.md) for security guidelines.

---

## Third-Party Service Setup

### MongoDB Atlas
1. Create a free account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new cluster.
3. Under **Database Access**, create a database user with read/write permissions.
4. Under **Network Access**, add your IP address, or `0.0.0.0/0` (allow all).
5. Click **Connect**, then **Connect your application**, and copy the connection string.
6. Replace `<password>` in the connection string with your database user's password and set it as `MONGO_URI`.

### Stripe
1. Create an account at [https://stripe.com](https://stripe.com).
2. From the Stripe Dashboard, go to **Developers**, then **API Keys**.
3. Copy the **Secret key** into `STRIPE_SECRET_KEY`.
4. Copy the **Publishable key** into `REACT_APP_STRIPE_PUBLISHABLE_KEY`.
5. For webhooks, go to **Developers**, then **Webhooks**, then **Add endpoint**.
   - Set the endpoint URL to `https://your-backend-url/api/webhook`.
   - Select events to listen for (`checkout.session.completed`, `invoice.paid`).
   - Copy the **Signing secret** into `STRIPE_WEBHOOK_SECRET`.
6. To test webhooks locally, install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:
   ```bash
   stripe listen --forward-to localhost:5000/api/webhook
   ```

### Cloudinary
1. Create a free account at [https://cloudinary.com](https://cloudinary.com).
2. From your dashboard, copy:
   - **Cloud Name** into `CLOUDINARY_CLOUD_NAME`
   - **API Key** into `CLOUDINARY_API_KEY`
   - **API Secret** into `CLOUDINARY_API_SECRET`

### Zoom Meeting SDK
1. Create a developer account at [https://marketplace.zoom.us](https://marketplace.zoom.us).
2. Click **Develop**, then **Build App**, and choose **Meeting SDK** as the app type.
3. After creating the app, copy:
   - **SDK Key** into `ZOOM_MEETING_SDK_KEY`
   - **SDK Secret** into `ZOOM_MEETING_SDK_SECRET`
4. Add your frontend origin (`http://localhost:3000`) to the app's allowed origins.

### Ollama (AI / LLM)
UniFreelancer Academy uses Ollama to power AI-assisted features. In production, Ollama runs on a remote server reached via `REMOTE_LLM_URL`.

**Running Ollama locally:**
1. Install Ollama from [https://ollama.com](https://ollama.com).
2. Pull a model:
   ```bash
   ollama pull llama3
   ```
3. Start the Ollama server (runs on port 11434 by default):
   ```bash
   ollama serve
   ```
4. Set your local env variables:
   ```env
   AI_PROVIDER=ollama
   REMOTE_LLM_URL=http://localhost:11434
   REMOTE_LLM_SECRET=
   ```

**For production (Render or VPS):**
- Deploy Ollama on a separate Render service or VPS.
- Set `REMOTE_LLM_URL` to the public URL of that service.
- Set `REMOTE_LLM_SECRET` to a shared secret used to authenticate requests between the backend and the LLM service.

### Render (Hosting)
The application is hosted on [Render](https://render.com). The backend and frontend are deployed as separate Render services.

**Backend (Web Service):**
1. Connect your GitHub repository to Render.
2. Set the **Root Directory** to `server`.
3. Set **Build Command** to `npm install && npm run build`.
4. Set **Start Command** to `npm start`.
5. Add all server environment variables under the **Environment** tab in the Render dashboard.

**Frontend (Static Site):**
1. Add a new **Static Site** on Render.
2. Set the **Root Directory** to `client`.
3. Set **Build Command** to `npm install && npm run build`.
4. Set **Publish Directory** to `build`.
5. Add `REACT_APP_API_URL` and `REACT_APP_STRIPE_PUBLISHABLE_KEY` as environment variables.

After deploying the backend, update `FRONTEND_URL` on the backend service and `REACT_APP_API_URL` on the frontend service to use the live Render URLs.

---

## Local Development Setup

**Prerequisites:**
- Node.js (v18 or higher)
- npm or yarn
- Git
- MongoDB Atlas account or a local MongoDB instance
- Accounts for Stripe, Cloudinary, and Zoom (see above)

**1. Clone the repository:**
```bash
git clone https://github.com/UniFreelancerAcademy/UniFreelancer.git
cd UniFreelancer
```

**2. Install dependencies for both server and client:**
```bash
cd server && npm install
cd ../client && npm install
```

**3. Create environment files:**

Create `server/.env` and `client/.env` using the variable lists in the [Configuration](#configuration) section above.

**4. Start the backend (Terminal 1):**
```bash
cd server
npm run build
npm start
```

**5. Start the frontend (Terminal 2):**
```bash
cd client
npm start
```

**6. Verify Installation:**

Visit [http://localhost:3000](http://localhost:3000) to confirm the frontend loads and connects to the backend.
