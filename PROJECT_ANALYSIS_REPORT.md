# Quiz-O-Meter - Full Project Analysis Report

**Date:** December 13, 2025  
**Project Type:** Real-time Quiz Application  
**Tech Stack:** MERN (MongoDB, Express.js, React, Node.js)  
**Architecture:** Microservices with Socket.io for Real-time Communication

---

## 📋 Executive Summary

**Quiz-O-Meter** is a web-based real-time quiz application that enables teachers to create and administer quizzes while students join rooms to participate. The system uses a distributed architecture with three main services:
- **Backend API Server** (Express.js on port 3001) - REST API for quiz and room management
- **Socket Server** (Node.js on port 3003) - WebSocket server for real-time updates
- **Frontend Application** (React on port 3000) - User interface for teachers and students
- **MongoDB Replica Set** - Database with replication for persistence

---

## 🏗️ Architecture Overview

### Microservices Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Quiz-O-Meter System                     │
├──────────────────────┬──────────────────┬──────────────────┤
│   React Frontend     │  Express Backend │  Socket.io Server│
│   (Port 3000)        │  (Port 3001)     │  (Port 3003)     │
└──────┬───────────────┴─────────┬────────┴──────────┬────────┘
       │                         │                    │
       └─────────────────────────┼────────────────────┘
                                 │
                     ┌───────────┴───────────┐
                     │   MongoDB Replica     │
                     │  Set (Port 27021)     │
                     │  mongo-express (8081) │
                     └───────────────────────┘
```

### Docker Compose Services
- **react-app**: Frontend service running on port 3000
- **server**: Express backend on port 3001
- **socket**: Socket.io server on port 3003
- **mongo1**: MongoDB instance on port 27021
- **mongo-express**: MongoDB admin interface on port 8081

---

## 📁 Project Structure Breakdown

### 1. Backend Service (`backend_2/`)

#### Core Architecture

**Entry Point:** `index.js`
```
- Express application setup
- CORS enabled for http://localhost:3000
- Middleware: cors, express.json, cookieParser
- Routes: /api/teachers, /api/students
- Listening on port 3001
```

#### Dependencies
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.2.4",
  "socket.io": "^4.7.4",
  "cors": "^2.8.5",
  "cookie-parser": "^1.4.6",
  "nodemon": "^3.1.0"
}
```

#### Database Models (`db/model.js`)

**UserSchema**
- username (String)
- role (String: "student" | "teacher")
- roomId (String)
- submissions (Array of Objects)
- timestamps

**QuizSchema**
- question (String)
- options (Array of Strings)
- answer (String)
- roomId (String)
- timestamps

**RoomSchema**
- teacher (ObjectId reference to User)
- participants (Array of ObjectId references to Users)
- roomId (String, unique)
- quizzes (Map of ObjectId references to Quizzes)
- timestamps

**QuizManagerSchema**
- roomId (String)
- roomObj (ObjectId reference to Room)

#### Core Classes

**User Class** (`src/User.js`)
```javascript
Properties:
- id: User MongoDB ID
- username: User's name
- roomId: Associated room
- role: "student" or "teacher"

Methods:
- isTeacher(): Boolean check
- getUserId(): Returns user ID
```

**Quiz Class** (`src/Quiz.js`)
```javascript
Properties:
- question: Question text
- options: Array of answer options
- answer: Correct answer
- roomId: Associated room
- quizId: Unique quiz identifier

Methods:
- getQuiz(): Returns question and options (hides answer)
- setQuestion(newQuestion): Update question
- checkAnswer(answerIndex): Validates student answer
```

**Rooms Class** (`src/Rooms.js`)
```javascript
Properties:
- teacher: Teacher user object
- roomId: Unique room identifier
- quizzes: Array of Quiz objects
- submissions: Student submissions
- participants: Array of User objects

Key Methods:
- addParticipant(username, roomId): Add student to room
- addBulkRoomQuiz(listOfQuiz, roomId): Add multiple quizzes
- checkQuizAnswerAndSubmit(userId, quizzes, roomId): Validate and store answers
- getRoomQuiz(quizzes): Return quiz list without answers
- getParticipantName(objectId): Get list of participants
```

**QuizManager Class** (`src/QuizManager.js`)
```javascript
Central management class for quiz operations

Key Methods:
- createRoom(teacherName, roomId): Initialize new quiz room
- addStudent(username, roomId): Register student in room
- getStudentName(roomId): List all students in room
- addBulkQuiz(roomId, listOfQuiz): Add questions to room
- getQuizzes(roomId): Get all questions for a room
- getTeacherQuizzes(roomId): Get teacher's question list
- getRoom(roomId): Retrieve room object
- checkManagerQuizAnswer(studentId, roomId, quizzes): Submit and grade answers
- getAnalytics(teacherId, roomId): Get submission analytics
```

#### API Routes

**Teacher Routes** (`routes/teacher.js`)
```
GET  /api/teachers/quizzes
     - Get quizzes created by teacher
     - Uses roomId from cookies

POST /api/teachers/quizzes
     - Create new quizzes
     - Body: Array of {question, options, answer}
     - Stores in MongoDB

POST /api/teachers/rooms
     - Create new quiz room
     - Body: {teacherName, roomId}
     - Sets roomId and teacherId cookies
     - Returns {roomId, teacherId}

GET  /api/teachers/rooms/:roomId
     - Get room details
     - Returns room object with participants

GET  /api/teachers/analytics/:roomId
     - Get student submission analytics
     - Authorization check (teacher verification)
     - Returns array of student submissions
```

**Student Routes** (`routes/student.js`)
```
POST /api/students/rooms/:roomId
     - Join quiz room
     - Body: {username}
     - Sets userId cookie
     - Returns {userId}

GET  /api/students/rooms/:roomId
     - Get all quizzes in room (without answers)
     - Returns array of quiz objects

GET  /api/students/rooms/:id/participants
     - Get list of participants in room
     - Returns array of {studentId, student} objects

POST /api/students/rooms/quizzes/answers
     - Submit quiz answers
     - Body: Array of {quizId, answer}
     - Cookies: roomId, userId
     - Returns graded submissions with isCorrect flags
```

#### Database Connection (`db/connect.js`)
```
- MongoDB URI: mongodb://127.0.0.1:27021/test?replicaSet=dbrs
- Uses Mongoose with new parser and topology
- Replica set enabled for high availability
```

#### Utility Functions
- `randomId.js`: Generate random identifiers
- `storeQuiz.js`: Serialize/deserialize quiz data
- `avatars.js`: Avatar generation for users

---

### 2. Socket Server (`socket_server/`)

#### Entry Point: `index.js`

**HTTP Server Setup**
```javascript
- Uses http module to create server
- Socket.io server on port 3003
- CORS enabled for http://localhost:3000
- Socket event handlers for real-time updates
```

#### Core Socket Events

**Connection Handler**
```javascript
- Listens for "connection" events
- Logs user connections/disconnections
```

**Socket Event: "user-IU"**
```javascript
- Receives roomId parameter
- Initiates watchUpdate function
- Watches MongoDB change stream for user updates
- Emits "user-update" for updated users
- Emits "user-insert" for new users
```

**Socket Event: "user"**
```javascript
- Receives roomId parameter
- Retrieves room data from database
- Populates participant information
- Formats student list for table display
- Emits "user" event with formatted data
```

#### Real-time Features

**Change Stream Monitoring** (`watchUpdate` function)
```javascript
- Monitors MongoDB "users" collection
- Detects INSERT and UPDATE operations
- Filters by roomId
- Formats user data and broadcasts updates
- Real-time participant list updates
```

#### Database Connection (`connect.js`)
```
- MongoDB URI: mongodb://127.0.0.1:27022/test?replicaSet=dbrs
- Note: Uses different port (27022) than backend
- Replica set enabled
```

#### IoManager (`IoManager.js`)
```javascript
- Creates Socket.io server with CORS configuration
- Exports io instance for use in index.js
```

#### Utility Functions (`utils.js`)
- `formatForTable(user)`: Format user object for table display
- `populateParticipants(room)`: Populate room participant data
- `studentsTableFormat(students)`: Format student list for frontend

#### Dependencies
```json
{
  "socket.io": "^4.7.4",
  "express": "^4.18.3",
  "mongoose": "^8.3.2",
  "cors": "^2.8.5",
  "axios": "^1.6.7",
  "nodemon": "^3.1.0"
}
```

---

### 3. Frontend Application (`frontend/`)

#### Technology Stack

**Core Dependencies**
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.22.2",
  "socket.io-client": "^4.7.4",
  "axios": "^1.6.7",
  "react-hook-form": "^7.51.0",
  "react-cookie": "^7.1.0",
  "@tanstack/react-table": "^8.16.0",
  "tailwindcss": "^3.x",
  "lucide-react": "^0.368.0",
  "@radix-ui/react-*": "^1.x"
}
```

**Build Tools**
- react-scripts (^5.0.1)
- webpack with custom config
- Tailwind CSS for styling
- Radix UI for accessible components

#### Main Application (`src/App.js`)

**Purpose:** Landing page and role selection

**Features:**
- Hero section with "Quiz-O-Meter" branding
- Two main action buttons: Student | Teacher
- Navigation menu: Home, About, Contact
- Background image (Landing.png)
- Session management (Supabase integration, commented out)

**Routes:**
- Student button → `/join` (join quiz room)
- Teacher button → `/create` (create quiz room)
- Unauthenticated → `/login` (redirects to login)

**Styling:** Tailwind CSS classes
- Flexbox layout
- Responsive design
- Custom CSS in App.css

#### Project Structure

**Components** (`src/components/`)
```
Core UI Components:
├── Button.jsx / Button.css
├── Input.jsx / Input.css
├── QuestionBox.jsx
├── Choices.jsx
├── Radio-group.jsx
├── RadioButton.jsx
├── Otp.jsx / Otp.css
├── TextStroke.jsx / TextStroke.css
├── data-table.jsx
├── columns.jsx
└── tableData.jsx

Sub-directory:
└── ui/
    └── [Radix UI wrapped components]
```

**Routes** (`src/routes/`)
- Likely contains: login, join, create routes

**Utilities** (`src/utils/`)
- supabase.js: Authentication service
- API communication helpers
- Data formatting utilities

**Styles** (`src/styles/`)
- Global styles
- Theme configuration
- CSS variables

**Lib** (`src/lib/`)
- Utility functions
- Helper libraries

**Build Configuration**
```
- tailwind.config.js: Tailwind theming
- webpack.config.js: Custom webpack setup
- jsconfig.json: JavaScript path aliases
- components.json: UI component metadata
```

#### Authentication
- Supabase integration (currently commented out in App.js)
- Cookie-based session management
- Role-based routing (Teacher vs Student)

---

## 🔄 Data Flow and Communication

### User Registration Flow (Student)

```
1. Student clicks "Student" button on landing page
   ↓
2. Navigates to /join (room joining page)
   ↓
3. Enters username and room ID
   ↓
4. POST /api/students/rooms/:roomId
   {username: "student_name"}
   ↓
5. Backend (QuizManager):
   - Checks room exists
   - Creates User object
   - Adds to Rooms.participants
   - Saves to MongoDB
   ↓
6. Frontend receives userId
   - Stores in cookie
   - Navigates to quiz playground
   ↓
7. Socket.io connects (event: "user-IU")
   - Triggers change stream monitoring
   - Receives real-time updates
```

### Quiz Creation Flow (Teacher)

```
1. Teacher clicks "Teacher" button on landing page
   ↓
2. Navigates to /create
   ↓
3. Enters teacher name and room ID
   ↓
4. POST /api/teachers/rooms
   {teacherName: "teacher_name", roomId: "room123"}
   ↓
5. Backend (QuizManager):
   - Creates User (role: "teacher")
   - Creates Room object
   - Saves to MongoDB
   - Returns teacherId cookie
   ↓
6. Teacher adds questions
   ↓
7. POST /api/teachers/quizzes
   Body: [
     {question: "Q1", options: ["A", "B", "C"], answer: "A"},
     ...
   ]
   ↓
8. Backend:
   - Stores quizzes in MongoDB (QuizSchema)
   - Links to room via quizzes map
   - Returns quiz IDs
   ↓
9. Quizzes now available for students
```

### Quiz Participation Flow

```
Student Perspective:
1. Student joins room (already registered)
   ↓
2. GET /api/students/rooms/:roomId
   ↓
3. Receives quiz list (without answers)
   [
     {quizId: "1", question: "Q1", options: ["A", "B", "C"]},
     ...
   ]
   ↓
4. Student answers questions
   ↓
5. POST /api/students/rooms/quizzes/answers
   Body: [{quizId: "1", answer: "0"}, ...]
   Cookies: {userId, roomId}
   ↓
6. Backend (Rooms.checkQuizAnswerAndSubmit):
   - Retrieves correct answers from DB
   - Compares student answers
   - Creates submission objects with isCorrect flags
   - Stores in User.submissions
   ↓
7. Frontend displays results with score
```

### Real-time Updates Flow

```
Socket.io Participant List Updates:

1. Student joins room
   ↓
2. Emits "user-IU" event with roomId to Socket server
   ↓
3. Socket server:
   - Calls watchUpdate(socket, roomId)
   - Creates MongoDB change stream on "users" collection
   ↓
4. When another student joins:
   - Database INSERT operation detected
   - Change stream triggers
   - Checks if user.roomId matches
   ↓
5. Socket emits "user-insert" with formatted user data
   ↓
6. Frontend receives real-time update
   - Participant list updated
   - No page refresh needed
```

---

## 🗄️ Database Schema Details

### Collections Overview

**Users Collection**
```
{
  _id: ObjectId,
  username: String,
  role: String ("student" | "teacher"),
  roomId: String,
  submissions: [{
    quizId: String,
    question: String,
    options: Array,
    answer: String,
    isCorrect: Boolean,
    studentAns: String,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Quizzes Collection**
```
{
  _id: ObjectId,
  question: String,
  options: [String, String, String, ...],
  answer: String,
  roomId: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Rooms Collection**
```
{
  _id: ObjectId,
  teacher: ObjectId (ref: Users),
  participants: [ObjectId (ref: Users)],
  roomId: String (unique),
  quizzes: Map<ObjectId (ref: Quizzes)>,
  createdAt: Date,
  updatedAt: Date
}
```

**QuizManager Collection**
```
{
  _id: ObjectId,
  roomId: String,
  roomObj: ObjectId (ref: Rooms)
}
```

### Relationships

```
Users ←→ Rooms (many-to-many via participants array)
Users (teacher) ← Rooms (one-to-many)
Rooms ←→ Quizzes (many-to-many via quizzes map)
Rooms ← QuizManager (one-to-one)
```

---

## 🔌 API Endpoint Summary

### Teacher API (`/api/teachers`)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/rooms` | Create quiz room | Cookie |
| GET | `/rooms/:roomId` | Get room details | Cookie |
| POST | `/quizzes` | Add questions to room | Cookie |
| GET | `/quizzes` | Get teacher's quizzes | Cookie |
| GET | `/analytics/:roomId` | View student submissions | Cookie |

### Student API (`/api/students`)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/rooms/:roomId` | Join quiz room | None |
| GET | `/rooms/:roomId` | Get quiz questions | Cookie |
| GET | `/rooms/:id/participants` | List participants | Cookie |
| POST | `/rooms/quizzes/answers` | Submit answers | Cookie |

### Socket Events

| Event | Direction | Payload | Purpose |
|-------|-----------|---------|---------|
| connection | Server→Client | - | Client connects |
| disconnect | Client→Server | - | Client disconnects |
| user-IU | Client→Server | roomId | Start watching room updates |
| user-update | Server→Client | userData | User data updated |
| user-insert | Server→Client | userData | New user joined room |
| user | Client→Server | roomId | Request current participants |

---

## 🔒 Security Considerations

### Current Implementation
- CORS restricted to `http://localhost:3000`
- Cookie-based session management
- Role verification (teacher check for analytics)
- MongoDB replica set for data integrity

### Potential Improvements
1. **Authentication**: Implement JWT or session tokens instead of simple cookies
2. **Authorization**: Strengthen role-based access control (RBAC)
3. **Input Validation**: Add request body validation
4. **Rate Limiting**: Prevent abuse on API endpoints
5. **HTTPS**: Enable in production
6. **CORS**: More restrictive origin policies
7. **Data Encryption**: Encrypt sensitive data at rest

---

## 🚀 Deployment Architecture

### Docker Configuration

**Services:**
1. **React App** (Frontend)
   - Port: 3000
   - Volume: Frontend source code
   - Command: npm start

2. **Express Server** (Backend)
   - Port: 3001
   - Volume: Backend source code
   - Network: mongors-network
   - Depends on: mongo1

3. **Socket.io Server**
   - Port: 3003
   - Volume: Socket server source code
   - Network: mongors-network
   - CORS: Enabled for localhost:3000

4. **MongoDB Instance (mongo1)**
   - Port: 27021 (internal: 27017)
   - Volume: Data persistence
   - Network: mongors-network
   - Replica set: dbrs

5. **Mongo Express** (Admin UI)
   - Port: 8081
   - Purpose: Database administration
   - Network: mongors-network
   - Credentials: root/password

### Network Architecture
- **mongors-network**: Bridges all services for inter-service communication
- Services can reference each other by container name (e.g., `mongo1:27017`)

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│  Landing → Join/Create → Quiz Playground → Results/Analytics   │
└──────────────────┬──────────────────────────────────────────────┘
                   │
         ┌─────────┼─────────┐
         │         │         │
         │ REST API│ Socket  │
         │ (HTTP)  │(WebSocket)
         │         │         │
         ▼         ▼         ▼
┌──────────────────────────────────────────────────────────────────┐
│                     BACKEND SERVICES                             │
├──────────────────┬──────────────────┬────────────────────────────┤
│  Express Server  │  Socket Server   │  Core Classes             │
│  (Port 3001)     │  (Port 3003)     │                           │
│                  │                  │  - QuizManager             │
│  Routes:         │  Change Stream   │  - Rooms                  │
│  ├─ /teachers    │  Monitoring      │  - User                   │
│  ├─ /students    │                  │  - Quiz                   │
│  └─ /analytics   │  Real-time       │                           │
│                  │  Broadcasts      │  Models:                  │
│                  │                  │  ├─ UserSchema            │
│                  │                  │  ├─ QuizSchema            │
│                  │                  │  ├─ RoomSchema            │
│                  │                  │  └─ QuizManagerSchema     │
└──────────────────┴──────────────────┴────────────────────────────┘
                            │
                            │
         ┌──────────────────┴──────────────────┐
         │     MongoDB Replica Set             │
         │     (Port 27021 for mongo1)         │
         │     Database: "test"                │
         │     Collections:                    │
         │     ├─ Users                        │
         │     ├─ Quizzes                      │
         │     ├─ Rooms                        │
         │     └─ QuizManagers                 │
         └─────────────────────────────────────┘
```

---

## 🛠️ Development Workflow

### Local Development Setup

**Prerequisites:**
- Node.js (v14+)
- MongoDB (with replica set support)
- Docker & Docker Compose (optional)

**Steps:**
1. Install dependencies in all three directories
   ```bash
   cd backend_2 && npm install
   cd ../socket_server && npm install
   cd ../frontend && npm install
   ```

2. Start MongoDB with replica set
   ```bash
   docker-compose up mongo1 mongo-express
   ```

3. Start services
   ```bash
   # In separate terminals
   cd backend_2 && npm run start
   cd socket_server && npm run start
   cd frontend && npm run start
   ```

4. Access application
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001
   - Socket Server: http://localhost:3003
   - Mongo Express: http://localhost:8081

### Development Features
- **Hot Reload**: Nodemon configured for automatic restart on code changes
- **React Dev Tools**: Development build with source maps
- **Docker Volumes**: Mounted source directories for live updates

---

## 📈 Key Features

### Teacher Features
1. **Create Quiz Rooms** - Unique room IDs for quiz sessions
2. **Add Questions** - Support for multiple choice questions
3. **View Participants** - Real-time list of students in room
4. **Analytics** - View student submissions and scores

### Student Features
1. **Join Rooms** - Enter room with ID and username
2. **Take Quizzes** - Answer multiple choice questions
3. **Real-time Updates** - See other participants joining
4. **Submit Answers** - Get instant feedback on responses
5. **View Results** - See personal performance

### System Features
1. **Real-time Updates** - Socket.io powered live updates
2. **Persistent Storage** - MongoDB with replica sets
3. **Scalable Architecture** - Microservices design
4. **Role-based Access** - Teacher vs Student separation

---

## ⚠️ Current Issues & Limitations

### Known Issues
1. **Database Port Mismatch**: Socket server connects to port 27022, backend to 27021
2. **Authentication**: No proper authentication mechanism (using cookies only)
3. **Error Handling**: Limited error handling and validation
4. **Code Organization**: Some initialization logic in init.js could be restructured

### Limitations
1. **Single Teacher per Room**: No support for co-teaching
2. **Sequential Questions**: No question shuffling or branching
3. **Limited Reporting**: Basic analytics only
4. **No Question Bank**: Questions not reusable across rooms
5. **Basic UI**: Frontend could be more polished

---

## 🎯 Recommended Improvements

### Short-term
1. Fix MongoDB connection port inconsistency
2. Add input validation on all API endpoints
3. Implement proper error handling and logging
4. Add unit tests for core classes
5. Improve UI/UX design

### Medium-term
1. Implement JWT authentication
2. Add database indexing for performance
3. Create admin dashboard with analytics
4. Implement quiz templates
5. Add question difficulty levels

### Long-term
1. Multi-teacher support
2. Advanced analytics and reporting
3. Mobile app version
4. Internationalization (i18n)
5. CDN for static assets

---

## 📚 Dependencies Summary

### Backend
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **socket.io**: Real-time communication
- **cors**: Cross-origin requests
- **cookie-parser**: Cookie handling
- **nodemon**: Development auto-reload

### Socket Server
- **socket.io**: WebSocket server
- **express**: HTTP server
- **mongoose**: Database access
- **cors**: CORS handling
- **axios**: HTTP client

### Frontend
- **react**: UI library
- **react-router-dom**: Routing
- **socket.io-client**: WebSocket client
- **axios**: HTTP client
- **react-hook-form**: Form management
- **tailwindcss**: Styling
- **@radix-ui**: Accessible components
- **lucide-react**: Icons

---

## 📝 Conclusion

**Quiz-O-Meter** is a well-structured full-stack application with a clear separation of concerns. The use of microservices, real-time communication via Socket.io, and a robust database layer provides a solid foundation for a quiz management system. The frontend provides an intuitive user experience with role-based navigation.

**Key Strengths:**
- Clean microservices architecture
- Real-time participant updates
- Persistent data storage
- Role-based access control
- Docker containerization

**Areas for Improvement:**
- Authentication and authorization
- Input validation and error handling
- Code documentation
- Test coverage
- UI/UX refinement

The project demonstrates solid understanding of MERN stack development and real-time web applications.

