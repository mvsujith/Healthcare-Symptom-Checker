# AI Doctor Backend API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Add your OpenRouter API key to `.env`

4. Start the server:
```bash
npm run dev    # Development with nodemon
npm start      # Production
```

## API Endpoints

### Symptom Analysis
- **POST** `/api/v1/symptom/analyze` - Analyze patient symptoms
- **POST** `/api/v1/symptom/chat` - General medical chat
- **GET** `/api/v1/symptom/status` - Check API status

### Health Check
- **GET** `/health` - Server health status

## Environment Variables

See `.env.example` for all configuration options.
