# Echo Bloom

Build a Modern Testimonials Management SaaS

Create a polished, production-quality SaaS web application for managing and displaying customer testimonials.

The product allows businesses/creators to:

Create an account and manage their brand

Add, edit, delete, and organize testimonials

Create multiple testimonial layouts/widgets

Select which testimonials appear in each layout

Customize the appearance of each layout

Get a public URL for every layout

Embed/use that URL directly on their own website

The application should feel like a modern SaaS product similar in quality to Linear, Vercel, Stripe, Framer, and modern startup dashboards.

1. Overall Design Direction

Create a very modern, minimal, premium SaaS UI.

Visual style

Use solid colors rather than excessive gradients

Clean white/light backgrounds

Strong typography

Large headings

Generous whitespace

Rounded cards

Subtle borders

Very subtle shadows

Modern icons

Smooth hover states

Clean spacing system

Responsive on desktop, tablet, and mobile

Avoid visual clutter

Avoid excessive gradients

Avoid excessive glassmorphism

Avoid generic Bootstrap-looking components

The product should look like a real commercial SaaS product, not a template.

Suggested color system

Primary:

Indigo / deep violet: #6366F1

Dark:

#111827

Background:

#F8FAFC

Card:

#FFFFFF

Border:

#E5E7EB

Muted text:

#6B7280

Success:

#10B981

Danger:

#EF4444

Use solid colors and subtle variations of these colors throughout the application.

2. Product Name

Use a modern placeholder product name:

Testimonially

Tagline:

Collect testimonials. Build trust. Convert more.

The branding should be easy to replace later.

3. Landing Page

Create a beautiful, highly polished marketing landing page.

Navbar

Left:

Testimonially logo

Product name

Center/right:

Features

How it works

Pricing

Login

Get Started button

Navbar should remain clean and minimal.

Hero Section

Large headline:

Turn customer feedback into beautiful social proof.

Supporting text:

Collect, manage, customize, and showcase your best customer testimonials anywhere on your website.

Primary CTA:

Get Started Free

Secondary CTA:

View Demo

On the right side, show a realistic visual preview of testimonial widgets.

The preview should show several testimonial cards with:

Avatar

Customer name

Company

Rating

Testimonial

Different layout styles

Make the hero visually impressive.

4. Features Section

Create a modern feature grid.

Features:

Collect Testimonials

Add and manage customer testimonials from one centralized dashboard.

Beautiful Layouts

Choose from multiple professionally designed testimonial layouts.

Full Customization

Customize colors, fonts, typography, spacing, borders, and other visual properties.

Instant Publishing

Every layout gets its own public URL that can be used directly on a website.

Multiple Layouts

Create different testimonial widgets for different websites, pages, or campaigns.

Simple Management

Edit, delete, reorder, and control which testimonials appear in each layout.

5. How It Works

Create a simple 3-step section.

01 — Add testimonials

Add your customer feedback and social proof.

02 — Design your widget

Select a layout and customize its appearance.

03 — Publish anywhere

Copy your public URL and use the testimonial widget on your website.

Use a clean horizontal timeline/card design.

6. Testimonial Showcase

Create a visually impressive section showing multiple testimonial layout examples.

Show examples such as:

Grid

Multiple testimonial cards displayed in a responsive grid.

Carousel

Testimonials displayed inside a horizontally scrolling carousel.

Single Featured

One large highlighted testimonial.

Masonry

Pinterest-style testimonial layout.

Compact List

Simple testimonial list suitable for sidebars or product pages.

Each example should look like a real testimonial widget.

7. Dashboard

After login, users should enter a modern SaaS dashboard.

Desktop layout:

Sidebar

Logo

Navigation:

Dashboard

Testimonials

Layouts

Brand

Settings

Bottom:

User profile

Logout

Main content should change based on navigation.

8. Dashboard Home

Create an overview dashboard.

Header:

Good morning, [User Name]

Subtitle:

Here's what's happening with your testimonials.

Show statistics cards:

Total Testimonials

Published Testimonials

Total Layouts

Active Widgets

Example:

Testimonials       124
Published           108
Layouts               6
Active Widgets        4


Below statistics:

Recent Testimonials

Show a table/list with:

Customer

Company

Rating

Status

Date

Actions

Actions:

Edit

Delete

View

Also show:

Active Layouts

Cards displaying previews of the user's testimonial layouts.

9. Authentication

Create polished Login and Register pages.

Login

Fields:

Email

Password

Buttons:

Login

Also include:

Remember me

Forgot password?

Continue with Google

Footer:

Don't have an account? Sign up

Register

Fields:

Full Name

Email

Password

Confirm Password

CTA:

Create Account

Include:

Already have an account? Login

Authentication UI should be clean and premium.

10. Brand Management

Create a dedicated Brand page.

Users can configure:

Brand Information

Brand name

Website URL

Logo

Description

Brand Colors

Primary color

Secondary color

Text color

Background color

Provide color pickers.

Brand Typography

Font family

Heading font

Body font

Show a live preview on the right.

The brand configuration should be reusable by testimonial layouts.

11. Testimonials Management

Create a dedicated Testimonials page.

Header:

Testimonials

Subtitle:

Manage all of your customer testimonials.

Primary button:

+ Add Testimonial

Testimonials List

Create a modern table/card interface.

Columns:

Customer

Testimonial

Company

Rating

Status

Created

Actions

Actions:

Edit

Delete

Preview

Allow:

Search

Filter

Sort

Pagination

Filters:

Published

Draft

Rating

12. Add Testimonial

Create a beautiful form.

Fields:

Customer Information

Customer name

Customer email

Customer photo/avatar

Company name

Company logo

Job title

Testimonial

Large textarea:

What did your customer say?

Rating

5-star selector.

Status

Published

Draft

Button:

Save Testimonial

After saving, return to the testimonials list.

13. Edit Testimonial

Use the same form as Add Testimonial.

Allow users to modify:

Customer information

Avatar

Company

Job title

Testimonial content

Rating

Status

Buttons:

Save Changes

Cancel

14. Delete Testimonial

When deleting a testimonial, show a confirmation modal:

Delete testimonial?

"Are you sure you want to delete this testimonial? This action cannot be undone."

Buttons:

Cancel

Delete

Use a danger/red action for Delete.

15. Layout Management

Create a dedicated Layouts page.

Header:

Testimonial Layouts

Subtitle:

Create beautiful testimonial widgets for your website.

Primary CTA:

+ Create Layout

Display layouts as visual cards.

Each card should contain:

Layout preview

Layout name

Number of testimonials

Status

Last updated

Actions

Actions:

Edit

Duplicate

Preview

Delete

Copy URL

16. Create Layout

This is one of the most important parts of the application.

Create a powerful visual layout builder.

Use a two-column interface:

Left side

Configuration panel.

Right side

Live preview.

The preview should update immediately whenever a setting changes.

17. Layout Selection

First allow the user to select a layout type.

Options:

Grid

Cards arranged in a responsive grid.

Carousel

Horizontal testimonial slider.

Masonry

Masonry-style cards.

Featured

One large testimonial.

List

Simple vertical testimonial list.

Minimal

Very minimal testimonial design.

Each layout option should have a visual thumbnail.

18. Select Testimonials

Inside the layout editor provide a section:

Select Testimonials

Display all available testimonials with:

Checkbox

Customer avatar

Customer name

Company

Short testimonial preview

Allow:

Select/unselect testimonials

Select all

Search testimonials

Drag and drop to reorder

The order selected here should determine the display order.

19. Layout Customization

Create a comprehensive customization panel.

Colors

Allow users to configure:

Background color

Card background

Text color

Secondary text color

Accent color

Border color

Star color

Use color pickers.

Typography

Allow configuration of:

Font family

Testimonial font size

Customer name font size

Company font size

Line height

Font weight

Font options:

Inter

Roboto

Poppins

Plus Jakarta Sans

DM Sans

System UI

Card Styling

Controls:

Border radius

Border width

Shadow

Card padding

Card spacing

Avatar

Controls:

Show/hide avatar

Avatar size

Avatar shape

Circle

Rounded

Square

Rating

Controls:

Show/hide rating

Star size

Star color

Rating position

Layout

Controls:

Number of columns

Gap

Maximum width

Alignment

Padding

For carousel:

Autoplay

Autoplay speed

Show arrows

Show dots

20. Live Preview

The right side should contain a large live preview.

Header:

Preview

Show the actual testimonial widget.

When the user changes:

Color

Font

Size

Layout

Spacing

Avatar

Rating

the preview should update instantly.

Include:

Desktop / Tablet / Mobile

preview toggles.

This should feel like a professional website builder.

21. Layout Save

Top-right buttons:

Save

Save & Publish

When publishing, generate a unique public URL.

Example:

/widget/abc123

Display:

Your testimonial widget is live

with:

Copy URL

button.

22. Public Testimonial URL

Create a public route:

/widget/:id

This page should NOT require authentication.

It should render the testimonial widget using the saved configuration.

Important:

The public widget should contain only the testimonial layout and should not look like the application's dashboard.

It should be suitable for embedding/loading from another website.

Example:

https://testimonials.example.com/widget/abc123


The layout configuration should determine everything displayed on this page.

23. Embed / Integration

On the layout details page, provide:

Public URL

https://testimonials.example.com/widget/abc123


Button:

Copy URL

Also provide:

Embed Code

Example:

<iframe
  src="https://testimonials.example.com/widget/abc123"
  width="100%"
  height="500"
  frameborder="0">
</iframe>


Button:

Copy Embed Code

Include a short explanation:

Add this widget to your website using the URL or embed code above.

24. Layout Preview Page

Create a dedicated preview page where the user can see the testimonial widget at full size.

Controls:

Desktop

Tablet

Mobile

Actions:

Edit Layout

Copy URL

Copy Embed Code

Publish / Unpublish

25. Settings

Create Settings page with sections:

Account

Name

Email

Profile image

Security

Change password

Logout from all devices

Preferences

Theme

Notifications

Keep settings simple.

26. Responsive Design

The entire application must be fully responsive.

Desktop:

Sidebar + content

Tablet:

Collapsible sidebar

Mobile:

Bottom navigation or hamburger navigation

Full-width cards

Mobile-friendly forms

Layout editor should adapt appropriately

Public testimonial widgets must also be responsive.

27. Components

Create reusable components for:

Navbar

Sidebar

Buttons

Inputs

Selects

Modals

Cards

Tables

Testimonial cards

Rating component

Color picker

Font selector

Layout selector

Preview frame

Toast notifications

Empty states

Loading states

Confirmation dialogs

Maintain consistent spacing, typography, border radius, and interaction patterns.

28. UX Details

Add polished interactions throughout the app:

Hover states

Smooth transitions

Button loading states

Skeleton loading states

Toast notifications

Empty states

Form validation

Delete confirmation

Copy-to-clipboard feedback

Unsaved changes warning in layout editor

Examples:

After saving:

Testimonial saved successfully

After copying URL:

Widget URL copied

After publishing:

Your testimonial widget is now live

29. Empty States

Create useful empty states.

Testimonials:

No testimonials yet

"Start collecting customer feedback and build your social proof."

Button:

Add Your First Testimonial

Layouts:

Create your first testimonial widget

"Turn your testimonials into beautiful social proof for your website."

Button:

Create Layout

30. Dashboard Information Architecture

Use this navigation:

Dashboard
│
├── Testimonials
│
├── Layouts
│
├── Brand
│
└── Settings


Keep the product simple and focused.

31. Data Model

Design the application around these core entities:

User

id

name

email

password

createdAt

updatedAt

Brand

id

userId

name

website

logo

description

primaryColor

secondaryColor

textColor

backgroundColor

fontFamily

Testimonial

id

userId

customerName

customerEmail

customerAvatar

companyName

companyLogo

jobTitle

content

rating

status

createdAt

updatedAt

Layout

id

userId

name

type

selectedTestimonials

configuration

status

publicSlug

createdAt

updatedAt

The configuration should be flexible enough to support different layout types and future customization options.

32. Important Product Architecture

Separate the application into:

Authenticated application

Used for:

Managing testimonials

Managing brand

Creating layouts

Customizing widgets

Publishing layouts

Public application

Used for:

/widget/:slug


The public route should retrieve the published layout configuration and render it without authentication.

33. Landing Page Testimonials

The landing page itself should demonstrate the product.

Create a section:

Loved by teams building great products

Show 3–6 realistic sample testimonials.

These are demo testimonials only.

34. Pricing Section

Create a simple pricing section for the landing page.

Plans:

Free

20 testimonials

2 layouts

Basic customization

Pro

Unlimited testimonials

Unlimited layouts

Advanced customization

Remove branding

Business

Everything in Pro

Multiple brands

Advanced analytics

Team access

Use attractive pricing cards but don't overcomplicate billing functionality unless required.

35. Footer

Footer sections:

Product:

Features

Pricing

Templates

Company:

About

Contact

Legal:

Privacy

Terms

Social:

GitHub

X

LinkedIn

36. Important Design Requirement

Do NOT make this look like a generic admin dashboard.

The application should have a strong visual identity.

The key experience should be:

Simple → Elegant → Fast → Visual

The layout builder should be the centerpiece of the product.

The user should immediately understand:

Add testimonials

Create a layout

Customize it

Publish it

Copy the URL/embed code

Put it on their website

37. Technical Expectations

Build the application with:

Clean component architecture

Reusable components

Type-safe data structures

Proper form validation

Responsive CSS

Accessible UI

Loading/error states

Proper authentication guards

Public/private route separation

Persistent database-backed data

Secure authentication

Clean API/data access layer

Do not use hardcoded data for the actual authenticated application.

Use realistic seed/demo data only where appropriate for the landing page or initial demo experience.

38. Final Quality Bar

Before considering the implementation complete, verify:

Landing page looks premium

Login/Register looks polished

Dashboard looks modern

Testimonials CRUD works

Brand settings work

Layout CRUD works

Testimonials can be selected for layouts

Testimonials can be reordered

Layout customization works

Live preview updates immediately

Desktop/tablet/mobile previews work

Layouts can be published

Public URL works without authentication

Embed code can be copied

Public widget is responsive

Delete confirmations work

Toast notifications work

Empty states exist

Loading states exist

Mobile UI works correctly

Prioritize visual polish and UX quality as much as functionality.

The final result should feel like a real SaaS product ready to show to customers.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fd5c7658-2320-4ea3-a4c5-dab8e7460138).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
