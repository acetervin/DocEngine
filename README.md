# DocEngine

DocEngine is a professional document generation platform that enables users to create, manage, and export business documents including invoices, proposals, and receipts. Built with modern web technologies, it provides a seamless experience for generating formatted, downloadable documents.

## Features

- **Multiple Document Types**: Create invoices, proposals, and receipts
- **Live Preview**: See your document as you edit it
- **PDF Export**: Download documents as PDFs
- **User Authentication**: Secure account management with Supabase
- **Multi-language Support**: Localization context for international users
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ & npm (install with [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd DocEngine

# Install dependencies
npm i

# Start the development server
npm run dev
```

The application will be available at `http://localhost:8080` with hot module reloading enabled.

## Development

### Available Scripts

```sh
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build for development
npm run lint         # Run ESLint
npm run preview      # Preview production build
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode
```

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn-ui & Radix UI
- **Styling**: Tailwind CSS
- **Backend**: Supabase
- **State Management**: TanStack React Query
- **Routing**: React Router
- **Form Handling**: React Hook Form with Zod validation
- **Charting**: Recharts
- **Export**: html2pdf.js for PDF generation
- **Testing**: Vitest & Playwright

## Project Structure

```
src/
├── components/
│   ├── documents/       # Invoice, Proposal, Receipt components
│   ├── layout/          # App layout components
│   └── ui/              # Reusable shadcn-ui components
├── pages/               # Page components
├── contexts/            # React contexts (Auth, Language)
├── hooks/               # Custom React hooks
└── App.tsx             # Main app component
```

## Deployment

The project can be deployed to any Node.js hosting platform. Build the production bundle:

```sh
npm run build
```

The optimized build will be created in the `dist/` directory.

## Contributing

Feel free to submit issues and enhancement requests. When making changes:

1. Create a new branch for your feature
2. Make your changes
3. Test your changes locally
4. Commit and push to your branch
5. Submit a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
