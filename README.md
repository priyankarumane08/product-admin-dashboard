# Frontend Assignment: Product Admin Dashboard

Next.js • React • Tailwind CSS • Axios

## Requirements

- Login with `emilys` / `emilyspass`
- Shared Axios setup with login token and centralized error handling
- Product list with image, title, category, price, rating and stock
- Desktop table and mobile cards
- Pagination with page numbers, Previous/Next and page size 10/20/50
- Search with debounce and page reset
- Category filter and sorting by price, rating or title
- Product details with images, description, price and reviews
- Not-found handling for an invalid product ID
- Add, edit and delete with validation and delete confirmation
- Loading, empty and error states with Retry
- URL state for page, search, filter and sort
- No React Query, SWR or ready-made table/pagination libraries

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Important assignment choices

### Search + category

DummyJSON does not provide one request that performs product search and category filtering together. This app gives search precedence when both values are present and explains that choice in the UI.

### Add, edit and delete

DummyJSON simulates these mutations and does not permanently save them. The app updates the current product list in React state after a successful API response so the change is visible during the session.

### Fast search requests

Search is debounced. Requests use Axios cancellation signals and request IDs so an older response cannot replace the newest search result.

### Invalid URL values

Invalid or missing `page` values fall back to page 1. Unsupported page sizes fall back to 10.

## Regular commits

Use multiple Git commits while building the assignment, for example:

```bash
git add .
git commit -m "setup nextjs dashboard"
git commit -m "add login and axios setup"
git commit -m "add product listing pagination search filters"
git commit -m "add product details"
git commit -m "add product CRUD and validation"
git commit -m "add README"
```

## AI note

AI was used to assist with code structure and implementation. Every part of the submitted code should be reviewed and understood before the interview walkthrough.
