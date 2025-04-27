# Lucidia

bootstrapped nextjs project with template https://github.com/Its-Satyajit/nextjs-typescript-tailwind-shadcn-postgresql-drizzle-orm-better-auth-template

## Installation

```bash
pnpm i

```

## Notices

- deactivated the mendatory email confirmation for signup, so you can log in without confirming your email (so we don't have to setup an email provider)
- uses `@svgr/cli` to turn the svg icons into importable components

## SVG to React Component Conversion

To convert SVG files to React components, we use SVGR. Here's how to do it:

1. Place your SVG files in the `/public/icons/` directory
2. Run the following command:

```bash
npx @svgr/cli --out-dir src/components/icons/generated --typescript -- ./public/icons/YourIcon.svg
```

For batch conversion of multiple SVGs at once:

```bash
npx @svgr/cli --out-dir src/components/icons/generated --typescript -- ./public/icons/*.svg
```

3. Import and use the components:

```tsx
// Then import and use in your components
import { YourIcon } from "@/components/icons";

// Add your new icons to src/components/icons/index.ts
export { default as YourIcon } from "./generated/YourIcon";

// Usage with color control through className:
<YourIcon className="h-6 w-6 text-blue-500" />;
```

The components will automatically inherit text color from their parent element or from the text-\* utility class.
