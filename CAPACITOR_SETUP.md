# Capacitor iOS Setup for Signalry

This document explains how to complete the iOS setup for the Signalry app using Capacitor.

## Prerequisites

- **Node.js 22+** (Capacitor CLI requires Node >=22.0.0)
- **Xcode** (latest version recommended)
- **CocoaPods** (for iOS dependencies)

## Current Status

✅ Capacitor dependencies installed
✅ `capacitor.config.ts` created
✅ `vite.config.ts` updated for Capacitor compatibility
✅ Package.json scripts added
✅ .gitignore updated
✅ Production build completed

## Next Steps (Requires Node 22+)

### 1. Upgrade Node.js

First, upgrade your Node.js version to 22 or higher:

```bash
# Using nvm (recommended)
nvm install 22
nvm use 22

# Or using Homebrew on macOS
brew install node@22
```

### 2. Add iOS Platform

Once you have Node 22+, add the iOS platform:

```bash
npx cap add ios
```

This will create an `ios/` directory with your Xcode project.

### 3. Sync Your Web App

Sync your built web app to the iOS project:

```bash
npm run cap:sync
# or
npx cap sync ios
```

### 4. Open in Xcode

Open the iOS project in Xcode:

```bash
npm run open:ios
# or
npx cap open ios
```

### 5. Configure iOS Project in Xcode

Once Xcode opens:

1. **Select your development team**:
   - Click on the project in the left sidebar
   - Select the "Signalry" target
   - Go to "Signing & Capabilities"
   - Select your Apple Developer team

2. **Update Bundle Identifier** (if needed):
   - The bundle ID is set to `com.signalry.app`
   - You can change it in Xcode if needed

3. **Build and Run**:
   - Select a simulator or connected device
   - Click the "Run" button (▶️) or press Cmd+R

## Development Workflow

### Making Changes

After making changes to your React app:

```bash
# 1. Build your web app
npm run build

# 2. Sync changes to iOS
npm run cap:sync

# 3. The changes will be reflected in Xcode automatically
```

Or use the combined command:

```bash
npm run build:ios
```

### Live Reload (Optional)

For faster development, you can configure Capacitor to load from your dev server:

1. Start your dev server:
```bash
npm run dev
```

2. Update `capacitor.config.ts` temporarily:
```typescript
server: {
  url: 'http://localhost:5173',
  cleartext: true
}
```

3. Run `npm run cap:sync`
4. Build and run in Xcode

**Remember to remove the server config before production builds!**

## Available Scripts

- `npm run build:ios` - Build web app and sync to iOS
- `npm run open:ios` - Open project in Xcode
- `npm run cap:sync` - Sync web build to all platforms

## Troubleshooting

### Node Version Error

If you see "The Capacitor CLI requires NodeJS >=22.0.0":
- Upgrade Node.js to version 22 or higher
- Run `node --version` to verify

### iOS Directory Not Found

If `npm run open:ios` fails:
- Make sure you've run `npx cap add ios` first
- Verify the `ios/` directory exists in your project

### Build Errors in Xcode

- Make sure you've selected a development team
- Try cleaning the build: Product → Clean Build Folder
- Run `npx cap sync ios` again

### White Screen on Launch

- Check if the build output exists in `dist/`
- Run `npm run build` to rebuild
- Sync again with `npm run cap:sync`
- Make sure `base: './'` is set in `vite.config.ts`

## App Configuration

The app is configured in `capacitor.config.ts`:

- **App ID**: com.signalry.app
- **App Name**: Signalry
- **Web Directory**: dist (Vite's output)

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor iOS Guide](https://capacitorjs.com/docs/ios)
- [Vite with Capacitor](https://capacitorjs.com/docs/guides/vite)
