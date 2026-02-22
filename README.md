# E-Commerce Platform (MERN Stack)



A modern full-stack e-commerce web application built using the MERN stack (MongoDB, Express, React, Node.js). This platform allows users to browse products, leave reviews, manage a cart, and securely handle authentication. Built with TypeScript and designed to offer a smooth shopping experience with mobile-friendly responsiveness.

## Features
*User registration & authentication (Passport.js + sessions)
*User profile management (update name, address, password)
*Product listings with categories, variants, and filters
*Customer reviews with auto-scroll and highlight for new reviews
*Shopping cart with quantity controls and variant selection
*Secure password handling with bcrypt
*Responsive UI built with Tailwind CSS and Headless UI
*Input validation with Zod + React Hook Form
*Dev-optimized tooling: React Query, Vite, TypeScript

## Tech Stack
```
| Layer         | Tech                              |
| ------------- | --------------------------------- |
| Frontend      | React + TypeScript + Tailwind CSS |
| Backend       | Node.js + Express                 |
| Database      | MongoDB (Mongoose ODM)            |
| Auth          | Passport.js + Express Sessions    |
| Form & Valid. | React Hook Form + Zod             |
| Dev Tools     | Vite, React Query, Lucide Icons   |
```
##  Project Structure
```
client/             # React frontend
├── components/
├── pages/
├── contexts/
└── lib/

server/             # Node.js backend
├── routes.ts       # API routes
├── auth.ts         # Passport config
└── models/         # Mongoose schemas

shared/             # Shared types/models (Zod, TS)
```

## Demo
Live demo coming soon!
🛠️ Run locally:
```
# Clone the repo
git clone https://github.com/your-username/mern-ecommerce-platform.git
cd mern-ecommerce-platform

# Install backend
cd server
npm install

# Install frontend
cd ../client
npm install

# Start dev server
npm run dev
```

##  Setup Notes
* Configure .env with your MongoDB URI and session secret.
* MongoDB Atlas required for cloud DB (or use local MongoDB).
* Uses in-memory fallback for development if MongoDB fails.

## Highlights
* Seamless review submission with scroll-to-highlight on new posts.
* Protected routes and sessions using Passport.
* Fully functional profile editor and cart manager.
* Clean UI components and consistent design system.

## Author
* 👨‍💻 Built by Brian van Vlymen — van-vlymen.com

## License
MIT

