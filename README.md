# ClearMind

**An accessibility-first, neurodivergent-friendly productivity platform combining Notion's powerful organization with Tiimo's visual planning approach.**

ClearMind is designed specifically for users with ADHD, autism, and other executive function challenges, while remaining powerful and accessible for all users. Built with offline-first architecture, comprehensive accessibility features, and AI-powered assistance.

---

## 🌟 Key Features

### Core Productivity
- **Block-Based Editor**: Rich text editing with Tiptap, drag-and-drop reordering, slash commands, and markdown shortcuts
- **Hierarchical Pages**: Organize knowledge with nested pages, icons, cover images, and archiving
- **Flexible Databases**: 5 view types (Table, Kanban, Calendar, Gallery, List) with filtering, sorting, and custom properties
- **Visual Timeline Planner**: Tiimo-style daily scheduling with color-coding, icons, and flexible time blocks
- **Mood Tracking**: Dashboard with insights, charts, and pattern analysis
- **Focus Timer**: Pomodoro technique support with customizable durations

### AI-Powered Features
- **Writing Assistance**: Continue, improve, and summarize text with built-in LLM
- **Task Breakdown**: AI-powered task decomposition from natural language
- **Voice Transcription**: Whisper-powered speech-to-text for voice notes
- **Image Generation**: Create custom visuals and timeline icons

### Collaboration
- **Real-Time Sync**: WebSocket-based presence tracking, typing indicators, and live cursors
- **Comments System**: Collaborate on pages with @mentions
- **Notification Center**: Real-time updates for mentions, deadlines, and changes
- **Smart Automations**: Visual workflow builder with triggers, conditions, and actions

### Accessibility First
- **5 Sensory Profile Themes**:
  - ADHD-Optimized (default): Reduced visual clutter, clear hierarchy
  - High Contrast: Maximum readability
  - Dyslexia-Friendly: Atkinson Hyperlegible font, increased spacing
  - Low Stimulation: Minimal animations, muted colors
  - Standard: Balanced design for all users
- **WCAG Compliance**: Semantic HTML, ARIA labels, keyboard navigation
- **Screen Reader Support**: Tested with NVDA, JAWS, VoiceOver
- **Keyboard Shortcuts**: Comprehensive shortcuts for all features (Cmd+K panel)

### Technical Excellence
- **Offline-First**: IndexedDB local storage with background sync
- **Type-Safe**: End-to-end TypeScript with tRPC
- **Comprehensive Testing**: Vitest unit tests with CI/CD pipeline
- **Cross-Platform**: Web (primary), Electron desktop, PWA mobile

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22.x or higher
- pnpm 9.x or higher
- MySQL/TiDB database (or use Supabase)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ClearMind.git
cd ClearMind

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and API keys

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

### Environment Variables

Required environment variables (see `.env.example` for full list):

```bash
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication (Manus OAuth)
JWT_SECRET=your-secret-key
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im

# AI Features (Manus built-in APIs)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key
```

---

## 📖 Documentation

Comprehensive documentation is available in the repository:

- **[Product Requirements Document](./ClearMind_PRD.md)**: Complete feature specifications and user flows
- **[Technical Architecture](./ClearMind_Technical_Architecture.md)**: Database schema and system design
- **[Technical Blueprint](./ClearMind_Technical_Blueprint.md)**: Feature roadmap and implementation guide
- **[Deployment Guide](./ClearMind_Deployment_Guide.md)**: Step-by-step deployment for multiple platforms
- **[Marketing Strategy](./ClearMind_Marketing_Strategy.md)**: Go-to-market strategy for neurodivergent communities

---

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS 4** for styling with accessibility themes
- **Tiptap** (ProseMirror) for block-based editing
- **TanStack Query** for state management
- **Wouter** for lightweight routing

### Backend
- **tRPC 11** for type-safe API
- **Express 4** for server
- **Drizzle ORM** for database access
- **MySQL/TiDB** or **Supabase** for database
- **WebSocket** for real-time collaboration

### AI & Services
- **Manus LLM API** for writing assistance
- **Whisper API** for voice transcription
- **Image Generation API** for custom visuals
- **S3-compatible storage** for file uploads

### Testing & CI/CD
- **Vitest** for unit testing
- **React Testing Library** for component tests
- **GitHub Actions** for automated testing and deployment

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test server/archive-search.test.ts

# Type checking
pnpm tsc --noEmit
```

---

## 📦 Project Structure

```
ClearMind/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Theme, Workspace, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page-level components
│   │   └── lib/            # Utilities and tRPC client
│   └── public/             # Static assets
├── server/                 # Backend tRPC server
│   ├── db.ts               # Database query helpers
│   ├── routers.ts          # tRPC API routes
│   ├── search.ts           # Global search functionality
│   └── _core/              # Framework-level code (OAuth, context, etc.)
├── drizzle/                # Database schema and migrations
│   └── schema.ts           # Complete database schema (14 tables)
├── shared/                 # Shared types and constants
├── .github/workflows/      # CI/CD pipeline
└── docs/                   # Documentation files
```

---

## 🎯 Key Features by Use Case

### For Neurodivergent Users
- **Visual Timeline**: See your day at a glance with color-coded time blocks
- **Sensory Profiles**: Choose themes that match your sensory needs
- **Reduced Cognitive Load**: Clear hierarchy, minimal distractions
- **Flexible Structure**: Organize information your way
- **Mood Tracking**: Understand patterns and optimize your workflow

### For Teams
- **Real-Time Collaboration**: See who's viewing and editing
- **Comments & Mentions**: Discuss work inline with @mentions
- **Automations**: Reduce manual work with smart workflows
- **Notifications**: Stay updated without overwhelming alerts

### For Power Users
- **Keyboard Shortcuts**: Navigate without touching the mouse
- **Database Views**: Visualize data in multiple ways
- **AI Assistance**: Speed up writing and planning
- **Offline-First**: Work anywhere, sync when connected

---

## 🚢 Deployment

### Manus Platform (Recommended)
1. Create checkpoint in development
2. Click "Publish" in Management UI
3. Configure custom domain (optional)

### Vercel + Supabase
See [Deployment Guide](./ClearMind_Deployment_Guide.md) for detailed instructions.

### Electron Desktop App
```bash
pnpm build:electron
```

### PWA Mobile
```bash
pnpm build:pwa
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Write tests** for new features
3. **Follow TypeScript strict mode** and existing code style
4. **Update documentation** for user-facing changes
5. **Test accessibility** with keyboard navigation and screen readers
6. **Submit a pull request** with clear description

### Development Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and test
pnpm test
pnpm tsc --noEmit

# Commit with clear message
git commit -m "feat: add your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Notion** for inspiration on block-based editing and databases
- **Tiimo** for pioneering neurodivergent-friendly visual planning
- **Manus** for providing the development platform and AI APIs
- **Neurodivergent community** for feedback and feature requests

---

## 📞 Support & Community

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/ClearMind/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/ClearMind/discussions)
- **Documentation**: [Full docs](./docs/)
- **Email**: support@clearmind.app (if applicable)

---

## 🗺️ Roadmap

### Completed (v8.1)
- ✅ Block-based editor with drag-and-drop
- ✅ Database system with 5 views
- ✅ Visual timeline planner
- ✅ AI features (writing, voice, image generation)
- ✅ Real-time collaboration
- ✅ Mood tracking dashboard
- ✅ Automation builder
- ✅ 5 sensory profile themes
- ✅ Offline-first architecture
- ✅ Page archiving
- ✅ Global search

### Upcoming Features
- 🔄 Mobile app optimization
- 🔄 Advanced database relations and rollups
- 🔄 Team workspaces with permissions
- 🔄 CSV/Notion import/export
- 🔄 Native charts and reporting
- 🔄 Calendar integration
- 🔄 Email notifications

---

**Built with ❤️ for the neurodivergent community**
