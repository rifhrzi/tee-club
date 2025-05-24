# 🎨 Authentication Loading System

A comprehensive loading animation and intro screen system for the Tee Club e-commerce application that provides smooth user experience during authentication initialization.

## ✨ Features

### 1. **App-wide Auth Loading Screen**
- Shows immediately when the app starts
- Beautiful gradient background with animated elements
- Branded with Tee Club logo and colors
- Prevents flash of unauthenticated content (FOUC)
- Smooth fade-in/fade-out transitions

### 2. **Multiple Loading Variants**
- **Branded**: Full Tee Club experience with logo and gradient
- **Skeleton**: Content placeholders for smooth loading
- **Minimal**: Simple spinner for small components
- **Default**: Standard loading with customizable options

### 3. **Auth Guard Protection**
- Automatic authentication checking
- Smooth redirects to login pages
- Loading states during auth verification
- Support for protected routes

### 4. **Smart State Management**
- Minimum loading time for smooth UX
- Prevents jarring quick flashes
- Handles both SSR and client-side navigation
- Graceful error handling

## 🚀 Components

### AuthLoadingScreen
Main intro screen with branded animation:
```tsx
<AuthLoadingScreen 
  isLoading={true}
  onComplete={() => console.log('Ready!')}
  message="Initializing..."
/>
```

### AuthProvider
Context provider that manages auth state:
```tsx
<AuthProvider showLoadingScreen={true} minLoadingTime={1500}>
  {children}
</AuthProvider>
```

### AuthGuard
Protects routes and shows loading states:
```tsx
<AuthGuard 
  requireAuth={true}
  redirectTo="/login"
  loadingMessage="Checking permissions..."
>
  <ProtectedContent />
</AuthGuard>
```

### PageLoader
Flexible loading component with variants:
```tsx
<PageLoader 
  variant="branded"
  message="Loading content..."
  fullScreen={true}
/>
```

## 🎯 Usage Examples

### Protecting a Page
```tsx
export default function CheckoutPage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login?redirect=/checkout">
      <CheckoutContent />
    </AuthGuard>
  );
}
```

### Using in Layout
```tsx
<Layout showLoadingScreen={true} requireAuth={false}>
  {children}
</Layout>
```

### Custom Loading Hook
```tsx
const { isLoading, showLoader, hideLoader, PageLoader } = usePageLoader();

// Show loading
showLoader("Processing payment...");

// Hide loading
hideLoader();
```

## 🔧 Configuration

### Minimum Loading Time
Prevents jarring quick flashes:
```tsx
<AuthProvider minLoadingTime={1500}> // 1.5 seconds minimum
```

### Custom Fallbacks
```tsx
<AuthGuard 
  fallback={<CustomLoadingComponent />}
  loadingMessage="Custom message..."
>
```

## 🎨 Styling

The system uses Tailwind CSS with:
- Gradient backgrounds (`from-blue-50 to-indigo-100`)
- Smooth animations (`transition-all duration-600`)
- Responsive design (`sm:px-6 lg:px-8`)
- Branded colors (blue/indigo theme)

## 🔄 Flow Diagram

```
App Start → AuthProvider → AuthLoadingScreen → Auth Check → Content
    ↓              ↓              ↓              ↓           ↓
  Immediate    Context Setup   Branded Intro   Session     Main App
   Display      & State       Animation      Validation   Rendered
```

## 🛡️ Security Features

- No sensitive data exposed during loading
- Secure session validation
- Proper redirect handling
- CSRF protection maintained

## 📱 Mobile Responsive

- Touch-friendly animations
- Optimized for mobile viewports
- Reduced motion for accessibility
- Fast loading on slow connections

## 🧪 Testing

Visit `/demo/loading` to test all loading variants and auth states.

## 🎯 Benefits

1. **Professional UX**: Smooth, branded loading experience
2. **No FOUC**: Prevents jarring content flashes
3. **Better Perceived Performance**: Users see immediate feedback
4. **Consistent Branding**: Tee Club identity throughout
5. **Accessibility**: Proper loading states for screen readers
6. **Mobile Optimized**: Works great on all devices

## 🔧 Troubleshooting

### Loading Screen Stuck
- Check NextAuth configuration
- Verify session provider setup
- Check browser console for errors

### Auth Guard Not Working
- Ensure AuthProvider wraps the component
- Check redirect URLs are correct
- Verify authentication state

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check for conflicting CSS
- Verify responsive classes are working

## 🎨 Customizing the Intro Animation

Edit `components/AuthLoadingScreen.tsx` to customize:

### Background Colors
```tsx
background: 'linear-gradient(135deg, #your-color1 0%, #your-color2 100%)'
```

### Logo and Branding
```tsx
<span className="text-3xl font-bold text-white">YourBrand</span>
<h1 className="mt-6 text-4xl font-bold tracking-wide">Your App Name</h1>
```

### Animation Timing
```tsx
// Intro duration (line ~25)
}, 800); // Change to your preferred intro time

// Fade out duration (line ~35)
}, 600); // Change to your preferred fade time
```

### Minimum Loading Time
```tsx
// In AuthProvider (line ~35)
minLoadingTime = 2000 // 2 seconds instead of 1.5
```
