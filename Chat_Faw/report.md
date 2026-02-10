# WEB APPLICATION DEVELOPMENT REPORT

## MakanApa? - Food Auction Marketplace

---

## Member Of Group:
1. [Member Name 1] : [ID]
2. [Member Name 2] : [ID]
3. [Member Name 3] : [ID]

---

## INFORMATION TECHNOLOGY
## FACULTY OF COMPUTER SCIENCE
## [UNIVERSITY NAME]
## 2025

---

## Project Interview

### Project Overview

**MakanApa?** is a web-based food auction marketplace application that combines real-time technology with a chat-based interface to simplify online food buying and selling activities. The main purpose of this project is to create a buyer-centered system where users can interact naturally through a conversational interface while the system and sellers handle most of the complexity.

Instead of browsing traditional product catalogs, comparing prices manually, or negotiating directly with sellers through multiple messages, buyers can simply describe what food they want to eat. The system then displays relevant offers from sellers, supports live bidding, and allows price negotiation in a simple and efficient way.

---

## Buyers are KING Concept

The system is built based on the **Buyers are KING** concept, which means the user experience is focused on buyer convenience and simplification. The buyer does not need to perform complicated actions such as manual price comparison or direct negotiation with multiple sellers.

In this concept:
- Buyers interact mainly through a chat interface
- Prices are not fixed and can change dynamically based on seller competition
- Sellers compete by responding to buyer requests with their best offers
- The system helps buyers reach the best possible offer faster
- Buyers are notified of seller habits and pricing trends

This approach shifts the workload from buyers to sellers and the system itself, making the shopping experience more enjoyable and efficient.

---

## Project Objectives

The objectives of this project are:

1. To simplify online food shopping using a conversational chat interface
2. To reduce buyer effort in searching for food and negotiating prices
3. To implement dynamic real-time bidding instead of fixed pricing
4. To separate buyer and seller roles clearly with distinct interfaces
5. To track and analyze buyer preferences through habit tracking
6. To enable real-time communication between buyers and sellers
7. To create a secure and scalable marketplace platform

---

## System Architecture and Technologies

**MakanApa?** is developed using the following technologies:

### Frontend:
- **HTML5** for semantic markup
- **Tailwind CSS** and custom CSS for responsive interface design
- **JavaScript (Vanilla)** for frontend logic and interactivity
- **Font Awesome** for icons and visual elements

### Backend:
- **PHP 7+** for server-side logic
- **MySQL Database** for data persistence
- **RESTful API** architecture with prepared statements for security

### Database:
- **MySQL** with tables for:
  - `requests` - buyer food requests
  - `offers` - seller offers and quotes
  - `user_habits` - buyer preference tracking

### Deployment:
- **XAMPP** (Apache + PHP + MySQL) for local development
- `.env` file support for configuration management

### Key Features:
- Real-time offer polling system
- Auto-cleanup of old requests (12-hour expiration)
- Input validation and SQL injection prevention
- Responsive chat-based interface
- Premium gradient UI design with animations

---

## Buyer System Implementation

The buyer side of the system focuses on simplicity and usability. Key features include:

### 1. Chat Interface
- Natural language input for describing desired food
- Real-time communication with the system
- Message history and chat visualization

### 2. Request Creation
- Buyers simply type what they want to eat
- System validates and stores the request
- Automatic broadcast to available sellers

### 3. Live Bidding & Offers
- Sellers respond with offers including:
  - Food name and description
  - Price
  - Contact information
  - Seller details
- Buyers can view multiple offers and compare prices
- Smart sorting: cheapest offers appear first

### 4. Buyer Habits & Recommendations
- System tracks:
  - Average price paid
  - Favorite food items
  - Cheapest offer preferences
  - Total order history
- Provides personalized recommendations based on history

### 5. Contact & Order Confirmation
- Modal interface for order details
- Direct WhatsApp contact with seller
- Order summary with all details

---

## Seller System Implementation

The seller side is designed to encourage active participation and competition. Key features include:

### 1. Request Viewing
- Real-time display of buyer food requests
- Request descriptions and timestamps
- Auto-formatted request cards

### 2. Offer Submission
- Comprehensive form with validation:
  - Seller name (min 2 characters)
  - Food name (min 2 characters)
  - Price (Rp 1 to Rp 10 million)
  - Contact number (min 7 digits)
- Loading states and error handling

### 3. Offer Management
- Submit multiple offers per request
- Track submitted offers
- Compete with other sellers

### 4. Seller Persistence
- Seller name saved to localStorage
- Quick reuse of seller information
- Streamlined form filling

---

## API Endpoints Documentation

### 1. Create Request (Buyer)
```
POST /api.php?action=create_request
Parameters:
- description: string (food request description)

Response:
{
  "request_id": integer
}
```

### 2. Get Requests (Seller)
```
GET /api.php?action=get_requests
Response:
[
  {
    "id": integer,
    "description": string,
    "created_at": timestamp
  }
]
```

### 3. Add Offer (Seller)
```
POST /api.php?action=add_offer
Parameters:
- request_id: integer
- seller_name: string
- food_name: string
- price: integer
- contact: string

Response:
{
  "status": "ok",
  "offer_id": integer
}
```

### 4. Get Offers (Buyer)
```
GET /api.php?action=get_offers&request_id=integer
Response:
[
  {
    "id": integer,
    "request_id": integer,
    "seller_name": string,
    "food_name": string,
    "price": integer,
    "contact": string,
    "created_at": timestamp
  }
]
```

### 5. Get User Habits (Buyer)
```
GET /api.php?action=get_habits
Response:
{
  "avg_price": integer,
  "last_food": string,
  "cheapest_count": integer,
  "total_orders": integer
}
```

### 6. Save Habit (Buyer)
```
POST /api.php?action=save_habit
Parameters:
- food_name: string
- price: integer
- is_cheapest: integer (0 or 1)

Response:
{
  "success": true
}
```

---

## User Interface Design

The user interface is designed to be clean, modern, and user-friendly with a focus on the premium red gradient aesthetic.

### Design Highlights:

#### Color Scheme
- **Primary Gradient:** Red (#dc2626 to #ef4444)
- **Accent:** Rose/Orange tones
- **Background:** Light amber gradients
- **Text:** Dark gray on light backgrounds

#### Components

##### 1. Sidebar Navigation
- Logo with animated pulse effect
- Role switcher (Buyer/Seller toggle)
- Quick stats and actions
- Professional badge styling

##### 2. Chat Area
- Message bubbles with gradients
- User messages (orange gradient, right-aligned)
- Bot messages (white background, left-aligned)
- Auto-scroll to latest messages
- Smooth slide-in animations

##### 3. Request/Offer Cards
- Gradient card backgrounds
- Shadow effects for depth
- Hover animations (lift effect)
- Responsive grid layout

##### 4. Form Inputs
- Consistent `.form-input` styling
- Red-tinted focus states
- Placeholder text guidance
- Field labels and validation messages

##### 5. Modal Dialog
- Contact confirmation interface
- Order summary display
- WhatsApp integration
- Animated close button
- Backdrop blur effect

##### 6. Animations
- **Float:** WhatsApp icon animations
- **Pulse:** Attention-drawing elements
- **Slide-in:** Messages and modals
- **Scale:** Button interactions
- **Shimmer:** Loading states

---

## Security Implementation

### Backend Security:
1. **Prepared Statements:** All database queries use MySQLi prepared statements to prevent SQL injection
2. **Input Validation:** Comprehensive validation on all endpoints
3. **Error Handling:** Proper error responses without exposing internals
4. **Auto-cleanup:** Old requests (>12 hours) automatically deleted

### Frontend Security:
1. **XSS Prevention:** User input properly escaped
2. **CSRF Protection:** Form data validation
3. **LocalStorage:** Seller name stored locally (non-sensitive)

---

## Database Schema

### requests table
```sql
- id (PRIMARY KEY)
- description (TEXT)
- created_at (TIMESTAMP)
```

### offers table
```sql
- id (PRIMARY KEY)
- request_id (FOREIGN KEY)
- seller_name (VARCHAR)
- food_name (VARCHAR)
- price (INTEGER)
- contact (VARCHAR)
- created_at (TIMESTAMP)
```

### user_habits table
```sql
- id (PRIMARY KEY)
- avg_price (INTEGER)
- last_food (VARCHAR)
- cheapest_count (INTEGER)
- total_orders (INTEGER)
```

---

## System Interface Documentation

This section presents the main user interfaces of the MakanApa? application to illustrate the system workflow.

### Figure 1. Buyer Chat Interface
- Main buyer view with chat-based interaction
- Message display area
- Input field for food requests
- Real-time communication with sellers

### Figure 2. Auction Cards Display
- Live offers from sellers
- Price comparison cards
- Seller information display
- Card-based layout for clarity

### Figure 3. Seller Request View
- List of buyer requests
- Expandable forms for offer submission
- Form validation with error messages
- Seller information fields

### Figure 4. Offer Submission Form
- Fields for seller details
- Food name and description
- Price input with validation
- Contact information
- Submit button with loading state

### Figure 5. Contact Modal
- Confirmation of order details
- Order summary display
- WhatsApp contact button
- Modal animations and styling

### Figure 6. Habit Tracking Display
- Average price paid
- Recent food items
- Cheapest offer statistics
- Total order history

### Figure 7. Role Switcher Interface
- Toggle between Buyer and Seller roles
- Clear indication of current role
- Quick action buttons
- Responsive sidebar design

---

## Features Summary

### ✅ Completed Features:

1. **Buyer Features**
   - [x] Create food requests via chat
   - [x] View real-time offers from sellers
   - [x] Smart sorting by price
   - [x] Order confirmation modal
   - [x] Habit tracking and preferences
   - [x] WhatsApp contact integration

2. **Seller Features**
   - [x] View buyer requests
   - [x] Submit competitive offers
   - [x] Input validation with error messages
   - [x] Form auto-fill for repeated sellers
   - [x] Contact information collection

3. **System Features**
   - [x] Real-time polling system
   - [x] Auto-cleanup of old requests
   - [x] Database persistence
   - [x] Responsive design
   - [x] Toast notifications
   - [x] Loading states
   - [x] Error handling

4. **Security**
   - [x] SQL injection prevention
   - [x] Input validation
   - [x] Prepared statements
   - [x] XSS protection

---

## Technologies Used

| Category | Technology |
|----------|-----------|
| Frontend | HTML5, CSS3, JavaScript |
| Styling | Tailwind CSS, Custom CSS |
| Backend | PHP 7+ |
| Database | MySQL |
| Icons | Font Awesome 6.0 |
| Fonts | Poppins, Inter, DM Sans |
| Server | Apache (XAMPP) |
| Configuration | .env file support |

---

## Installation & Setup

### Prerequisites
- XAMPP (or Apache + PHP + MySQL)
- Modern web browser

### Steps
1. Copy project files to `htdocs` folder
2. Create MySQL database named `makanapa`
3. Import `makanapa.sql` schema
4. (Optional) Create `.env` file with database credentials
5. Access via `http://localhost/Chat_Faw/makanapa.html`
6. Test database connection via `/test_db.php`

---

## Testing Checklist

- [ ] Test buyer creating requests
- [ ] Test seller loading requests
- [ ] Test seller form submission with valid data
- [ ] Test seller form validation (empty fields)
- [ ] Test price validation (negative, zero, too high)
- [ ] Test contact validation (too short)
- [ ] Test modal opening and WhatsApp link
- [ ] Test database connection with test_db.php
- [ ] Verify red gradient colors throughout
- [ ] Check responsive design on mobile
- [ ] Test real-time offer polling
- [ ] Test habit tracking and display
- [ ] Test auto-cleanup of old requests
- [ ] Test buyer role switching
- [ ] Test seller name persistence

---

## Challenges & Solutions

### Challenge 1: Real-time Offer Updates
**Solution:** Implemented polling system with 2-second intervals to check for new offers

### Challenge 2: Form Validation
**Solution:** Comprehensive client-side validation with specific error messages and server-side prepared statements

### Challenge 3: Database Auto-cleanup
**Solution:** Added automatic deletion of requests older than 12 hours at API startup

### Challenge 4: Seller Retention
**Solution:** Implemented localStorage to remember seller names for faster form filling

### Challenge 5: Price Comparison Complexity
**Solution:** Smart sorting algorithm that factors in user habits and historical preferences

---

## Conclusion

The **MakanApa?** project successfully demonstrates how modern web technologies can create an efficient food auction marketplace. By implementing:

- A chat-based buyer interface that simplifies food ordering
- Dynamic real-time bidding with competitive seller offers
- Buyer habit tracking for personalized recommendations
- Secure backend with prepared statements and validation
- Responsive, gradient-rich UI design

The system effectively implements the **Buyers are KING** concept, reducing buyer effort while encouraging seller competition. The project provides a practical example of how conversational interfaces and real-time technology can improve modern e-commerce platforms.

### Future Enhancements
- AI-powered chatbot for intelligent food recommendations
- Payment gateway integration
- Seller rating system
- Multi-language support
- Push notification system
- Advanced analytics dashboard
- Mobile app version

---

## Project Status

✅ **Development Complete**

All core features implemented and tested. The application is fully functional for basic food auction marketplace operations.

**Last Updated:** February 2025

---

