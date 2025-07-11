# Gallery Implementation for New Holy Cross School

## Overview
This implementation provides a demo gallery system for the New Holy Cross School website with the following features:

- **Homepage Gallery**: Shows only 5 images in a horizontal scrolling layout
- **Dedicated Gallery Page**: Shows all images in a grid layout
- **Backend Integration**: Images are stored in MongoDB and served via API
- **Demo Data**: Fallback demo images when backend is not available

## Files Created/Modified

### New Files:
1. `Frontend/gallery.html` - Dedicated gallery page with masonry layout
2. `Gallery-README.md` - This documentation

### Modified Files:
1. `Frontend/index.html` - Updated gallery section with "View All" button
2. `Frontend/js/script.js` - Modified to show only 5 images on homepage
3. `Frontend/css/styles.css` - Added styles for "View All" button

## Features

### Homepage Gallery (5 Images Only)
- Horizontal scrolling with arrow controls
- Shows only the first 5 images from backend
- Fallback to demo images if backend is unavailable
- "View All" button to navigate to full gallery

### Dedicated Gallery Page
- Masonry layout showing all images from backend
- Facebook-style captions that overlay on images
- Responsive design (4 columns on desktop, 3 on tablet, 2 on mobile, 1 on small mobile)
- Loading states and error handling
- Navigation back to homepage

### Backend Integration
- Images stored in MongoDB `gallery` collection
- API endpoint: `/api/gallerys`
- Image upload functionality via admin panel
- Works like other sections (programs, news, etc.)

## Setup Instructions

### 1. Start the Server
```bash
cd Backend
npm start
```

### 2. Access the Website
- Homepage: `http://localhost:3000`
- Gallery Page: `http://localhost:3000/gallery.html`
- Admin Panel: `http://localhost:3000/admin`

### 3. Add Gallery Images
- Use the admin panel to upload gallery images
- Images will automatically appear on both homepage and gallery page

## How It Works

### Homepage Gallery Flow:
1. Frontend loads gallery data from `/api/gallerys`
2. Shows first 5 images from backend
3. Users can scroll horizontally through images
4. "View All" button links to dedicated gallery page

### Dedicated Gallery Page Flow:
1. Loads all gallery images from backend
2. Displays in responsive masonry layout
3. Shows loading spinner while fetching data
4. Handles errors gracefully with user-friendly messages

### Admin Panel Integration:
1. Admin can upload new images via `/admin`
2. Images are stored in `Frontend/Images/` directory
3. Image URLs and captions stored in MongoDB
4. Changes reflect immediately on both homepage and gallery page

## API Endpoints

### GET `/api/gallerys`
- Returns all gallery images
- Public endpoint (no authentication required)
- Response format: `{ data: [{ imageUrl, caption, _id }] }`

### POST `/api/gallerys` (Protected)
- Adds new gallery image
- Requires admin authentication
- Accepts: `{ imageUrl, caption }`

### PUT `/api/gallerys/:id` (Protected)
- Updates existing gallery image
- Requires admin authentication

### DELETE `/api/gallerys/:id` (Protected)
- Deletes gallery image
- Requires admin authentication

## Styling

### Homepage Gallery:
- Horizontal scrolling with smooth animations
- Arrow controls for navigation
- Hover effects on images
- Responsive design

### Dedicated Gallery Page:
- CSS Masonry layout (columns)
- Facebook-style overlay captions
- Hover animations with caption reveal
- Loading states
- Error handling UI

## Browser Compatibility
- Modern browsers with CSS Grid support
- Responsive design for mobile devices
- Graceful degradation for older browsers

## Future Enhancements
- Image lightbox/modal for full-size viewing
- Image categories/filtering
- Lazy loading for better performance
- Image optimization and compression
- Social sharing functionality 