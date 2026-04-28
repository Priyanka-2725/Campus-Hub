# Campus Hub

Campus Hub is a comprehensive campus community platform that enables students to exchange items, collaborate on projects, discover events, and connect with peers. The platform combines a Spring Boot backend with a React/Vite frontend to deliver a seamless user experience.

## Features

- **Marketplace**: Buy, sell, and exchange items within the campus community
- **Collaboration**: Find and post collaboration opportunities for group projects
- **Events**: Discover and participate in campus events
- **Messaging**: Real-time messaging between users
- **Notifications**: Real-time notifications for interactions and updates
- **User Profiles**: Personalized user profiles with preferences and activity history
- **Analytics**: Track listing views and interest metrics
- **AI-Powered Features**: Description generation and price suggestions for listings
- **Recommendations**: Smart recommendation engine for personalized content discovery

## Project Structure

```
campus-exchange-backend/          # Spring Boot backend application
├── src/
│   ├── main/
│   │   ├── java/com/campushub/  # Java source code
│   │   │   ├── config/          # Configuration classes (CORS, Security)
│   │   │   ├── controller/      # REST API controllers
│   │   │   ├── service/         # Business logic services
│   │   │   ├── repository/      # Data access layer
│   │   │   ├── entity/          # JPA entities
│   │   │   ├── dto/             # Data transfer objects
│   │   │   ├── security/        # JWT authentication & authorization
│   │   │   ├── listener/        # Event listeners
│   │   │   ├── exception/       # Exception handlers
│   │   │   └── util/            # Utility classes
│   │   └── resources/           # Configuration files
│   └── test/                    # Integration tests
└── pom.xml                      # Maven configuration

campus-exchange-frontend/         # React + Vite frontend application
├── src/
│   ├── components/              # Reusable React components
│   ├── pages/                   # Page components
│   ├── context/                 # React context for state management
│   ├── api/                     # API client configuration
│   ├── util/                    # Utility functions
│   ├── App.jsx                  # Main app component
│   └── main.jsx                 # Entry point
├── public/                      # Static assets
├── package.json                 # NPM dependencies
├── vite.config.js              # Vite configuration
└── tailwind.config.js          # Tailwind CSS configuration
```

## Prerequisites

- **Java**: JDK 21+
- **Maven**: 3.8+
- **Node.js**: 18+
- **npm**: 9+
- **MySQL**: 8.0+

## Getting Started

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd campus-exchange-backend
   ```

2. **Configure database credentials**:
   Edit `src/main/resources/application.properties` and update:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/campus_hub
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. **Build the backend**:
   ```bash
   mvn clean install
   ```

4. **Run the backend**:
   ```bash
   mvn spring-boot:run
   ```

   The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd campus-exchange-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

4. **Build for production**:
   ```bash
   npm run build
   ```

## Backend Technologies

- **Spring Boot**: 3.x - Framework for building REST APIs
- **Spring Security**: JWT-based authentication and authorization
- **Spring Data JPA**: Database access and ORM
- **MySQL**: Relational database
- **Lombok**: Reduces boilerplate code
- **MapStruct**: Entity-to-DTO mapping
- **JJWT**: JSON Web Token handling

## Frontend Technologies

- **React**: 18+ - UI library
- **Vite**: Modern build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **React Context**: State management

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Listings (Marketplace)
- `GET /api/listings` - Get all listings
- `GET /api/listings/{id}` - Get listing details
- `POST /api/listings` - Create new listing
- `PUT /api/listings/{id}` - Update listing
- `DELETE /api/listings/{id}` - Delete listing
- `POST /api/listings/{id}/interest` - Express interest in listing

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event

### Collaboration
- `GET /api/collaboration` - Get collaboration posts
- `POST /api/collaboration` - Create collaboration post
- `PUT /api/collaboration/{id}` - Update collaboration post

### Messages
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message

### Notifications
- `GET /api/notifications` - Get user notifications
- `DELETE /api/notifications/{id}` - Mark notification as read

### Users
- `GET /api/users/{id}` - Get user profile
- `PUT /api/users/{id}` - Update user profile

## Key Services

### ActivityService
Manages user activity tracking and feeds.

### AIService
Provides AI-powered features like description generation and price suggestions.

### ListingService
Core service for marketplace listing operations.

### RecommendationService
Generates personalized recommendations based on user preferences and behavior.

### NotificationService
Handles notification creation and delivery.

### AuthService
Manages user authentication and JWT token generation.

## Testing

### Backend Integration Tests
```bash
cd campus-exchange-backend
mvn test
```

Run specific test:
```bash
mvn test -Dtest=ListingInterestEventFlowL1Test
```

## Security

- **JWT Authentication**: All API endpoints (except auth) require valid JWT token
- **Password Encryption**: Passwords are encrypted using BCrypt
- **CORS Configuration**: Frontend and backend are properly configured for cross-origin requests
- **Role-Based Access Control**: Different user roles have different permissions

## Database Schema

The application uses the following main entities:
- **User**: User accounts and profiles
- **Listing**: Marketplace items
- **Event**: Campus events
- **Interest**: User interest in listings
- **Message**: Direct messages between users
- **Notification**: User notifications
- **CollaborationPost**: Collaboration opportunities
- **Activity**: User activity history
- **Wishlist**: User wishlists

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Create a pull request with a clear description

## Troubleshooting

### Backend won't start
- Verify MySQL is running and credentials are correct
- Check Java version: `java -version`
- Clear Maven cache: `mvn clean`

### Frontend build errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node -v`

### CORS errors
- Ensure backend CORS config includes your frontend URL
- Verify both backend and frontend are running

## License

This project is part of the Campus Hub initiative.

## Support

For issues or questions, please create an issue in the GitHub repository.
