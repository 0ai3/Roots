# Roots

**Roots** is an interactive culture-meets-entertainment web app that invites users to explore a country’s map, discover cultural landmarks, traditional recipes and historical stories — all while earning points through quizzes and mini-games, redeemable as discounts at museums or local restaurants. The goal: make culture more accessible and engaging for everyone.

---

## 🎯 Features

- Explore an interactive map of a country (or multiple countries) with rich cultural content  
- Discover landmarks, heritage sites, historic stories and traditional recipes  
- Earn points by completing quizzes, challenges and games  
- Redeem points for real-world discounts at participating museums, restaurants or cultural venues  
- Mobile responsive, engaging UX to boost cultural awareness through gamification  

---

## 🧩 Tech Stack

- Built with Next.js (React + server-side rendering)  
- TypeScript for type safety and robust code  
- TailwindCSS
- Backend / API layer (Node.js, GeminiAI, MongoDB, ElevenLabs)  
- Interactive map & quiz engine (Leaflet)  
- Authentication, user profile & points system  

---

## 🚀 Getting Started

### Prerequisites

- Node.js (version >= 14)  
- npm or yarn (or pnpm)  
- A database or backend service for user profiles, points and redemption (configure accordingly)  
- Any environment variables required (see next)

### Installation

```bash
git clone https://github.com/0ai3/Roots.git
cd Roots
npm install

Configuration

Duplicate the .env.example (if provided) to .env.local

Fill in your environment variables, for example:

NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=...
MAPBOX_TOKEN=...
REDIS_URL=...


Configure redemption points logic, partner museum/restaurant API keys, etc.

Running locally
npm run dev
# or
yarn dev


Open http://localhost:3000
 in your browser to view the app in development mode.

Building for production
npm run build
npm start


🧑‍💻 Contributing

We welcome contributions! Here’s how you can help:

Fork this repository

Create a new branch (git checkout -b feature/YourFeature)

Make your changes and commit (git commit -m "feat: add …")

Push to the branch (git push origin feature/YourFeature)

Open a pull request describing what you did

Please follow the code style already present, write tests for new features when applicable, and update documentation as needed.

✅ Roadmap & Future Improvements

✅ Interactive country map with landmark pins

✅ Quiz engine & points system

✅ Points redemption at partner venues

✅ Multi-country support

✅ Mobile app version 

✅ Leaderboards & social sharing features

🔜 Localization (multi-language support)


📄 License

This project is licensed under the MIT License
Feel free to use, modify and distribute the code as per the license.

🙏 Acknowledgements

Thanks to all the contributors, designers, cultural partners and testers who help bring culture closer to people in fun and meaningful ways.

Enjoy exploring and building with Roots! 🌍🎮
