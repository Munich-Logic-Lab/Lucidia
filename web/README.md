# Lucidia Web Application

The front-end for Lucidia, an expressive journaling and dream visualization platform. Built with Next.js 15 and React 19, it provides an intuitive interface for recording, visualizing, and exploring dream experiences.

## Features

- **Real-time Dream Recording**: Capture dream narratives through voice or text
- **AI-Guided Conversation**: Natural dialogue to extract visual details
- **Interactive 3D Visualization**: Explore dream scenes in an immersive 3D environment
- **User Authentication**: Secure account system with multiple login options
- **Responsive Design**: Optimized experience across desktop and mobile devices

## Installation

```bash
# Install dependencies
pnpm i

# Run development server
pnpm dev
```

## Key Technologies

- **Next.js 15**: Advanced React framework with server components
- **React 19**: Latest React features for optimal performance
- **Tailwind CSS**: Utility-first styling framework
- **shadcn/ui**: High-quality component system
- **Three.js**: 3D rendering for dream visualizations
- **Gaussian Splats**: Advanced 3D point cloud rendering
- **OpenAI Integration**: Real-time API for voice processing and conversation

## Project Structure

- **`/src/app`**: Next.js app router directories
- **`/src/components`**: UI components organized by function
  - `/custom`: Application-specific components
  - `/ui`: Generic UI components from shadcn/ui
  - `/icons`: SVG icons as React components
- **`/src/hooks`**: Custom React hooks
- **`/src/lib`**: Utility functions and configurations
- **`/src/routes`**: Type-safe routing system
- **`/src/styles`**: Global styles and theme configuration

## SVG to React Component Conversion

To convert SVG files to React components:

1. Place your SVG files in the `/public/icons/` directory
2. Run the following command:

```bash
npx @svgr/cli --out-dir src/components/icons/generated --typescript -- ./public/icons/YourIcon.svg
```

For batch conversion of multiple SVGs:

```bash
npx @svgr/cli --out-dir src/components/icons/generated --typescript -- ./public/icons/*.svg
```

3. Import and use in your components:

```tsx
import { YourIcon } from "@/components/icons";
```

## Authentication System

The application uses a custom authentication system with:

- Email/password login
- GitHub social login
- Password reset functionality
- Profile management

Email verification is currently disabled for development convenience.

## Development

Run the development server with:

```bash
# Standard development
pnpm dev
```
