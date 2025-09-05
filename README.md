# Bike Violation System

A Next.js application for managing bike violations with user registration and authentication system built using shadcn/ui components.

## Features

- **User Registration**: Complete user registration form with validation
- **User Authentication**: Login system with credential verification
- **Dashboard Layout**: Professional dashboard with navbar and responsive design
- **My Cases Table**: Comprehensive violations table with filtering and sorting
- **Case History Page**: View complete history of resolved and dismissed cases
- **Proof Viewer**: Display images and videos from admin/officers with zoom, rotation, and gallery features
- **Case Management**: View detailed violation information and take actions
- **Dashboard Components**: Reusable components for consistent UI
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **Form Validation**: Client-side validation using react-hook-form and zod
- **Modern UI**: Beautiful components from shadcn/ui
- **Navigation**: Breadcrumbs and intuitive navigation system

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Form Handling**: react-hook-form with zod validation
- **Icons**: Lucide React

## Getting Started

First, install the dependencies:

```bash
npm install
```

Configure environment variables (create a `.env.local` in project root):

```bash
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=bike_violation
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Application Structure

### Pages

- `/` - Home page with system overview
- `/register` - User registration page
- `/login` - User login page
- `/dashboard` - Protected dashboard for authenticated users
- `/dashboard/violations` - My Cases table with violation management
- `/dashboard/history` - Case History page with resolved/dismissed cases

### Components

- `RegisterForm` - Registration form with validation
- `LoginForm` - Login form with validation
- `DashboardLayout` - Main dashboard layout wrapper
- `DashboardNavbar` - Top navigation with user menu and search
- `DashboardStats` - Statistics cards for key metrics
- `RecentActivity` - Activity feed component
- `PageHeader` - Consistent page headers with actions
- `Breadcrumbs` - Navigation breadcrumbs
- `ViolationsTable` - Comprehensive violations table with filtering
- `ViolationDetailsModal` - Detailed violation view with actions
- `ViolationsOverview` - Dashboard widget for violations summary
- `CaseHistoryTable` - Historical cases table with sorting and filtering
- `CaseDetailsModal` - Detailed case history view with timeline
- `CaseHistoryFilters` - Advanced filtering for case history
- `ProofViewer` - Full-featured evidence viewer with zoom, rotation, and gallery
- `ProofLauncher` - Launch button for evidence viewer with file count
- `ProofGallery` - Thumbnail gallery for evidence navigation
- `ProofDetails` - Evidence metadata and information panel
- UI Components from shadcn/ui (Button, Card, Form, Input, Label, Avatar, etc.)

### Authentication System

The application uses a simple localStorage-based authentication system for demonstration purposes. In a production environment, you would replace this with:

- JWT tokens
- Secure HTTP-only cookies
- Backend API authentication
- Database user storage

### Current Authentication Flow

1. **Registration**: Users fill out the registration form, data is validated and stored in localStorage
2. **Login**: Users authenticate with email/password, credentials are verified against localStorage
3. **Session Management**: Authentication state is maintained in localStorage
4. **Protected Routes**: Dashboard requires authentication, redirects to login if not authenticated
5. **Logout**: Clears authentication data and redirects to home

### Data Storage

Now powered by MongoDB via the Node driver. API routes under `src/app/api/**` are dynamic (`export const dynamic = "force-dynamic"`) and perform CRUD against MongoDB collections.

## Development

### Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home page
│   ├── register/
│   │   └── page.tsx          # Registration page
│   ├── login/
│   │   └── page.tsx          # Login page
│   └── dashboard/
│       ├── page.tsx          # Dashboard home page
│       └── violations/
│           └── page.tsx      # My Cases table
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── dashboard/            # Dashboard layout components
│   │   ├── dashboard-layout.tsx
│   │   ├── dashboard-navbar.tsx
│   │   ├── dashboard-stats.tsx
│   │   ├── page-header.tsx
│   │   ├── breadcrumbs.tsx
│   │   ├── recent-activity.tsx
│   │   └── violations-overview.tsx
│   ├── violations/           # Violations components
│   │   ├── violations-table.tsx
│   │   └── violation-details-modal.tsx
│   ├── history/              # Case history components
│   │   ├── case-history-table.tsx
│   │   ├── case-details-modal.tsx
│   │   └── case-history-filters.tsx
│   ├── proof/                # Evidence viewer components
│   │   ├── proof-viewer.tsx
│   │   ├── proof-launcher.tsx
│   │   ├── proof-gallery.tsx
│   │   └── proof-details.tsx
│   ├── register-form.tsx     # Registration form component
│   └── login-form.tsx        # Login form component
├── types/
│   └── violation.ts          # Violation types and mock data
└── contexts/
    └── auth-context.tsx      # Authentication context (unused currently)
```

### Testing the Application

1. **Registration Flow**:

   - Go to `/register`
   - Fill out the form with valid data
   - Submit to create account
   - Redirected to login page

2. **Login Flow**:

   - Go to `/login`
   - Use credentials from registration
   - Submit to authenticate
   - Redirected to dashboard

3. **Dashboard Access**:

   - Only accessible when logged in
   - Shows user information
   - Provides logout functionality

4. **Case History Access**:
   - Navigate to Case History from dashboard
   - View resolved and dismissed cases
   - Filter by status, type, priority, and date range
   - Export case data to CSV
   - View detailed case information with timeline

## Production Considerations

For production deployment, consider implementing:

1. **Backend API**: Replace localStorage with proper database and API
2. **Security**: Implement proper authentication with JWT tokens
3. **Validation**: Add server-side validation
4. **Password Security**: Hash passwords (bcrypt, etc.)
5. **Session Management**: Implement proper session handling
6. **Error Handling**: Add comprehensive error handling
7. **Testing**: Add unit and integration tests
8. **Deployment**: Configure for production deployment

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
