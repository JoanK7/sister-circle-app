# SisterCircle - Mentorship Platform

A modern, real-time mentorship platform designed to connect women mentors and mentees through meaningful conversations, voice messaging, and community support.

![SisterCircle Platform](https://img.shields.io/badge/React-19.1.1-blue) ![Firebase](https://img.shields.io/badge/Firebase-12.0.0-orange) ![Lucide React](https://img.shields.io/badge/Lucide%20React-0.533.0-green)

## 🌟 Features

### **Core Functionality**
- **Real-time Chat**: Text and voice messaging between mentors and mentees
- **Voice Messages**: Record and send audio messages using MediaRecorder API
- **Session Management**: Request, join, and manage mentorship sessions
- **User Authentication**: Email/password and Google Sign-in
- **Profile Management**: Edit profiles with bio, interests, and availability
- **Forum Discussions**: Community discussions with reporting system
- **Admin Dashboard**: Monitor users, sessions, and reported content

### **UI/UX Features**
- **Modern Design**: Gradient themes with pink/purple color scheme
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live data synchronization with Firebase
- **Interactive Elements**: Hover effects, animations, and smooth transitions
- **Accessibility**: Keyboard navigation and screen reader support

## 🚀 Live Demo

Visit the deployed application: [SisterCircle Platform](https://sister-circle-app-b5f0e.web.app)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **Git**
- **Firebase CLI** (for deployment)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd sister-circle-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

#### 3.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `sister-circle-app`
4. Enable Google Analytics (optional)
5. Click "Create project"

#### 3.2 Enable Firebase Services
1. **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"
   - Enable "Google" provider
   - Add your domain to authorized domains

2. **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select location: `africa-south1`

3. **Storage**:
   - Go to Storage
   - Click "Get started"
   - Choose "Start in test mode" (for development)
   - Select location: `africa-south1`

#### 3.3 Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → Web app
4. Register app with name: `SisterCircle Web`
5. Copy the Firebase config object

#### 3.4 Configure Firebase in Your App
Create `src/firebase.js` with your Firebase config:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
```

### 4. Environment Variables (Optional)

Create `.env` file in the root directory:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### 5. Initialize Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase init
```

When prompted:
- Select "Hosting"
- Select "Use an existing project"
- Choose your Firebase project
- Set public directory: `build`
- Configure as single-page app: `Yes`
- Don't overwrite index.html: `No`

### 6. Start Development Server

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🏗️ Project Structure

```
sister-circle-app/
├── public/
│   ├── index.html          # Main HTML template
│   ├── manifest.json       # PWA manifest
│   └── favicon.ico        # App icon
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Avatar.js      # User avatar component
│   │   ├── Button.js      # Button component
│   │   ├── Card.js        # Card component
│   │   ├── Input.js       # Input component
│   │   └── Navigation.js  # Navigation bar
│   ├── contexts/          # React contexts
│   │   └── AuthContext.js # Authentication context
│   ├── pages/             # Application pages
│   │   ├── HomePage.js    # Landing page
│   │   ├── LoginPage.js   # Login page
│   │   ├── RegisterPage.js # Registration page
│   │   ├── MentorsPage.js # Mentors listing
│   │   ├── SessionsPage.js # Sessions & chat
│   │   ├── ForumPage.js   # Community forum
│   │   ├── ProfilePage.js # User profile
│   │   └── AdminDashboard.js # Admin panel
│   ├── App.js             # Main app component
│   ├── App.css            # Global styles
│   ├── firebase.js        # Firebase configuration
│   └── index.js           # App entry point
├── firebase.json          # Firebase configuration
├── .firebaserc           # Firebase project settings
└── package.json          # Dependencies & scripts
```

## 🎯 Available Scripts

### Development
```bash
npm start          # Start development server
npm test           # Run tests
npm run eject      # Eject from Create React App
```

### Production
```bash
npm run build      # Build for production
npm run deploy     # Build and deploy to Firebase
```

### Deployment Options
```bash
npm run deploy:hosting    # Deploy only hosting
npm run deploy:firestore  # Deploy only Firestore rules
npm run deploy:storage    # Deploy only Storage rules
```

## 🔧 Configuration

### Firebase Security Rules

#### Firestore Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Sessions - participants can read/write
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read, write: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/sessions/$(sessionId)).data.participants;
      }
    }
    
    // Forum posts - anyone can read, authenticated users can write
    match /forumPosts/{postId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

#### Storage Rules (`storage.rules`)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Voice messages - session participants only
    match /sessions/{sessionId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 Deployment

### 1. Build the Application
```bash
npm run build
```

### 2. Deploy to Firebase
```bash
npm run deploy
```

### 3. Verify Deployment
- Check Firebase Console → Hosting
- Visit your deployed URL
- Test all features

## 📱 Features Walkthrough

### **Authentication**
- **Sign Up**: Create account with email/password or Google
- **Sign In**: Login with existing credentials
- **Profile**: Edit personal information and preferences

### **Mentors Page**
- **Browse Mentors**: View all available mentors
- **Search & Filter**: Find mentors by interests/tags
- **Request Session**: Send session requests to mentors
- **Suggested Matches**: AI-powered mentor recommendations

### **Sessions Page**
- **View Sessions**: See all your mentorship sessions
- **Join Chat**: Enter real-time messaging interface
- **Text Messages**: Send and receive text messages
- **Voice Messages**: Record and send audio messages
- **Session Status**: Track pending, active, and completed sessions

### **Forum Page**
- **Start Discussions**: Create new forum posts
- **Community Chat**: Engage with the community
- **Report Content**: Flag inappropriate posts
- **Read Posts**: Browse community discussions

### **Profile Page**
- **Edit Profile**: Update bio, interests, and availability
- **View Information**: See your profile details
- **Save Changes**: Persist profile updates

### **Admin Dashboard**
- **User Management**: View and manage all users
- **Session Monitoring**: Track all mentorship sessions
- **Report Management**: Handle reported forum posts
- **Analytics**: View platform statistics

## 🔒 Security Features

- **Authentication**: Secure user login/logout
- **Authorization**: Role-based access control
- **Data Validation**: Input sanitization and validation
- **Content Moderation**: Report system for inappropriate content
- **Real-time Security**: Firestore security rules

## 🎨 Styling & Design

- **Modern UI**: Clean, professional design
- **Gradient Themes**: Pink/purple color scheme
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: CSS transitions and hover effects
- **Accessibility**: Keyboard navigation and screen reader support

## 🛠️ Troubleshooting

### Common Issues

#### 1. Firebase Configuration Errors
```bash
# Check Firebase config
firebase projects:list
firebase use <project-id>
```

#### 2. Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 3. Deployment Issues
```bash
# Check Firebase CLI
firebase --version
firebase login --reauth
```

#### 4. Real-time Data Not Working
- Verify Firestore rules
- Check Firebase console for errors
- Ensure proper authentication

### Performance Optimization

1. **Code Splitting**: Components are modular
2. **Lazy Loading**: Images and assets optimized
3. **Caching**: Firebase caching enabled
4. **Bundle Size**: Optimized build process

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React** - Frontend framework
- **Firebase** - Backend services
- **Lucide React** - Icon library
- **Create React App** - Development environment

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check Firebase documentation

---

**Made with ❤️ for the SisterCircle community**
