# Deploying ServeEase Backend to Render

This guide outlines how to deploy the ServeEase backend (`server/`) as a high-performance Web Service on [Render](https://render.com), and connect it with your Vercel frontend.

---

## 1. Quick One-Click Blueprint Setup (Recommended)

Because we added [`render.yaml`](file:///s:/traning%20project/render.yaml) to your repository, you can deploy in one click:

1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository: `https://github.com/saimohith-rsm/SERVICE-PROVIDER`.
4. Render will read `render.yaml` and configure:
   - **Service Name:** `serveease-backend`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Health Check Path:** `/api/health`
5. Click **Apply**.

---

## 2. Manual Web Service Setup (Alternative)

If you prefer setting it up manually without Blueprint:

1. In Render Dashboard, click **New +** -> **Web Service**.
2. Select your repository: `saimohith-rsm/SERVICE-PROVIDER`.
3. Fill in the following settings:
   | Setting | Value |
   |---|---|
   | **Name** | `serveease-backend` (or your choice) |
   | **Region** | Oregon (US West) or Singapore |
   | **Branch** | `main` |
   | **Root Directory** | `server` *(Important!)* |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node server.js` |
   | **Instance Type** | Free |

4. Under **Advanced** -> **Health Check Path**, enter:
   `/api/health`

---

## 3. Environment Variables on Render

In the **Environment Variables** tab of your Render service, add the following variables:

| Variable Name | Example / Recommended Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production mode & caching |
| `MONGO_URI` | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/serveease?retryWrites=true&w=majority` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | *(Generate any 32+ character random string)* | Used to sign auth tokens |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `CLIENT_URL` | `https://client-opal-nine-29.vercel.app` | Allows CORS requests from Vercel |

> [!NOTE]
> Render provides an automatic `PORT` environment variable (typically 10000). The server code automatically reads `process.env.PORT` and binds to `0.0.0.0`.

---

## 4. Connecting Vercel Frontend to Render Backend

Once Render finishes deploying, Render will give you a public URL (e.g., `https://serveease-backend.onrender.com`).

To link your frontend:
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click on your `client` project.
3. Go to **Settings** -> **Environment Variables**.
4. Add a new variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://serveease-backend.onrender.com/api` (replace with your actual Render URL)
5. Go to **Deployments**, click the `...` menu on your latest deployment, and click **Redeploy**.

Now, all authentication, registration, bookings, services, and profile API calls made by the Vercel frontend will directly connect to your dedicated Render backend!
