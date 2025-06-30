# 🥗 Bella Bona Bot

An automated bot for ordering vegetarian and vegan meals from Bella Bona. Built with TypeScript, Puppeteer, and Express.js.

## 🚀 Features

- **Automated Login**: Securely logs into Bella Bona using environment variables
- **Vegetarian/Vegan Detection**: Finds all vegetarian and vegan options on the menu
- **Auto-Booking**: Automatically books vegan bowls
- **Order Management**: Check order status and cancel orders
- **REST API**: Full API endpoints for all functionality
- **Cloud Ready**: Deploy to DigitalOcean, Heroku, or any cloud platform

## 📋 API Endpoints

| Method | Endpoint                  | Description                      |
| ------ | ------------------------- | -------------------------------- |
| GET    | `/api/health`             | Health check                     |
| GET    | `/api/vegetarian-options` | Get all vegetarian/vegan items   |
| POST   | `/api/book-vegan-bowl`    | Book vegan bowl items            |
| POST   | `/api/cancel-booking`     | Cancel current order             |
| GET    | `/api/order-status`       | Check if there's an active order |

## 🛠️ Local Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/bella-bona-bot.git
cd bella-bona-bot
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with your credentials:

```env
BELLA_BONA_USERNAME=your_email@example.com
BELLA_BONA_PASSWORD=your_password
```

4. Run the API:

```bash
npm run api
```

The API will be available at `http://localhost:3000`

## 🌐 Usage Examples

### Get Vegetarian Options

```bash
curl http://localhost:3000/api/vegetarian-options
```

### Book Vegan Bowl

```bash
curl -X POST http://localhost:3000/api/book-vegan-bowl
```

### Check Order Status

```bash
curl http://localhost:3000/api/order-status
```

### Cancel Order

```bash
curl -X POST http://localhost:3000/api/cancel-booking
```

## 🚀 Deployment to DigitalOcean

### Option 1: App Platform (Recommended)

1. **Push to GitHub**: Make sure your code is in a GitHub repository
2. **Create App**: Go to DigitalOcean App Platform
3. **Connect Repository**: Link your GitHub repo
4. **Configure Environment**:
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - Environment Variables:
     - `BELLA_BONA_USERNAME`: Your Bella Bona email
     - `BELLA_BONA_PASSWORD`: Your Bella Bona password
     - `PORT`: `8080`

### Option 2: Droplet VPS

1. **Create Droplet**: Ubuntu 22.04 with Node.js
2. **Clone Repository**: `git clone your-repo-url`
3. **Install Dependencies**: `npm install`
4. **Set Environment Variables**: Add to `/etc/environment`
5. **Use PM2**: `pm2 start dist/api.js --name bella-bot`
6. **Set up Nginx**: Reverse proxy to port 3000

## 🔧 Environment Variables

| Variable              | Description              | Required |
| --------------------- | ------------------------ | -------- |
| `BELLA_BONA_USERNAME` | Your Bella Bona email    | Yes      |
| `BELLA_BONA_PASSWORD` | Your Bella Bona password | Yes      |
| `PORT`                | API port (default: 3000) | No       |

## 📁 Project Structure

```
├── api.ts              # Main API server
├── login.ts            # Authentication logic
├── getVegetarian.ts    # Vegetarian item extraction
├── bella.ts            # Main bot logic
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── .env                # Environment variables (not in repo)
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## 🔒 Security

- Credentials are stored as environment variables
- `.env` file is excluded from Git
- API uses Helmet for security headers
- CORS is configured for web access

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

ISC License

## ⚠️ Disclaimer

This bot is for educational purposes. Please respect Bella Bona's terms of service and use responsibly.
