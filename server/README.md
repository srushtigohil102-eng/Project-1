# HRMS Backend Server

This is the backend server for the HRMS (Human Resource Management System) application.

## Setup

### Prerequisites
- Node.js 20+
- npm

### Installation

```bash
cd server
npm ci
```

### Development

To start the development server:

```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Build

To compile TypeScript:

```bash
npm run build
```

### Linting

To run ESLint:

```bash
npm run lint
```

### Testing

To run tests:

```bash
npm test
```

### Production

To start the production server:

```bash
npm start
```

## Project Structure

```
server/
├── src/
│   ├── index.ts          # Entry point
│   └── __tests__/        # Test files
├── dist/                 # Compiled output (generated)
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── jest.config.js
└── README.md
```

## Environment Variables

Create a `.env` file in the server directory:

```
PORT=5000
NODE_ENV=development
```

See `.env.example` for all available options.