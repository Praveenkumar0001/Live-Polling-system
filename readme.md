# Live Polling System - Intervue Poll

A production-ready, real-time live polling system built with React, Node.js, Express, and Socket.io. This application allows teachers to create polls and ask questions while students can answer in real-time and view live results.

## 🎯 Features

### For Teachers:
- ✅ Create poll questions with 2-6 multiple choice options
- ✅ Set custom timer duration (30-120 seconds)
- ✅ Mark correct answers for educational purposes
- ✅ View live results with animated percentage bars
- ✅ Automatic question state management (can only ask new when appropriate)
- ✅ Real-time chat with all participants
- ✅ View and manage connected participants
- ✅ Kick out students if needed
- ✅ View complete poll history with all past questions and results

### For Students:
- ✅ Enter unique name to join the session
- ✅ Wait for teacher to ask questions
- ✅ Answer questions within the time limit
- ✅ Submit answer only once per question
- ✅ View live results after submitting
- ✅ Real-time chat with other participants
- ✅ See list of all connected students
- ✅ Receive notification if kicked out

### Real-time Features:
- ⚡ Live result updates as students answer
- ⚡ Real-time participant list synchronization
- ⚡ Instant chat messaging
- ⚡ Question timer countdown
- ⚡ Automatic question expiration
- ⚡ Connection status monitoring

## 🛠️ Tech Stack

### Backend:
- Node.js
- Express.js
- Socket.io
- UUID (for unique identifiers)
- dotenv (environment configuration)

### Frontend:
- React 18
- React Router DOM
- Socket.io Client
- CSS3 with CSS Variables
- Vite (Build tool)

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🚀 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd live-polling-system
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

## ▶️ Running the Application

### Step 1: Start the Backend Server
```bash
cd backend
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The backend server will start on `http://localhost:3001`

### Step 2: Start the Frontend Development Server

In a new terminal:
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Step 3: Open in Browser

1. Open `http://localhost:5173` in your browser
2. Select "I'm a Teacher" or "I'm a Student"
3. Click "Continue"

## 📁 Project Structure
```
live-polling-system/
├── backend/
│   ├── src/
│   │   ├── server.js                    # Main server file
│   │   ├── socket/
│   │   │   └── socketHandler.js         # Socket.io event handlers
│   │   ├── models/
│   │   │   └── pollManager.js           # Poll state management
│   │   └── utils/
│   │       └── validation.js            # Input validation
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                      # Main app with routing
│   │   ├── main.jsx                     # React entry point
│   │   ├── hooks/
│   │   │   └── useSocket.js             # Socket.io hook
│   │   ├── components/
│   │   │   ├── LandingPage.jsx          # Landing page
│   │   │   ├── Student/                 # Student components
│   │   │   │   ├── StudentEnterName.jsx
│   │   │   │   ├── StudentWaiting.jsx
│   │   │   │   ├── StudentQuestion.jsx
│   │   │   │   ├── StudentResults.jsx
│   │   │   │   └── StudentKickedOut.jsx
│   │   │   ├── Teacher/                 # Teacher components
│   │   │   │   ├── TeacherWelcome.jsx
│   │   │   │   ├── TeacherCreateQuestion.jsx
│   │   │   │   ├── TeacherResults.jsx
│   │   │   │   └── TeacherPollHistory.jsx
│   │   │   └── Shared/                  # Shared components
│   │   │       ├── ChatPanel.jsx
│   │   │       ├── ParticipantsPanel.jsx
│   │   │       └── FloatingChatButton.jsx
│   │   ├── styles/                      # CSS files
│   │   │   └── index.css
│   │   └── utils/
│   │       └── constants.js             # Constants and utilities
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── .env
│
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables (.env)
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend Environment Variables (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

## 📡 Socket.io Events

### Client → Server:

- `user:join` - Join as student or teacher
- `question:create` - Teacher creates new question
- `answer:submit` - Student submits answer
- `chat:message` - Send chat message
- `participant:kick` - Teacher kicks student
- `history:get` - Get poll history
- `question:canAsk` - Check if can ask new question

### Server → Client:

- `user:joined` - Confirmation of join
- `question:new` - New question broadcast
- `question:results` - Updated results
- `question:expired` - Question timer expired
- `answer:submitted` - Answer confirmation
- `user:kicked` - User was kicked
- `participants:update` - Updated participants list
- `chat:message` - New chat message
- `chat:history` - Chat history
- `history:data` - Poll history data
- `error` - Error message

## 🎨 UI Design

The application follows a clean, modern design with:
- Primary color: Purple (#7C3AED)
- Smooth animations and transitions
- Responsive layout for all screen sizes
- Intuitive user interface
- Real-time visual feedback

## 📊 Features Implementation

### Question Lifecycle:
1. Teacher creates question with options and duration
2. Question is broadcast to all students
3. Timer starts counting down
4. Students submit answers (one per student)
5. Results update in real-time
6. Teacher can ask new question when:
   - All students have answered, OR
   - Timer has expired, OR
   - No students are connected

### State Management:
- All state is managed in-memory on the server
- Participants tracked by socket ID
- Questions and answers stored in Maps
- Chat messages limited to last 100
- Poll history maintained during server runtime

### Validation:
- Name uniqueness for students
- Question text (1-500 characters)
- Options (2-6 options, 1-200 characters each)
- Timer duration (10-300 seconds)
- Chat messages (max 500 characters)

## 🔒 Security Considerations

Current implementation is for demonstration purposes. For production:

- [ ] Add user authentication
- [ ] Implement rate limiting
- [ ] Add input sanitization
- [ ] Use HTTPS
- [ ] Add database persistence
- [ ] Implement session management
- [ ] Add CSRF protection
- [ ] Implement proper error handling

## 🚧 Known Limitations

- Data stored in-memory (lost on server restart)
- Single room/session only
- No user authentication
- No persistent database
- No file upload support
- No question scheduling

## 🔮 Future Enhancements

- [ ] Multiple polling rooms
- [ ] User authentication and authorization
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Question templates and library
- [ ] Export results to CSV/PDF
- [ ] Analytics dashboard
- [ ] Mobile app support
- [ ] Question randomization
- [ ] Anonymous polling option
- [ ] Timed quizzes with scoring
- [ ] Multimedia support (images, videos)

## 🐛 Troubleshooting

### Connection Issues:
- Ensure backend is running on port 3001
- Check firewall settings
- Verify CORS configuration

### Students Can't Join:
- Check if name is already taken
- Verify Socket.io connection
- Check browser console for errors

### Questions Not Appearing:
- Ensure teacher created question properly
- Check Socket.io connection status
- Refresh both teacher and student pages

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please create an issue in the repository.

## 🙏 Acknowledgments

- Built for Intervue Poll Assignment
- Designed to match provided Figma specifications
- Implements real-time features with Socket.io

---

**Made with ❤️ for Intervue Poll**