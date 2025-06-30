# Hirera

Welcome to Hirera, your all-in-one solution for managing job applications and tracking your career progress. Built with the latest technologies, this dashboard provides a seamless and intuitive experience for job seekers.

![Hirera](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=for-the-badge&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-06B6D4?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎯 **Core Functionality**
- **Job Application Management**: Complete CRUD operations for job applications
- **Status Tracking**: Track application status from applied to offer/rejection
- **Priority Management**: Set priority levels for applications
- **Company & Contact Management**: Store company details and contact information
- **Salary Tracking**: Record and analyze salary ranges across applications

### 📊 **Analytics & Insights**
- **Success Rate Analysis**: Track your application success metrics
- **Response Time Analytics**: Monitor how long companies take to respond
- **Status Distribution**: Visual breakdown of application statuses
- **Company Analytics**: See which companies you've applied to most
- **Tag Analytics**: Track skills and technologies across applications

### 🔐 **Authentication & Security**
- **NextAuth.js Integration**: Secure authentication system
- **User Isolation**: Each user only sees their own data
- **Password Hashing**: Secure password storage with bcrypt
- **JWT Tokens**: Stateless authentication with JSON Web Tokens

### 📱 **Mobile-First Design**
- **Responsive Layout**: Works perfectly on all device sizes
- **Touch-Friendly Interface**: Optimized for mobile interactions
- **Progressive Web App Ready**: Installable on mobile devices
- **Fast Performance**: Optimized for speed and efficiency

### 🎨 **Modern UI/UX**
- **shadcn/ui Components**: Beautiful, accessible component library
- **Dark/Light Mode**: Automatic theme switching
- **Smooth Animations**: Framer Motion powered transitions
- **Intuitive Navigation**: Easy-to-use interface design

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/hirera.git
   cd hirera
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   NEXTAUTH_SECRET=your-super-secret-key-here-at-least-32-characters-long
   NEXTAUTH_URL=http://localhost:3000
   DATABASE_URL=file:./dev.db
   ```

4. **Initialize the database**
   ```bash
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Tech Stack

### **Frontend**
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern component library
- **Framer Motion**: Animation library
- **Recharts**: Data visualization

### **Backend**
- **Next.js API Routes**: Serverless API endpoints
- **Prisma**: Modern database ORM
- **SQLite**: Development database (easily replaceable)
- **NextAuth.js**: Authentication solution

### **Development Tools**
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Git**: Version control

## 📁 Project Structure

```
job-tracker/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   └── dashboard/         # Main application
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   └── providers/         # Context providers
│   ├── lib/                   # Utility libraries
│   ├── services/              # Business logic services
│   └── types/                 # TypeScript type definitions
├── prisma/                    # Database schema and migrations
├── public/                    # Static assets
└── docs/                      # Documentation
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js | ✅ |
| `NEXTAUTH_URL` | Base URL of your application | ✅ |
| `DATABASE_URL` | Database connection string | ✅ |

### Database Setup

The application uses Prisma with SQLite for development. To use a different database:

1. Update the `DATABASE_URL` in your `.env.local`
2. Modify the `provider` in `prisma/schema.prisma`
3. Run `npx prisma db push` to apply changes

## 📊 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/signin` - Sign in user
- `GET /api/auth/test-login` - Development test login

### Job Applications
- `GET /api/jobs` - Get user's job applications
- `POST /api/jobs` - Create new job application
- `GET /api/jobs/[id]` - Get specific job application
- `PUT /api/jobs/[id]` - Update job application
- `DELETE /api/jobs/[id]` - Delete job application

### Analytics
- `GET /api/analytics` - Get user's analytics data

## 🧪 Development

### Running Tests
```bash
npm run test
# or
yarn test
```

### Linting & Formatting
```bash
npm run lint
npm run format
```

### Database Operations
```bash
# Apply schema changes
npx prisma db push

# Generate Prisma client
npx prisma generate

# Reset database
npx prisma db push --force-reset
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Set environment variables
4. Deploy!

### Docker
```bash
# Build image
docker build -t jobtracker-pro .

# Run container
docker run -p 3000:3000 jobtracker-pro
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Prisma](https://prisma.io/) - Database toolkit
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Contact the maintainers

---

**Made with ❤️ by Mitchell Wills**
