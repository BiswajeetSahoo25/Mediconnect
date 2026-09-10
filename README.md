# MediConnect

MediConnect is a healthcare ecosystem platform designed to connect patients, doctors, clinics, and healthcare facilities through a unified digital platform.

The project focuses on making healthcare discovery and interaction more accessible while providing a foundation for features such as doctor discovery, appointment booking, medical records, healthcare articles, and provider management.

## Project Status

🚧 **Currently under active development**

This repository represents the current development milestone of MediConnect. The project is being developed incrementally, with frontend interfaces being implemented first followed by backend integration and additional healthcare workflows.

## Current Features

### Patient Experience

- Patient registration and login
- User onboarding
- Patient dashboard
- Account and profile settings
- Residential address management
- Emergency contact management
- Healthcare facility discovery
- Location-based healthcare discovery
- Search healthcare facilities by city/location
- Healthcare facility details
- Health articles
- Individual health article pages
- Doctor discovery interface
- Individual doctor profile interface

### Healthcare Discovery

MediConnect allows users to discover nearby healthcare facilities and search for healthcare facilities in different locations.

The current healthcare discovery system integrates external location and healthcare data to provide facility information such as:

- Hospitals
- Clinics
- Location
- Address
- Contact information
- Opening hours
- Facility details
- Distance from the user's location

The long-term system will distinguish between externally discovered healthcare facilities and verified MediConnect facilities that can support booking and other platform features.

## Planned Features

- Doctor appointment booking
- Appointment management
- Doctor dashboard
- Clinic management
- Medical records
- Prescriptions
- Doctor-to-doctor communication
- Healthcare provider profiles
- Verified healthcare facilities
- Provider articles and healthcare stories
- Patient-provider interactions
- Notifications
- Role-based healthcare workflows

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- React Hook Form
- Zod

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- Argon2 password hashing
- Zod validation

### External Services

- Geoapify for location and healthcare facility discovery
- Google Maps for map navigation

## Architecture

MediConnect follows a layered backend architecture:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Prisma
  ↓
PostgreSQL