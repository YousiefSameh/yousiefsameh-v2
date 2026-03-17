# Yousief Sameh Portfolio

A comprehensive, production-ready portfolio and client management platform built with **Next.js 15**, **Supabase**, and **TailwindCSS v4**.

## Overview

This platform serves as a complete solution for developers, designers, and freelancers to showcase their work, manage client projects, and build their personal brand. It includes a public-facing portfolio website, an admin dashboard for content management, and a client portal for project tracking.

### Target Audience

- **Clients & Recruiters** — View portfolio, projects, and case studies
- **Visitors** — Read blog posts, learn about services
- **Admin** — Manage content, track contacts, handle client projects
- **Clients (Portal)** — Track project progress via unique token links

---

## Features

### Public Website

| Feature | Description |
|---------|-------------|
| **Hero Section** | Animated hero with profile image, tagline, and CTAs |
| **Skills Section** | Interactive 3D-tilt skill cards with technology icons |
| **Projects Gallery** | Filterable project showcase with category/status/year filters |
| **Project Case Studies** | Detailed project pages with rich text descriptions, image galleries, and tech stacks |
| **Blog** | Full-featured blog with search, category filters, and related posts |
| **Services** | Service offerings with pricing and descriptions |
| **Contact Form** | Professional inquiry form with project type, budget, and timeline |
| **About Page** | Personal journey timeline, values, and specialties |

### Admin Dashboard

| Feature | Description |
|---------|-------------|
| **Authentication** | Secure login/signup with Supabase Auth |
| **Dashboard Overview** | Stats cards, recent contacts, and quick actions |
| **Projects CRUD** | Create, edit, delete projects with TipTap rich text editor |
| **Blog CRUD** | Manage blog posts with rich text editing |
| **Contact Management** | View and respond to contact submissions |
| **Services Management** | Add/edit service offerings |
| **Site Settings** | Dynamic content configuration |
| **Client Portal Management** | Create and manage client projects |

### Client Portal

| Feature | Description |
|---------|-------------|
| **Token-Based Access** | Clients access their portal via unique URL (no login required) |
| **Project Overview** | View project details, status, and progress |
| **Task Tracking** | See tasks with status indicators |
| **Updates Timeline** | View project updates, milestones, and feedback requests |
| **File Deliverables** | Download project files and deliverables |

---

## Tech Stack

### Frontend
- **Next.js 15** — App Router, Server Components, Server Actions
- **React 19** — Latest features including use hook
- **TailwindCSS v4** — Utility-first styling with CSS variables
- **shadcn/ui** — Accessible component library
- **TipTap** — Headless rich text editor
- **Lucide Icons** — Beautiful icon library

### Backend
- **Supabase** — PostgreSQL database, authentication, and Row Level Security
- **Server Actions** — Type-safe server mutations

### Animations
- **CSS Animations** — Fade-up, scale, slide effects
- **Intersection Observer** — Scroll-triggered reveals

---

## Project Structure

```plain
├── app/
│   ├── (public)/              # Public routes with main layout
│   │   ├── page.tsx           # Home page
│   │   ├── about/             # About page
│   │   ├── projects/          # Projects listing & case studies
│   │   ├── blog/              # Blog listing & articles
│   │   └── contact/           # Contact form
│   ├── admin/                 # Protected admin dashboard
│   │   ├── page.tsx           # Dashboard overview
│   │   ├── projects/          # Projects management
│   │   ├── blog/              # Blog management
│   │   ├── contacts/          # Contact submissions
│   │   ├── services/          # Services management
│   │   ├── settings/          # Site settings
│   │   └── clients/           # Client portal management
│   ├── auth/                  # Authentication pages
│   │   ├── login/
│   │   └── sign-up/
│   ├── portal/                # Client portal (token-based)
│   │   └── [token]/
│   └── layout.tsx             # Root layout
├── components/
│   ├── admin/                 # Admin dashboard components
│   ├── home/                  # Home page sections
│   ├── layout/                # Header, footer, navigation
│   ├── portal/                # Client portal components
│   ├── projects/              # Project-related components
│   ├── blog/                  # Blog-related components
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── supabase/              # Supabase client utilities
│   ├── types.ts               # TypeScript interfaces
│   └── utils.ts               # Utility functions
├── scripts                    # Database migration scripts
└── proxy.ts                   # Supabase auth proxy
```

---

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `projects` | Portfolio projects with rich descriptions, tech stacks, and gallery images |
| `blog_posts` | Blog articles with categories, tags, and featured images |
| `services` | Service offerings with pricing |
| `contact_submissions` | Contact form submissions |
| `skills` | Skills/technologies for the skills section |
| `site_settings` | Dynamic site configuration |

### Client Portal Tables

| Table | Description |
|-------|-------------|
| `client_projects` | Client project records with unique access tokens |
| `client_tasks` | Project tasks with status tracking |
| `client_updates` | Project updates and communications |
| `client_files` | Deliverable files for clients |

### Row Level Security

All tables are protected with RLS policies:
- **Public Read** — Anyone can read published content
- **Admin Write** — Only authenticated users can modify data
- **Client Access** — Clients can only access their own portal data

---

## Installation

### Prerequisites

- Node.js 18+
- Supabase account
- Git

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/personal-brand-platform.git
   cd personal-brand-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Connect Supabase**
   - Create a new Supabase project
   - Connect via the v0 integrations panel or manually add environment variables

4. **Set up environment variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

5. **Run database migrations**
   Execute the SQL scripts in order:
   ```plain
   scripts/001_create_database_schema.sql
   scripts/002_enable_rls_policies.sql
   scripts/003_seed_initial_data.sql
   scripts/004_add_gallery_images_column.sql
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Create admin account**
   Navigate to `/auth/sign-up` and create your admin account

---

## Usage Guide

### Managing Content

1. **Login** to the admin dashboard at `/admin`
2. **Add Projects** with rich descriptions, gallery images, and tech stacks
3. **Write Blog Posts** using the TipTap rich text editor
4. **Configure Services** and pricing
5. **Update Site Settings** for hero content and contact info

### Client Portal

1. **Create a Client Project** in `/admin/clients/new`
2. **Add Tasks** to track project progress
3. **Post Updates** to keep clients informed
4. **Upload Files** for deliverables
5. **Share the Portal Link** — Copy the unique URL for your client

### Customization

- **Colors** — Edit CSS variables in `app/globals.css`
- **Content** — Update site settings in the admin dashboard
- **Components** — Modify components in the `/components` directory

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` | Auth redirect URL (development) | No |

---

## Security

- **Row Level Security (RLS)** — All database tables are protected
- **Server-Side Authentication** — Auth checks on protected routes
- **Token-Based Client Access** — Secure, unique URLs for client portals
- **Input Validation** — Form validation on all inputs
- **HTTPS Only** — Enforced in production

---

## Performance

- **Server Components** — Reduced client-side JavaScript
- **Static Generation** — Blog and project pages pre-rendered
- **Image Optimization** — Next.js Image component with lazy loading
- **Code Splitting** — Automatic route-based splitting
- **CSS-in-JS Free** — TailwindCSS for minimal CSS overhead

---

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables
4. Deploy

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Author

**Yousief Sameh**

---

## Acknowledgments

- [Next.js](https://nextjs.org) — The React framework
- [Supabase](https://supabase.com) — Open source Firebase alternative
- [TailwindCSS](https://tailwindcss.com) — Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com) — Beautiful component library
- [TipTap](https://tiptap.dev) — Headless rich text editor
- [Lucide](https://lucide.dev) — Beautiful icons

---

<p align="center">
  Built with passion by <strong>Yousief Sameh</strong><br/>
  <em>"Age Is Not A Bug — It's A Feature"</em>
</p>
