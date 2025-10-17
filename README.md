# Delivr Dashboard

A modern web interface for the DOTA (DevOps Toolkit Application) platform, enabling seamless application deployment and release management.

## 🚀 Quick Setup

### Prerequisites
- Node.js 18.18.0 (exact version required)
- pnpm 10.17.0+

### Installation & Development

```bash
# Install pnpm (if not already installed)
npm install -g pnpm

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration values
```

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```bash

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Backend API Configuration  
DELIVR_BACKEND_URL=http://localhost:3010

```

**Required Configuration:**
- **SESSION_SECRET**: Generate with `openssl rand -base64 32`
- **GOOGLE_CLIENT_ID/SECRET**: From Google Cloud Console OAuth setup
- **DELIVR_BACKEND_URL**: URL of your local Delivr Backend server

### Backend Setup
Before running the dashboard, you'll need the Delivr Backend running locally.

📖 **[Backend Setup Guide](https://github.com/your-org/delivr-backend/blob/main/README.md)** - Follow the server documentation to run the backend locally.

### Start Development

```bash
# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Additional Commands

```bash
# Run tests
pnpm test

# Run linting
pnpm lint

# Type checking
pnpm typecheck

# Generate routes and config
pnpm gen:routes && pnpm gen:config
```

## 📱 How to Use Delivr

### 🎯 What You Can Do

**Deploy your mobile apps effortlessly** - Push updates to users without app store delays. Perfect for React Native apps.

### 🚀 Getting Started (5 Minutes)

#### Step 1: Install Delivr SDK in Your Mobile App

Integrate the SDK into your app to enable over-the-air updates. 
// sdk docs link

#### Step 2: Set Up Your Dashboard Account
- Sign in with your Google account
- Create your organization (company workspace)
- Create your first app inside the organization
- Generate deployment keys for your app

#### Step 3: Configure Your App with Deployment Keys
- Copy the deployment keys from the dashboard
- **Important**: Burn these keys into your mobile app code
- Release your app to App Store/Play Store with the embedded keys
- Now you're ready to send CodePush updates!

#### Step 4: Deploy Updates
You can send CodePush updates in two ways:
- **Web Dashboard**: Upload and deploy directly through this interface
- **Delivr CLI**: Deploy from your terminal/CI pipeline // CI docs link

The dashboard shows **all deployments** regardless of how they were sent.

### 📋 Common Workflows

#### 🔄 **Deploying a New CodePush Update**
```
Your workflow: Code → Build → Upload to Delivr → Deploy
```
1. **Make Changes**: Update your React Native code (JS/assets only)
2. **Choose Deployment Method**:
   - **Web Dashboard**: Upload bundle directly through the UI
   - **CLI**: Use  command from your build pipeline // Ci docs link
3. **Target Deployment**: Select which deployment key to push to
4. **Monitor**: Track and update adoption and rollout progress in the dashboard


#### 🔧 **Managing Multiple Deployment Keys**
- **Staging Deployment**: For internal testing and QA
- **Production Deployment**: Live updates to end users



Each deployment key represents a different update channel for your app.

### 💡 Key Benefits

- **⚡ Instant Updates**: Deploy bug fixes and features without waiting for app store approval
- **🎯 Targeted Releases**: Deploy to specific user segments or regions
- **🔄 Easy Rollbacks**: Instantly revert to previous versions if issues arise
- **📊 Real-time Monitoring**: See deployment progress and success rates live
- **🔒 Secure**: Enterprise-grade security with role-based team access

### ❓ Common Questions

**Q: What are deployment keys?**  
A: Secure tokens linked to your app that identify where CodePush updates should be delivered. You generate them in the dashboard, burn them into your app code, and use them to target deployments.

**Q: Do I need to update my app in the store every time?**  
A: No! Once you've released your app to the store with Delivr SDK and deployment keys, you can send JavaScript/asset updates instantly via CodePush without store approval.

**Q: Can I deploy from both dashboard and CLI?**  
A: Yes! The web dashboard shows all deployments whether they came from the UI or CLI. Use whatever fits your workflow better.

**Q: What happens if I need to rollback?**  
A: Deploy a previous working version using the same deployment key. Users will receive the rollback update just like any other CodePush.

**Q: How do deployment keys work with app store releases?**  
A: Deployment keys must be "burnt" (hardcoded) into your app during development. When you release to app stores, those keys are embedded. Later CodePush updates use those same keys to identify your app.

## 🏗️ System Architecture

### Complete Delivr CodePush Ecosystem



### How CodePush Works End-to-End

#### 🔄 **Update Delivery Flow**
1. **App Release**: React Native app with Delivr SDK published to app stores
2. **CodePush Creation**: Developer creates update via Web Dashboard or CLI
3. **Bundle Storage**: Update bundle stored in Delivr infrastructure
4. **Update Check**: Mobile app periodically checks for updates via Delivr Backend
5. **Download & Apply**: App downloads and applies JavaScript/asset updates instantly

#### 🛠️ **Developer Integration Points**
- **Mobile App**: Delivr SDK embedded for OTA update capabilities
- **Web Dashboard**: Visual interface for managing apps, deployments, and monitoring
- **CLI Tool**: Command-line interface for automated CI/CD deployments
- **Backend API**: Central orchestration and bundle management

#### 🌐 **Infrastructure Components**
- **Delivr Backend**: Core API server managing apps, deployments, and update delivery
- **CDN**: Global content delivery network for fast bundle downloads
- **Bundle Storage**: Secure storage for all CodePush update packages
- **Authentication**: OAuth-based secure access control across all components

### Key Benefits of This Architecture
- **Zero App Store Dependency**: Updates bypass store approval process
- **Global Scale**: CDN ensures fast updates worldwide  
- **Unified Management**: Single dashboard shows all deployments (web + CLI)
- **Secure Delivery**: Deployment keys ensure updates reach correct app versions
- **Developer Flexibility**: Multiple deployment methods (manual, automated, CI/CD)

---

**Need Help?** 📚 Visit [DOTA Documentation](https://dota.dreamsportslabs.com/) for detailed guides and API references.
