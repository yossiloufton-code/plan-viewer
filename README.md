# Plan Viewer & File Management Assignment

This repository contains a complete solution for a 3-part technical assignment, including:

1. A 2D plan viewer frontend (React)
2. An AWS-oriented architecture design for file management
3. A Node.js + TypeScript backend implementation based on that design

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

#### Frontend
 - Requests presigned URLs for uploads and downloads

#### Backend (Node.js / TypeScript)
 - REST API for:
  - Project creation
  - File registration
  - Presigned upload/download URL generation

#### Storage
 - Amazon S3 (object storage)
 - Files organized by project and type

#### Database
 - PostgreSQL (metadata only)
 - Stores projects, file records, types, sizes, and storage keys

#### Security
 - Presigned URLs for direct upload/download
 - No file data passes through the backend in production

#### Compute (target)
 - AWS Lambda or ECS (containerized)
 - IAM roles for secure access to S3

Note: The backend is implemented to run locally, but is structured to be AWS-ready.

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
