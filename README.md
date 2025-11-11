# Cabinet BOM Expense Tracker

A comprehensive expense tracking system designed for cabinet makers to manage projects, Bills of Material (BOM), and team expense claims with real-time collaboration.

## Features

### For Cabinet Business Owners
- **Project Management**: Create and manage cabinet projects with client details
- **BOM Creation**: Build detailed Bills of Material with materials, labor, and services
- **Quote Generation**: Generate professional PDF quotes instantly
- **WhatsApp Integration**: Share quotes directly with clients via WhatsApp
- **Expense Approval**: Review and approve/reject staff expense claims
- **Payment Settlement**: Record payment details and track settled expenses
- **Real-time Analytics**: Dashboard with budget tracking and project insights

### For Staff Members
- **Project Access**: View assigned projects and their BOMs
- **Expense Claims**: Submit expense claims with receipt uploads
- **Budget Tracking**: See available budget per BOM item
- **Claim Status**: Track pending, approved, and paid claims
- **Receipt Management**: Upload multiple receipts (images/PDFs) per claim

### Security & Validation
- **Duplicate Prevention**: Staff cannot claim the same item twice simultaneously
- **Budget Control**: Claims exceeding budget require owner approval
- **Role-based Access**: Owner, Manager, and Staff roles with appropriate permissions
- **Firebase Authentication**: Secure user authentication and authorization
- **Receipt Storage**: Secure cloud storage for all receipt uploads

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Backend**: Firebase (Firestore + Authentication + Storage)
- **PDF Generation**: jsPDF
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Routing**: React Router v6

## Prerequisites

- Node.js 18+ and npm
- Firebase account (free tier is sufficient)
- Modern web browser

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "cabinet-bom-tracker")
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Firebase Services

#### Authentication
1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** authentication
3. Click "Save"

#### Firestore Database
1. Go to **Firestore Database** > **Create database**
2. Choose **Start in production mode**
3. Select a location closest to you
4. Click "Enable"

#### Create Firestore Security Rules
Go to **Firestore Database** > **Rules** and paste:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Projects collection
    match /projects/{projectId} {
      allow read: if request.auth != null && (
        resource.data.createdBy == request.auth.uid ||
        request.auth.uid in resource.data.assignedStaff ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['owner', 'manager']
      );
      allow create: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['owner', 'manager'];
      allow update, delete: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['owner', 'manager'];
    }

    // BOM Items collection
    match /bomItems/{itemId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['owner', 'manager'];
    }

    // Expense Claims collection
    match /expenseClaims/{claimId} {
      allow read: if request.auth != null && (
        resource.data.claimedBy == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['owner', 'manager']
      );
      allow create: if request.auth != null && request.resource.data.claimedBy == request.auth.uid;
      allow update: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['owner', 'manager'];
    }
  }
}
\`\`\`

#### Storage
1. Go to **Storage** > **Get started**
2. Choose **Start in production mode**
3. Click "Next" and "Done"

#### Create Storage Security Rules
Go to **Storage** > **Rules** and paste:

\`\`\`javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /receipts/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
\`\`\`

### 3. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the **Web** icon (\`</>\`)
4. Register your app (name: "Cabinet BOM Tracker")
5. Copy the \`firebaseConfig\` object

### 4. Configure Environment Variables

1. In the project root, copy \`.env.example\` to \`.env\`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. Open \`.env\` and paste your Firebase config values:
   \`\`\`env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   \`\`\`

## Installation

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Start development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open your browser**:
   Navigate to \`http://localhost:5173\`

## First-Time Setup

1. **Register the Owner Account**:
   - Click "Register" on the login page
   - Fill in your details
   - Select "Owner" as role
   - Create account

2. **Create Your First Project**:
   - Click "New Project" on the Dashboard or Projects page
   - Enter project and client details
   - Click "Create Project"

3. **Add BOM Items**:
   - Open the project
   - Click "Add Material", "Add Labor", or "Add Service"
   - Enter item details (name, quantity, unit cost, etc.)
   - Click "Add Item"

4. **Generate Quote**:
   - Click "Download PDF" to generate a professional quote
   - Click "Share via WhatsApp" to send to client

5. **Invite Team Members**:
   - Share the app URL with your team
   - They can register with "Staff" or "Manager" role
   - Assign them to projects

## Usage Guide

### Creating a Quote

1. Create a new project with client details
2. Add all materials needed (wood, hardware, etc.)
3. Add labor items (installation hours, finishing, etc.)
4. Add services (delivery, consultation, etc.)
5. Review the totals on the project page
6. Generate PDF quote
7. Share with client via WhatsApp or email

### Staff Claiming Expenses

1. Staff logs in and navigates to their assigned project
2. Views the BOM items available
3. Clicks "New Claim" on Expense Claims page
4. Selects project and BOM item
5. Enters claim amount (validated against budget)
6. Adds description
7. Uploads receipt photos/PDFs
8. Submits claim

### Owner Approving Claims

1. Dashboard shows pending claims count
2. Navigate to Expense Claims page
3. Review claim details and receipts
4. Click "Approve" to approve or add rejection reason and click "Reject"
5. For approved claims, click "Settle Payment"
6. Enter payment method, date, and reference
7. System marks claim as paid and updates project totals

## Project Structure

\`\`\`
src/
├── components/
│   ├── ui/              # Reusable UI components (Button, Card, etc.)
│   ├── layout/          # Layout components (Header, Navigation)
│   └── modals/          # Modal dialogs
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication hook
│   ├── useProjects.ts   # Projects management
│   ├── useBOMItems.ts   # BOM items management
│   └── useExpenseClaims.ts # Expense claims management
├── lib/                 # Utilities and configurations
│   ├── firebase.ts      # Firebase initialization
│   ├── utils.ts         # Helper functions
│   └── pdfGenerator.ts  # PDF quote generator
├── pages/               # Page components
│   ├── Dashboard.tsx
│   ├── Projects.tsx
│   ├── ProjectDetail.tsx
│   └── ExpenseClaims.tsx
├── store/               # State management
├── types/               # TypeScript type definitions
└── App.tsx              # Main app component
\`\`\`

## Building for Production

\`\`\`bash
npm run build
\`\`\`

The build output will be in the \`dist/\` directory. Deploy this to your hosting provider (GitHub Pages, Firebase Hosting, Vercel, Netlify, etc.).

### Deploy to GitHub Pages (Easiest)

GitHub Pages is the fastest way to get your app online:

1. **First-time setup** (one-time only):
   - Go to your GitHub repository
   - Click **Settings** → **Pages**
   - Under "Source", select **Deploy from a branch**
   - Under "Branch", select **gh-pages** and **/ (root)**
   - Click **Save**

2. **Deploy** (run this anytime you want to update):
   \`\`\`bash
   npm run deploy
   \`\`\`

3. **Access your app**:
   - Your app will be live at: \`https://LuxusEle.github.io/bom\`
   - It takes 1-2 minutes for GitHub to publish after deploying

4. **Update anytime**:
   - Make changes to your code
   - Run \`npm run deploy\` again
   - GitHub Pages updates automatically

**Note:** Your Firebase configuration (.env file) is not deployed to GitHub Pages for security. The app will use the Firebase config you set up locally.

### Deploy to Firebase Hosting

1. Install Firebase CLI:
   \`\`\`bash
   npm install -g firebase-tools
   \`\`\`

2. Login to Firebase:
   \`\`\`bash
   firebase login
   \`\`\`

3. Initialize Firebase:
   \`\`\`bash
   firebase init hosting
   \`\`\`
   - Select your Firebase project
   - Set public directory to: \`dist\`
   - Configure as single-page app: Yes
   - Set up automatic builds with GitHub: No

4. Build and deploy:
   \`\`\`bash
   npm run build
   firebase deploy
   \`\`\`

## Troubleshooting

### "Permission denied" errors
- Check Firebase Security Rules are correctly set
- Ensure user is logged in
- Verify user role is correct in Firestore

### Receipt uploads failing
- Check Firebase Storage is enabled
- Verify Storage Security Rules
- Check file size limits (max 10MB recommended)

### Claims not appearing
- Check project assignments for staff members
- Verify Firestore Security Rules
- Check browser console for errors

## Support

For issues or questions:
1. Check Firebase Console for errors
2. Review browser console for debugging info
3. Verify all environment variables are set correctly

## License

MIT License - feel free to use this for your cabinet business!

---

**Built with ❤️ for cabinet makers**
