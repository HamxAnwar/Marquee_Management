# AGENTS.md – Marquee Management Platform Context (Updated)

## Project Overview
A production‑ready, multi‑tenant SaaS platform for event venue booking and management in Pakistan. Connects venue owners with customers through a marketplace, featuring commission‑based revenue sharing and comprehensive venue management tools.

## Technologies
- **Backend**: Django 5.2.7, Django REST Framework, PostgreSQL/MySQL (or SQLite for dev), Redis
- **Frontend**: Next.js 15.5.6, TypeScript, Tailwind CSS, Shadcn/UI
- **Auth**: JWT (simplejwt) with role‑based access control
- **State**: TanStack Query + custom React hooks

## Core Backend Apps & Key Models

| App | Primary Models | Purpose |
|-----|----------------|---------|
| `core` | `Organization`, `OrganizationMember`, `Hall`, `HallImage`, `HallReview`, `DiscountTier`, `UserProfile`, `PlatformSettings` | Multi‑tenant data isolation, venue/hall definitions, user extensions, platform‑wide settings |
| `bookings` | `Booking`, `BookingMenuItem`, `BookingStatusHistory`, `BookingPayment`, `BookingCommunication`, `BookingDocument`, `BookingReview` | End‑to‑end booking lifecycle, menu selections, payments, communications, documents, reviews |
| `menu` | `MenuItem`, `MenuItemVariant`, `MenuPackage` | Menu catalog for venues |
| `pricing` | (pricing‑related models – not shown here) | Dynamic pricing, discount tiers |
| `organizations` | (organization‑specific views/serializers) | API endpoints for organization management |

### Notable Model Details

- **`Organization`**
  - Fields: `name`, `slug`, `owner` (FK → User), `subscription_plan`, `status`, `commission_rate`, media fields, timestamps.
  - `slug` auto‑generated from `name`.
  - `is_active` property checks `status == "active"`.

- **`Hall`**
  - Linked to an `Organization`.
  - Fields: `name`, `slug`, `hall_type`, `capacity`, `base_price`, amenities, feature flags (parking, AC, etc.).
  - `slug` auto‑generated; `amenities_list` property parses CSV.

- **`UserProfile`**
  - One‑to‑one with Django `User`.
  - `user_type` choices: `customer`, `venue_owner`, `platform_admin`.
  - Helper properties: `is_venue_owner`, `is_platform_admin`, `owned_organizations`.

- **`Booking`**
  - Core reservation model with status workflow (`pending`, `confirmed`, `cancelled`, `completed`, `no_show`).
  - Guest‑booking flag (`is_guest_booking`), organization & hall FK, contact info, pricing breakdown fields, timestamps.
  - `save()` auto‑generates a unique `booking_id` (`ORGSLUG + 8‑char UUID`) and calculates `balance_due`.
  - `clean()` validates hall‑organization match, package‑organization match, future event date, and capacity constraints.
  - Helper properties: `is_upcoming`, `is_past`, `is_today`, `days_until_event`, `is_payment_overdue`, `customer_display_name`.

- **`BookingMenuItem`**
  - Junction table linking a `Booking` to a `MenuItem` (and optional `MenuItemVariant`) with quantity, unit price, total price, and customizations.

- **`BookingStatusHistory`**
  - Tracks status changes with `old_status`, `new_status`, `changed_by`, `reason`, and timestamp.

### API Endpoints (ViewSets)

- **`BookingViewSet`** (`/api/bookings/`)
  - **Permissions**: Guest creation allowed (`POST /bookings/`), all other actions require authentication.
  - **Serializer selection**:
    - `list` → `BookingListSerializer`
    - `retrieve` → `BookingDetailSerializer`
    - `create` → `BookingCreateSerializer`
    - `update/partial_update` → `BookingUpdateSerializer`
  - **Queryset filtering** (query params):
    - `status`, `hall`, `organization`, `event_type`, `start_date`, `end_date`
    - `time_filter` (`upcoming` / `past`)
    - `search` (booking ID or customer name/username)
  - **Custom actions**:
    - `my_bookings` – bookings for the requesting user.
    - `upcoming` – all upcoming bookings.
    - `pending` – staff‑only view of pending bookings.
    - `confirm` – staff‑only POST to set status to `confirmed` (adds `confirmed_at` and status history).
    - `cancel` – allows staff or the booking’s customer to cancel; records reason and status history.

- **Other ViewSets** (not shown here) exist for `Organization`, `Hall`, `Menu`, etc., following similar patterns.

### Permissions & Access Logic (BookingViewSet)

```python
if user.is_staff:
    # Platform staff can see all bookings
    pass
else:
    # Platform admin via UserProfile.is_platform_admin also sees all
    # Otherwise, filter to:
    #   - bookings where user is the customer
    #   - bookings belonging to organizations owned by the user
    #   - bookings where user is an active member (admin/manager/staff) of an organization
```

### Important Business Rules

- **Booking ID Generation**: `ORGSLUG` (first 3 letters of organization slug, upper‑cased) + 8‑char UUID.
- **Capacity Validation**: `guest_count` must not exceed `hall.capacity`.
- **Advance Booking Days**: `Hall.advance_booking_days` (default 30) – not enforced in model but used in UI/validation elsewhere.
- **Payment Overdue**: If event is within 7 days and advance not fully paid, `is_payment_overdue` becomes `True`.
- **Status History**: Automatically created on creation (`post_save`) and on status changes (`pre_save` + explicit actions).

### Frontend Hooks (React)

- **API client** (`frontend/src/lib/api-client.ts`) uses JWT token from `use-auth` hook.
- **Query hooks** (`frontend/src/hooks/*.ts`) wrap TanStack Query calls for:
  - `useBookings`, `useMyBookings`, `useUpcomingBookings`, `useBookingDetail`, etc.
- **Protected routes** (`components/auth/protected-route.tsx`) enforce authentication for admin pages.

### Development Commands (recap)

| Action | Command |
|--------|---------|
| Install deps | `npm run install-all` |
| Start dev (backend + frontend) | `./start-dev.sh` |
| Run backend tests | `cd backend && python manage.py test` |
| Lint frontend | `cd frontend && npm run lint` |
| Build frontend | `cd frontend && npm run build` |
| Reset DB | `./reset-db.sh` |

---

**Next steps**
- Review the updated AGENTS.md for completeness.
- Add any additional notes about upcoming features, known issues, or TODOs as needed.

