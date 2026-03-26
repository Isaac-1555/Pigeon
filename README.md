# Pigeon

A mobile-first Expo app for sending customer status update notifications via email.

## Features

- **Fake Login** — Authenticate with any credentials to access the app
- **Customer Dashboard** — View customers and their current process stage
- **Status Notifications** — Send email updates to customers when their status changes
- **Settings** — Manage process steps (add, remove, reorder)

## Tech Stack

- [Expo](https://expo.dev) (SDK 54) with [expo-router](https://docs.expo.dev/router/introduction)
- [NativeWind](https://www.nativewind.dev) + [TailwindCSS](https://tailwindcss.com) for styling
- [EmailJS](https://www.emailjs.com) for transactional email delivery
- [React Native](https://reactnative.dev)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npx expo start
```

3. Scan the QR code with Expo Go, or press `i` for iOS simulator / `w` for web.

If you see issues after adding NativeWind, try clearing the Metro cache:

```bash
npx expo start --clear
```

## App Structure

```
app/
  _layout.tsx          # Root layout with auth routing
  login.tsx            # Login screen (accepts any credentials)
  (tabs)/
    _layout.tsx        # Tab bar: Dashboard | Settings
    index.tsx          # Dashboard: customer list + email sending
    settings.tsx       # Settings: manage process steps
context/
  app-context.tsx      # Shared in-memory state
lib/
  email.ts             # EmailJS integration
  utils.ts             # cn() utility for Tailwind class merging
```

## Email Setup

The app uses [EmailJS](https://www.emailjs.com) for sending emails. Credentials are configured in `lib/email.ts`.

Your EmailJS email template should use these variables:

| Variable | Description |
|----------|-------------|
| `{{to_name}}` | Customer name |
| `{{to_email}}` | Customer email address |
| `{{step_name}}` | Selected process step label |
| `{{from_name}}` | "Pigeon" |

The recipient email must be verified under **Account > Authorized Recipients** in your EmailJS dashboard before sending.

## State Persistence

Currently, all state (customers, steps, auth) is in-memory and resets on app reload. For production, add persistence with [AsyncStorage](https://docs.expo.dev/versions/latest/sdk/preferences/) or a backend database.
