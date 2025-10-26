# Country Currency & Exchange API

A RESTful API that fetches country data from external APIs, stores it in a PostgreSQL database using Sequelize ORM, and provides CRUD operations with exchange rate calculations and GDP estimations.

## 🚀 Features

- Fetch and cache country data from REST Countries API
- Fetch real-time exchange rates from Open Exchange Rates API
- Compute estimated GDP based on population and exchange rates
- Full CRUD operations for country data
- Filter countries by region and currency
- Sort countries by GDP
- Generate visual summary images with statistics
- **Sequelize ORM** for database operations
- **PostgreSQL** database persistence
- **Swagger/OpenAPI** documentation
- Comprehensive error handling
- ES6 Modules architecture

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** (comes with Node.js)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd stage-2-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
DB_NAME=country_currency_db
DB_PORT=5432

# API Configuration
COUNTRIES_API_URL=https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies
EXCHANGE_RATE_API_URL=https://open.er-api.com/v6/latest/USD
API_TIMEOUT=30000
```

### 4. Setup Database

Run the database setup script to synchronize Sequelize models with PostgreSQL:

```bash
npm run setup-db
```

This will:
- Connect to your PostgreSQL database
- Create the `countries` table with all required fields using Sequelize
- Create the `metadata` table for tracking refresh timestamps
- Set up necessary indexes for optimal query performance
- Initialize metadata records

**Note for AWS RDS:** The script automatically handles SSL connections for AWS RDS PostgreSQL instances.

### 5. Start the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## 📚 API Documentation

Once the server is running, you can access the interactive **Swagger API documentation** at:

**http://localhost:3000/api-docs**

The Swagger UI provides:
- Complete API endpoint documentation
- Request/response schemas
- Try-it-out functionality for testing endpoints
- Example requests and responses

## 📡 API Endpoints

### Health Check
```http
GET /
```
Returns API information and available endpoints.

**Response:**
```json
{
  "message": "Country Currency Exchange API",
  "version": "1.0.0",
  "documentation": "/api-docs",
  "endpoints": {
    "refresh": "POST /countries/refresh",
    "countries": "GET /countries",
    "country": "GET /countries/:name",
    "delete": "DELETE /countries/:name",
    "status": "GET /status",
    "image": "GET /countries/image"
  }
}
```

### Refresh Country Data
```http
POST /countries/refresh
```
Fetches latest country data and exchange rates from external APIs, computes GDP, and stores in database. Also generates a summary image.

**Response:**
```json
{
  "message": "Countries data refreshed successfully",
  "processed": 250,
  "total": 250
}
```

### Get All Countries
```http
GET /countries
```

**Query Parameters:**
- `region` - Filter by region (e.g., `?region=Africa`)
- `currency` - Filter by currency code (e.g., `?currency=NGN`)
- `sort` - Sort results (e.g., `?sort=gdp_desc`)

**Example:**
```http
GET /countries?region=Africa&sort=gdp_desc
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 25767448125.2,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-10-22T18:00:00Z"
  }
]
```

### Get Single Country
```http
GET /countries/:name
```

**Example:**
```http
GET /countries/Nigeria
```

**Response:**
```json
{
  "id": 1,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139589,
  "currency_code": "NGN",
  "exchange_rate": 1600.23,
  "estimated_gdp": 25767448125.2,
  "flag_url": "https://flagcdn.com/ng.svg",
  "last_refreshed_at": "2025-10-22T18:00:00Z"
}
```

### Delete Country
```http
DELETE /countries/:name
```

**Example:**
```http
DELETE /countries/Nigeria
```

**Response:**
```json
{
  "message": "Country deleted successfully",
  "name": "Nigeria"
}
```

### Get Status
```http
GET /status
```

**Response:**
```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-22T18:00:00Z"
}
```

### Get Summary Image
```http
GET /countries/image
```

Returns a PNG image showing:
- Total number of countries
- Top 5 countries by estimated GDP
- Last refresh timestamp

## 🔍 How It Works

### Architecture

The API follows a **modular MVC architecture** with clear separation of concerns:

- **Models** (`models/`): Sequelize ORM models defining database schema
- **Controllers** (`src/controllers/`): Handle HTTP requests and responses
- **Services** (`src/services/`): Business logic and external API integrations
- **Routes** (`src/routes/`): API endpoint definitions
- **Middleware** (`src/middleware/`): Error handling and request processing

### Data Refresh Process

1. **Fetch Countries**: Retrieves country data from REST Countries API
2. **Fetch Exchange Rates**: Gets latest exchange rates from Open Exchange Rates API
3. **Process Each Country**:
   - Extracts first currency code (or null if none)
   - Matches currency with exchange rate
   - Computes estimated GDP: `population × random(1000-2000) ÷ exchange_rate`
   - Handles countries with no currency gracefully
4. **Database Operations** (using Sequelize):
   - Updates existing countries (by name, case-insensitive)
   - Inserts new countries
   - Recalculates GDP with fresh random multiplier
   - Uses `Op.iLike` for case-insensitive matching
5. **Generate Summary Image**: Creates visual representation of top countries

### Sequelize ORM Benefits

- **Type safety** with model definitions
- **Automatic SQL generation** for complex queries
- **Connection pooling** for better performance
- **Built-in validation** for data integrity
- **Case-insensitive queries** using PostgreSQL's ILIKE
- **Easy migrations** and schema management

### Currency Handling

- **Multiple Currencies**: Only the first currency is stored
- **No Currency**: Sets `currency_code`, `exchange_rate` to `null`, and `estimated_gdp` to `0`
- **Currency Not Found**: Sets `exchange_rate` and `estimated_gdp` to `null`

### Error Handling

The API returns consistent JSON error responses:

- **400 Bad Request**: Validation errors
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server-side errors
- **503 Service Unavailable**: External API failures

**Example Error Response:**
```json
{
  "error": "External data source unavailable",
  "details": "Could not fetch data from REST Countries API"
}
```

## 🗂️ Project Structure

```
stage-2-backend/
├── database/
│   └── db.js                     # Sequelize database configuration
├── models/
│   ├── index.js                  # Models loader (Sequelize)
│   ├── Country.js                # Country model definition
│   └── Metadata.js               # Metadata model definition
├── src/
│   ├── controllers/
│   │   ├── countryController.js  # CRUD operations
│   │   └── refreshController.js  # Refresh logic
│   ├── database/
│   │   └── setup.js              # Database initialization
│   ├── middleware/
│   │   └── errorHandler.js       # Error handling
│   ├── routes/
│   │   └── index.js              # API routes
│   ├── services/
│   │   ├── countryService.js     # Database operations (Sequelize)
│   │   ├── externalApiService.js # External API calls
│   │   └── imageService.js       # Image generation (Jimp)
│   ├── swagger.js                # Swagger/OpenAPI documentation
│   └── index.js                  # Application entry point
├── cache/
│   └── summary.png               # Generated summary image
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🧪 Testing the API

### Using cURL

**Refresh data:**
```bash
curl -X POST http://localhost:3000/countries/refresh
```

**Get all countries:**
```bash
curl http://localhost:3000/countries
```

**Filter by region:**
```bash
curl "http://localhost:3000/countries?region=Africa"
```

**Get single country:**
```bash
curl http://localhost:3000/countries/Nigeria
```

**Delete country:**
```bash
curl -X DELETE http://localhost:3000/countries/Nigeria
```

**Get status:**
```bash
curl http://localhost:3000/status
```

### Using PowerShell

You can use the included `test-api.ps1` script:

```powershell
.\test-api.ps1
```

Or test manually:

```powershell
# Refresh countries
Invoke-RestMethod -Uri "http://localhost:3000/countries/refresh" -Method Post | ConvertTo-Json

# Get all countries
Invoke-RestMethod -Uri "http://localhost:3000/countries" | ConvertTo-Json

# Get status
Invoke-RestMethod -Uri "http://localhost:3000/status" | ConvertTo-Json
```

### Using Swagger UI

The easiest way to test is through the interactive Swagger documentation:

1. Start the server
2. Open http://localhost:3000/api-docs in your browser
3. Click on any endpoint to expand it
4. Click "Try it out"
5. Fill in any required parameters
6. Click "Execute"

## 📦 Dependencies

### Core Dependencies
- **express** - Fast, unopinionated web framework
- **sequelize** - Promise-based ORM for PostgreSQL
- **pg** - PostgreSQL client for Node.js
- **pg-hstore** - Serialize and deserialize JSON data to hstore format
- **axios** - Promise-based HTTP client for external APIs
- **dotenv** - Load environment variables from .env file
- **jimp** - Image processing library for generating summary images
- **swagger-ui-express** - Serve Swagger UI for API documentation
- **swagger-jsdoc** - Generate Swagger spec from JSDoc comments

### Why Sequelize?
- **ORM Benefits**: Write JavaScript instead of SQL
- **Database Agnostic**: Easy to switch between PostgreSQL, MySQL, SQLite
- **Validation**: Built-in data validation
- **Relationships**: Easy to define model associations
- **Migrations**: Version control for database schema
- **Connection Pooling**: Automatic connection management

## 🚢 Deployment

### Prepare for Deployment

1. Ensure all environment variables are set on your hosting platform
2. Run database setup on production database
3. Test all endpoints thoroughly

### Recommended Hosting Platforms

- **Railway** - Easy Node.js and PostgreSQL deployment with automatic SSL
- **Heroku** - With Heroku Postgres add-on
- **AWS Elastic Beanstalk** - With AWS RDS PostgreSQL (already configured)
- **AWS EC2** - Full control with RDS for PostgreSQL
- **DigitalOcean App Platform** - With managed PostgreSQL database
- **Render** - Free PostgreSQL database included
- **Vercel/Netlify** - Not recommended (Vercel is forbidden for this cohort)

### AWS RDS PostgreSQL Setup

This project is already configured for AWS RDS PostgreSQL:

1. Create an RDS PostgreSQL instance in AWS
2. Configure security groups to allow your IP
3. Set environment variables:
   ```env
   DB_HOST=your-rds-endpoint.amazonaws.com
   DB_USER=postgres
   DB_PASSWORD=your-password
   DB_NAME=your-database-name
   DB_PORT=5432
   NODE_ENV=production
   ```
4. The app automatically enables SSL for RDS connections

### Environment Variables for Production

Make sure to set these on your hosting platform:
- `PORT`
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_PORT`
- `NODE_ENV=production`

## 🐛 Troubleshooting

### Database Connection Issues

```
Error: no pg_hba.conf entry for host
```
**Solution**: 
- Check your PostgreSQL credentials in `.env` file
- For AWS RDS, ensure SSL is enabled (already configured)
- Check security groups allow your IP address

```
Error: database "..." does not exist
```
**Solution**: Run `npm run setup-db` to create database schema

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Change the PORT in `.env` or kill the process using that port:
```powershell
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### Jimp/Image Generation Issues

If you encounter issues with image generation:
- The app will continue to work; only the `/countries/image` endpoint will be affected
- Check that the `cache` directory has write permissions
- Jimp is a pure JavaScript library and should work on all platforms

### Sequelize Migration Issues

```
Error: Relation "countries" does not exist
```
**Solution**: Run `npm run setup-db` to sync models with database

### External API Timeout

```
503 Service Unavailable - External data source unavailable
```
**Solution**: Check your internet connection or increase `API_TIMEOUT` in `.env`

## 🎯 Key Features Explained

### ES6 Modules
The project uses ES6 `import/export` syntax instead of CommonJS `require()`. Make sure `"type": "module"` is in `package.json`.

### Sequelize ORM
All database operations use Sequelize models instead of raw SQL:
- `Country.findAll()` instead of `SELECT * FROM countries`
- `Country.create()` instead of `INSERT INTO`
- `Op.iLike` for case-insensitive searches (PostgreSQL specific)

### Swagger Documentation
Interactive API documentation is auto-generated from `src/swagger.js`. Access it at `/api-docs` when the server is running.

## 📝 License

MIT

## 👤 Author

HNG Stage 2 Task

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Note**: This API is designed for educational purposes as part of the HNG Internship program.