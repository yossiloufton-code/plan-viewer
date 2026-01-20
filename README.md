# Plan Viewer & File Management Assignment

This repository contains a complete solution for a 3-part technical assignment, including:

1. A 2D plan viewer frontend (React)
2. An AWS-oriented architecture design for file management
3. A Node.js + TypeScript backend implementation based on that design

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or later recommended)
- npm
- pgadmin/local postgres

#### env files included for convinience.

### Installation
npm install

### Run the project
 - npm run dev
 - The application will be available at: http://localhost:5173

## Assignment 1 – 2D Plan Viewer (Frontend)
### Goal
Build a simple 2D plan viewer that allows viewing, navigating, and logging interactions on a provided plan image.

## Implemented Features
### Viewer
 - Displays the provided plan image inside a dedicated viewer area
 - Zoom in / out using mouse wheel or trackpad
    - Zoom is centered on the cursor position
    - Zoom limits enforced (default: 0.25x – 5x)
 - Pan using click-and-drag
  - Mouse down + drag moves the image
  - Releasing the mouse stops panning
 - Double-click resets the view and centers the image in the viewport

### Action Log
 - Side-by-side layout: viewer on the left, log panel on the right
 - Logs user interactions in real time:
   - Zoom in / zoom out
   - Pan start / pan end (with delta)
   - Center reset
  - Each log entry includes:
   - Timestamp
   - Action type
   - Details (zoom level, pan delta, reset)

### Technical Notes
 - Built with React + TypeScript
 - Uses custom Context hooks for viewer state and action logging
 - Logic and UI are cleanly separated
 - CSS is modular and component-scoped

## Assignment 2 – Architecture Design (AWS Serverless)
### Goal
Design an architecture for uploading, storing, and downloading files with the following constraints:
 - Multiple projects
 - Multiple file types
 - Ability to download files by type
 - Modern backend framework
 - AWS serverless or container-based deployment

### Designed Architecture (Conceptual)

+---------------------+
|     Frontend        |
|  React Application  |
|                     |
| - Upload files      |
| - List files        |
| - Download by type  |
+----------+----------+
           |
           | HTTPS (REST)
           v
+---------------------+
|     Backend API     |
|  Node.js + TS       |
|  (Express)          |
|                     |
| - Create projects   |
| - Register files    |
| - Generate          |
|   presigned URLs    |
+----------+----------+
           |
           | Metadata (SQL)
           v
+---------------------+
|    PostgreSQL       |
|                     |
| - projects          |
| - files             |
| - file types        |
| - storage keys      |
+---------------------+

           |
           | Presigned URL
           v
+---------------------+
|  Object Storage     |
|  Amazon S3          |
|                     |
| - Files by project  |
| - Files by type     |
+---------------------+

#### Frontend
 - Requests presigned URLs for uploads and downloads
 - Uploads and downloads files directly to/from object storage using presigned URLs
 - Displays file lists and supports filtering by file type per project

#### Backend (Node.js / TypeScript)
  - REST API responsible for orchestration and validation, not file streaming
 - Handles:
  - Project creation and management
  - File metadata registration
  - Presigned upload URL generation
  - Presigned download URL generation (by file type)
 - Acts as a security boundary between the client and storage

#### Storage
 - Amazon S3 (object storage)
 - Stores raw file binaries
 - Files organized by project and type
   - Project
   - File type
 - Designed for high availability and scalable storage

#### Database
 - PostgreSQL (metadata only)
 - Stores projects, file records, types, sizes, and storage keys
 - No binary data is stored in the database

#### Security
 - Presigned URLs are:
  - Time-limited
  - Scoped to a specific file and operation
 - Backend credentials are never exposed to the client
 - In production, access to S3 is handled via IAM roles, not static keys

#### Compute (target)
 - AWS Lambda or ECS (containerized services)
 - Stateless backend instances
 - Horizontal scalability based on traffic
 - IAM roles used for secure access to S3 and other AWS services
Note: The backend is implemented to run locally, but is structured to be AWS-ready.

## ADDITIONAL NOTES
## Storage Modes (Local vs AWS)
This solution supports two storage modes with the same API contract:
### Mode A – Local Storage (used in this repo for development)
 - The backend stores uploaded files on the local filesystem under /uploads
 - Upload flow:
   1. Frontend requests upload targets from backend
   2. Backend returns a local upload endpoint (e.g. PUT /projects/:projectId/files/:fileId/upload)
   3. Frontend uploads file bytes to the backend
   4. Backend writes the file to disk and updates Postgres metadata (status=uploaded)

 - Download flow:
 1. Frontend requests download targets (by type or fileId)
 2. Backend returns a local download endpoint (e.g. GET /projects/:projectId/files/:fileId/download)
 3. Backend streams the file to the client

### Mode B – AWS S3 Presigned URLs (target production architecture)

 - The backend generates presigned S3 URLs
 - Upload flow:
   1. Frontend requests presigned upload URLs
   2. Backend returns presigned S3 PUT URLs (no file bytes go through backend)
   3. Frontend uploads directly to S3
   4. Backend stores metadata in Postgres (and can optionally confirm completion)
 - Download flow:
 1. Frontend requests presigned download URLs by type or fileId
 2. Backend returns presigned S3 GET URLs
 3. Frontend downloads directly from S3

### Switching modes
 - The mode is selected via environment configuration (e.g. STORAGE_MODE=local|aws)
 - The rest of the system remains unchanged (same endpoints and database schema)

## Assignment 3 – Backend Implementation
### Goal
Implement the backend described in Assignment 2.

### Stack
 - Node.js
 - TypeScript
 - Express
 - PostgreSQL (local, via pgAdmin)
 - TypeORM
 - AWS SDK (commented / optional)

### Features Implemented
 - Project management
 - File metadata management
 - Upload flow using presigned URLs
 - Download by file type
 - Support for multiple projects
 - Clean architecture:
  - Routes
  - Controllers
  - Services
  - Config
  - Entities
 - Automatic database bootstrap on startup

### Local Development Mode
For easier local testing:
 - Files can be uploaded and downloaded through the backend API
 - Local filesystem storage (/uploads) is used instead of S3
 - AWS code is included but commented / optional
