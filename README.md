# EDU-Toulouse Platform

EDU-Toulouse (Esport & Digital Universe Toulouse) is a web platform for esports events and digital entertainment in Toulouse. This platform allows users to discover upcoming events, register for participation either individually or as teams, create and manage teams, and connect with other community members.

## 🚀 Features

- **Discord Authentication**: Secure login via Discord OAuth
- **Event Management**: Browse, view details, and register for esports events
- **Team System**: Create teams, invite members, and manage team compositions
- **User Profiles**: Display Discord profile data and participation history
- **Responsive Design**: Optimized for mobile, tablet, and desktop experiences

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **Data Fetching**: TanStack Query 5
- **UI Components**: Shadcn UI with Radix UI primitives
- **Styling**: TailwindCSS 4
- **Build Tools**: Turbopack

## 📋 Prerequisites

- Node.js 18.17.0 or later
- Supabase account and project
- Discord developer application (for OAuth)

## 🔧 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/edu-toulouse.git
   cd edu-toulouse
   ```

2. Install dependencies:

   ```bash
   pnpm install
   # OR
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` with your Supabase credentials.

4. Set up the Supabase database
   See the [Supabase Setup Guide](SUPABASE.md) for detailed instructions on creating the required database tables and authentication setup.

5. Start the development server:

   ```bash
   pnpm dev
   # OR
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Project Structure

- `app/` - Next.js routes and page components
- `components/` - Reusable UI components
  - `ui/` - Shadcn UI components
  - `auth/` - Authentication components
  - `events/` - Event-related components
  - `teams/` - Team-related components
  - `layout/` - Layout components
  - `profile/` - User profile components
- `lib/` - Utility functions and APIs
  - `supabase/` - Supabase client and operations
- `public/` - Static assets and images

## 🔐 Authentication

Authentication is handled through Supabase Auth with Discord as the OAuth provider. The flow is:

1. User clicks "Login with Discord"
2. Discord OAuth flow redirects back to `/auth/callback`
3. Session is created and stored in cookies
4. User is redirected to the homepage or original destination

## 📝 Database Schema

The database includes the following main tables:

- **profiles**: User profile information synchronized with Discord
- **events**: Esports and digital events
- **teams**: Competitive teams created by users
- **team_members**: Relationship between users and teams
- **event_registrations**: User or team registrations for events
- **team_invitations**: Invitation codes for joining teams

## 🧱 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [TanStack Query](https://tanstack.com/query)
- [Shadcn UI](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)
