# Gatherly database schema

This is the database evidence for the Event Registration and Management System. The default local database uses SQLite through Prisma. The matching PostgreSQL schema is in `prisma/schema.postgresql.prisma`.

## Relationship diagram

```mermaid
erDiagram
    USER ||--o{ SESSION : starts
    USER ||--o{ EVENT : creates
    USER ||--o{ REGISTRATION : owns
    EVENT ||--o{ REGISTRATION : receives
    USER ||--o{ FEEDBACK : writes
    EVENT ||--o{ FEEDBACK : receives

    USER {
        string id PK
        string name
        string email UK
        string passwordHash
        string role
        datetime createdAt
        datetime updatedAt
    }
    SESSION {
        string id PK
        string tokenHash UK
        string userId FK
        datetime expiresAt
        datetime createdAt
    }
    EVENT {
        string id PK
        string title
        string description
        string location
        datetime startDateTime
        datetime endDateTime
        int capacity
        int seatsTaken
        string status
        string category
        string imageUrl
        string createdById FK
        datetime createdAt
        datetime updatedAt
    }
    REGISTRATION {
        string id PK
        string userId FK
        string eventId FK
        string status
        datetime registeredAt
        datetime cancelledAt
        datetime createdAt
        datetime updatedAt
    }
    FEEDBACK {
        string id PK
        string userId FK
        string eventId FK
        int rating
        string comment
        datetime createdAt
        datetime updatedAt
    }
```

## Integrity controls

1. User email is unique.
2. A user and event pair is unique in Registration. A cancelled registration is reused when the attendee registers again, so only one active record can exist.
3. Registration uses an atomic event update where `seatsTaken` is still below `capacity`.
4. Event capacity is a positive whole number and cannot be reduced below active registrations.
5. Registration and Feedback keep foreign key relationships and timestamps.
6. Sessions cascade when a user is removed. Event history is protected from accidental removal when registrations exist.

