# NEXUS — Inventory & Order Management System

A full-stack inventory and order management system built with **FastAPI**, **React**, and **PostgreSQL**, fully containerized with **Docker**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11 · FastAPI · SQLAlchemy · Pydantic v2 |
| Frontend | React 18 · React Router v6 · Axios |
| Database | PostgreSQL 16 |
| Container | Docker · Docker Compose |
| Frontend Hosting | Vercel / Netlify |
| Backend Hosting | Render / Railway / Fly.io |

---

## Features

### Product Management
- Create, view, update, delete products
- Unique SKU enforcement
- Stock quantity tracking with low-stock alerts (≤ 5 units)

### Customer Management
- Create, view, delete customers
- Unique email enforcement

### Order Management
- Create multi-item orders with automatic stock deduction
- Inventory validation (cannot order more than available stock)
- Auto-calculated order total
- Cancel orders with automatic stock restoration
- Full order detail view

### Dashboard
- Total products, customers, orders at a glance
- Low stock product alerts

---

## Local Development (Docker Compose)

### Prerequisites
- Docker Desktop (or Docker Engine + Docker Compose)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/inventory-system.git
cd inventory-system

# 2. Copy env template
cp .env.example .env
# Edit .env and set a secure POSTGRES_PASSWORD

# 3. Start all services
docker compose up --build

# 4. Access the app
#    Frontend: http://localhost:3000
#    Backend API: http://localhost:8000
#    API Docs (Swagger): http://localhost:8000/docs
```

### Stopping
```bash
docker compose down          # stop containers
docker compose down -v       # stop + remove volumes (wipes database)
```

---

## API Reference

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Service health check |
| GET | `/dashboard` | Summary stats |

### Products
| Method | Endpoint | Description |
|---|---|---|
| POST | `/products` | Create product |
| GET | `/products` | List all products |
| GET | `/products/{id}` | Get product by ID |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| POST | `/customers` | Create customer |
| GET | `/customers` | List all customers |
| GET | `/customers/{id}` | Get customer by ID |
| DELETE | `/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders` | Create order |
| GET | `/orders` | List all orders |
| GET | `/orders/{id}` | Get order by ID |
| DELETE | `/orders/{id}` | Cancel order (restores stock) |

Interactive API docs available at `/docs` (Swagger UI) when the backend is running.

---

## Business Rules

- **Unique SKU**: No two products can share the same SKU
- **Unique Email**: No two customers can share the same email
- **Non-negative quantities**: Product stock cannot go negative
- **Inventory check**: Orders fail with HTTP 422 if requested quantity exceeds available stock
- **Auto stock deduction**: Stock is reduced atomically when an order is placed
- **Auto total calculation**: `total_amount` is computed server-side (`sum(unit_price × quantity)`)
- **Stock restoration**: Cancelling an order returns stock to inventory

---

## Deployment

### Backend — Render (Free Tier)

1. Push your repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Select your repo, choose **Docker** as runtime
4. Set root directory to `backend/`
5. Set environment variables:
   ```
   DATABASE_URL=postgresql://USER:PASS@HOST:5432/inventory
   ```
6. Add a free PostgreSQL database on Render and link the internal URL
7. Deploy — note your backend URL (e.g. `https://your-app.onrender.com`)

### Backend — Railway

1. New Project → Deploy from GitHub
2. Select repo, set root to `backend/`
3. Add PostgreSQL plugin — Railway auto-injects `DATABASE_URL`
4. Deploy

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Set **Root Directory** to `frontend/`
4. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```
5. Deploy — Vercel builds and serves automatically

### Frontend — Netlify

1. Go to [netlify.com](https://netlify.com) → Add new site
2. Connect GitHub, select repo
3. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
4. Add env var: `REACT_APP_API_URL=https://your-backend-url`

### Docker Hub (Backend Image)

```bash
# Build and tag
docker build -t YOUR_DOCKERHUB_USERNAME/inventory-backend:latest ./backend

# Push
docker login
docker push YOUR_DOCKERHUB_USERNAME/inventory-backend:latest
```

---

## Project Structure

```
inventory-system/
├── backend/
│   ├── main.py            # FastAPI app & route definitions
│   ├── models.py          # SQLAlchemy ORM models
│   ├── schemas.py         # Pydantic request/response schemas
│   ├── crud.py            # Business logic & DB operations
│   ├── database.py        # DB connection & session
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Products.js
│   │   │   ├── Customers.js
│   │   │   └── Orders.js
│   │   ├── services/
│   │   │   └── api.js     # Axios API client
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   ├── nginx.conf
│   ├── Dockerfile
│   ├── package.json
│   └── .dockerignore
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `POSTGRES_USER` | PostgreSQL username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `postgres` |
| `POSTGRES_DB` | Database name | `inventory` |
| `DATABASE_URL` | Full DB connection string | auto-built |
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:8000` |

---

## Submission Checklist

- [ ] GitHub repository link
- [ ] Docker Hub backend image link (`docker.io/USERNAME/inventory-backend`)
- [ ] Live frontend URL (Vercel/Netlify)
- [ ] Live backend API URL (Render/Railway/Fly.io)
