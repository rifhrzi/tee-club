# File Upload Implementation for Admin Dashboard

## Overview

This document describes the implementation of file upload functionality for product images in the admin dashboard, replacing the previous URL-only input system with a comprehensive file upload solution.

## Features Implemented

### 1. ImageUpload Component (`components/admin/ImageUpload.tsx`)

**Key Features:**
- **Dual Input Methods**: Toggle between file upload and URL input
- **Drag & Drop Support**: Intuitive drag-and-drop interface for file uploads
- **Image Preview**: Real-time preview of uploaded images
- **File Validation**: 
  - Supported formats: JPEG, PNG, WebP
  - Maximum file size: 5MB per image
  - Maximum images: 10 per product
- **Loading States**: Visual feedback during upload process
- **Error Handling**: Clear error messages for failed uploads
- **Responsive Design**: Mobile-optimized layout with grid system
- **Accessibility**: Proper ARIA labels and keyboard navigation

**Component Props:**
```typescript
interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
  errors?: Record<string, string>;
}
```

### 2. Upload API Endpoint (`app/api/admin/upload/route.ts`)

**Endpoints:**
- `POST /api/admin/upload` - Upload new image files
- `DELETE /api/admin/upload` - Delete uploaded files (optional)

**Security Features:**
- Admin authentication required
- File type validation
- File size limits
- Unique filename generation using UUID
- Directory traversal protection

**File Storage:**
- Local storage in `/public/uploads/products/`
- Automatic directory creation
- UUID-based filenames to prevent conflicts

### 3. Updated Validation Schema (`lib/validation.ts`)

**Enhanced Image Validation:**
- Accepts both URLs and local file paths
- Validates URL format for external images
- Validates local paths starting with `/uploads/`
- Maintains backward compatibility

### 4. Next.js Configuration Updates (`next.config.js`)

**Image Optimization:**
- Added localhost patterns for local uploads
- Support for multiple development ports
- Optimized image serving for uploaded files

## File Structure

```
components/admin/
├── ImageUpload.tsx          # New file upload component
├── ProductFormModal.tsx     # Updated to use ImageUpload
└── ProductImage.tsx         # Existing image display component

app/api/admin/
└── upload/
    └── route.ts            # New upload API endpoint

public/uploads/
└── products/
    └── .gitkeep           # Ensures directory is tracked in git

docs/
└── FILE_UPLOAD_IMPLEMENTATION.md  # This documentation
```

## Usage

### For Administrators

1. **Adding Products with Images:**
   - Navigate to Admin Dashboard
   - Click "Add Product" button
   - In the Product Images section, choose between:
     - **File Upload**: Drag & drop or browse for image files
     - **URL Input**: Enter image URLs manually

2. **File Upload Process:**
   - Select or drag image files (JPEG, PNG, WebP)
   - Files are automatically validated and uploaded
   - Preview appears immediately with upload progress
   - Successfully uploaded images are added to the product

3. **Managing Images:**
   - Remove images by clicking the X button
   - Switch between upload methods anytime
   - View all current images in grid layout

### For Developers

1. **Using the ImageUpload Component:**
```tsx
<ImageUpload
  images={formData.images}
  onImagesChange={(images) => handleInputChange("images", images)}
  maxImages={10}
  disabled={isLoading}
  errors={errors}
/>
```

2. **Handling Upload Responses:**
```typescript
// Successful upload response
{
  success: true,
  url: "/uploads/products/uuid.jpg",
  filename: "uuid.jpg",
  originalName: "original-file.jpg",
  size: 1234567,
  type: "image/jpeg"
}
```

## Technical Implementation Details

### File Upload Flow

1. **Client Side:**
   - User selects files via drag-drop or file input
   - Files are validated (type, size)
   - Preview URLs created using `URL.createObjectURL()`
   - Files uploaded individually to `/api/admin/upload`

2. **Server Side:**
   - Authentication check (admin role required)
   - File validation (type, size, format)
   - Unique filename generation using UUID
   - File saved to `/public/uploads/products/`
   - Response with file URL for database storage

3. **Database Storage:**
   - Image URLs stored in existing `images` array field
   - Supports mix of external URLs and local file paths
   - Backward compatible with existing URL-based images

### Error Handling

- **Client Side**: Visual error indicators, toast notifications
- **Server Side**: Detailed error logging, appropriate HTTP status codes
- **Validation**: Real-time file validation with user feedback

### Performance Considerations

- **Image Optimization**: Next.js automatic image optimization
- **File Size Limits**: 5MB per file to prevent server overload
- **Concurrent Uploads**: Files uploaded sequentially to manage server load
- **Memory Management**: Proper cleanup of preview URLs

## Security Measures

1. **Authentication**: Admin role verification required
2. **File Validation**: Strict file type and size checking
3. **Filename Security**: UUID-based names prevent conflicts and attacks
4. **Directory Protection**: Files stored in controlled public directory
5. **Input Sanitization**: Validation of all file metadata

## Browser Compatibility

- **Modern Browsers**: Full support for drag-drop and file APIs
- **Mobile Devices**: Touch-friendly interface with file selection
- **Accessibility**: Screen reader support and keyboard navigation

## Future Enhancements

1. **Cloud Storage Integration**: AWS S3, Cloudinary, or similar
2. **Image Compression**: Automatic image optimization before upload
3. **Bulk Upload**: Multiple file selection and batch processing
4. **Image Editing**: Basic crop/resize functionality
5. **CDN Integration**: Content delivery network for better performance

## Testing

To test the implementation:

1. Start the development server: `npm run dev`
2. Navigate to `/dashboard` (admin authentication required)
3. Click "Add Product" to open the product form
4. Test both file upload and URL input methods
5. Verify image previews and upload progress
6. Check uploaded files in `/public/uploads/products/`

## Troubleshooting

**Common Issues:**

1. **Upload Fails**: Check file size (max 5MB) and format (JPEG/PNG/WebP)
2. **Images Not Displaying**: Verify Next.js image configuration
3. **Permission Errors**: Ensure write permissions for uploads directory
4. **Authentication Issues**: Verify admin role and session validity

**Debug Information:**
- Check browser console for client-side errors
- Monitor server logs for upload API responses
- Verify file system permissions for uploads directory
