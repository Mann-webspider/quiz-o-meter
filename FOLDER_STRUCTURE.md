# Quiz-o-Meter Project Structure

This document describes the folder organization of the Quiz-o-Meter project.

## Project Overview
Quiz-o-Meter is a full-stack Node.js application for managing and conducting quizzes in real-time. It consists of three main services: a backend API, a socket server for real-time communication, and a React frontend, all orchestrated with Docker.

## Directory Structure

### Root Level Files
- **docker-compose.yml** - Docker Compose configuration for orchestrating all services (backend, socket server, frontend, and MongoDB)
- **README.md** - Project documentation
- **PROJECT_ANALYSIS_REPORT.md** - Analysis report of the project architecture

---

## Backend Service (`/backend_2`)
The main REST API server and business logic layer.

### Main Files
- **index.js** - Main entry point for the backend service
- **init.js** - Initialization module for setting up the application
- **ioManager.js** - Socket.IO communication manager for real-time features
- **package.json** - Node.js dependencies and scripts
- **Dockerfile** - Docker image configuration for containerizing the backend

### Subdirectories

#### `/db`
Database connection and data models
- **connect.js** - MongoDB connection setup and configuration
- **model.js** - Database schema definitions and models

#### `/routes`
API endpoints and route handlers
- **student.js** - Student-related routes and handlers
- **teacher.js** - Teacher-related routes and handlers

#### `/src`
Core business logic and classes
- **Quiz.js** - Quiz entity and methods
- **QuizManager.js** - Quiz management and operations
- **Rooms.js** - Quiz room/session management
- **User.js** - User entity and user-related functionality

#### `/utils`
Helper utilities and common functions
- **avatars.js** - Avatar/profile image utilities
- **randomId.js** - Random ID generation utility
- **storeQuiz.js** - Quiz data storage and persistence

---

## Database Service (`/database`)
MongoDB replica set configuration and setup.

### `/mongo-rs0-1` and `/mongo-rs0-2`
MongoDB replica set nodes

- **Dockerfile** - MongoDB container configuration
- **mongo.conf** - MongoDB configuration file
- **data/** - MongoDB data storage directory containing:
  - Collections and indexes (`.wt` files - WiredTiger format)

### `/setup`
Database initialization scripts

- **Dockerfile** - Setup container for initializing MongoDB
- **setup.sh** - Main setup script
- **replicatSet.sh** - MongoDB replica set initialization script
- **backend_2/** - Backend initialization files
- **socket_server/** - Socket server initialization files

### `/mongo`
MongoDB storage volume directory

---

## Socket Server Service (`/socket_server`)
Real-time communication service using Socket.IO.

### Files
- **index.js** - Main entry point for the socket server
- **package.json** - Dependencies and scripts
- **Dockerfile** - Docker configuration for the socket server
- **connect.js** - Socket connection management
- **IoManager.js** - Input/Output event management
- **utils.js** - Utility functions for socket operations

---

## Frontend Service (`/frontend`)
React-based web application for users to interact with quizzes.

### Configuration Files
- **package.json** - Node.js dependencies and build scripts
- **webpack.config.js** - Webpack bundler configuration
- **jsconfig.json** - JavaScript configuration (path aliases, etc.)
- **tailwind.config.js** - Tailwind CSS styling configuration
- **components.json** - Component library configuration
- **Dockerfile** - Docker configuration for the frontend
- **README.md** - Frontend-specific documentation

### Subdirectories

#### `/public`
Static assets served directly
- **index.html** - Main HTML entry point
- **manifest.json** - PWA manifest
- **robots.txt** - SEO robots directives
- **img/** - Image assets

#### `/src`
React application source code

- **App.js** - Root React component
- **index.js** - React DOM render entry point
- **App.css** - Global application styles
- **index.css** - Global styling
- **/components** - Reusable React components
- **/routes** - Page components and routing logic
- **/ui** - UI component library (Shadcn/UI or similar)
- **/lib** - Utility libraries and helpers
- **/styles** - CSS and styling files
- **/utils** - Frontend utility functions

#### `/components`
UI component definitions
- **ui/table.jsx** - Table UI component

---

## Service Communication

```
Frontend (React)
    ↓
Nginx/Express (Frontend Server)
    ↓
Backend API (backend_2) + Socket Server (socket_server)
    ↓
MongoDB Replica Set (mongo-rs0-1, mongo-rs0-2)
```

---

## Key Technologies

| Component | Technology |
|-----------|-----------|
| Backend | Node.js, Express |
| Real-time | Socket.IO |
| Database | MongoDB (Replica Set) |
| Frontend | React, Webpack, Tailwind CSS |
| Containerization | Docker, Docker Compose |

---

## Getting Started

1. Ensure Docker and Docker Compose are installed
2. Run: `docker-compose up` from the root directory
3. The application will:
   - Initialize MongoDB replica set
   - Start the backend service
   - Start the socket server
   - Serve the frontend

See `README.md` and individual service README files for more details.
