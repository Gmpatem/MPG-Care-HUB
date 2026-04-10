# MPG Care Hub - Project Context

## Product Overview

**MPG Care Hub** is a unified Church Management System designed for the Seventh-day Adventist (SDA) Church. It serves as a comprehensive digital platform to support church-level administration, member engagement, and multi-tiered organizational oversight.

### Vision
To provide a scalable, secure, and user-friendly platform that enables churches to manage operations efficiently while maintaining appropriate governance structures across district, conference, and union levels.

### Mission
Create a modular, mobile-first system that empowers church administrators, supports ministry operations, and provides oversight capabilities for higher-level leadership without compromising data security or user privacy.

---

## Target Users

### Primary Users
| Role | Description | Access Level |
|------|-------------|--------------|
| **Church Members** | Regular congregants | Member portal, personal records, event registration |
| **Church Clerks/Admins** | Local church administrators | Full church-level admin access |
| **Department Heads** | Sabbath School, AY, AMO, etc. | Department-specific management |
| **Treasurers** | Church finance officers | Treasury and financial records |
| **Pastors/Elders** | Spiritual leaders | Pastoral care tools, reports |

### Oversight Users
| Role | Description | Access Level |
|------|-------------|--------------|
| **District Directors** | Multi-church supervisors | District-level aggregated data |
| **Conference Officers** | Conference administration | Conference-wide oversight dashboards |
| **Union Officers** | Union-level leadership | Union-wide strategic dashboards |
| **System Admins** | Platform administrators | Full system configuration |

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** React hooks + Context where needed

### Backend & Database
- **Database:** PostgreSQL (via Supabase)
- **Auth:** Supabase Auth with Row Level Security (RLS)
- **Storage:** Supabase Storage for documents/images

### Infrastructure
- **Hosting:** Vercel
- **CI/CD:** Git-based deployment
- **Environment:** Node.js 18+

---

## Core Modules

### 1. Member Management
- Member profiles and contact information
- Family units and relationships
- Baptism and transfer records
- Membership status tracking

### 2. Departments
- Department structure and leadership
- Department-specific member rosters
- Activity planning and tracking
- Quarterly/annual reporting

### 3. Events & Calendar
- Church events and programs
- Sabbath service planning
- Event registration and attendance
- Room/resource booking

### 4. Announcements
- Church-wide communications
- Department-specific notices
- Push notifications (planned)
- Announcement scheduling

### 5. Reports & Analytics
- Church health metrics
- Attendance tracking
- Growth statistics
- Custom report generation

### 6. Treasury & Finance
- Tithe and offering tracking
- Budget management
- Expense reporting
- Financial reporting (church level only)
- **Privacy Note:** Individual giving records are strictly private

### 7. Complaints & Requests
- Member grievance tracking
- Prayer requests
- Pastoral care requests
- Anonymous reporting option

### 8. Multi-Level Oversight
- Church-to-district reporting
- District-to-conference reporting
- Conference-to-union reporting
- Cross-level data aggregation

---

## Key Constraints

### Security & Privacy
- Row Level Security (RLS) enforced at database level
- Role-Based Access Control (RBAC) on all features
- Individual financial data never exposed to oversight levels
- Audit logging for sensitive operations

### Scalability
- Support for 1,000+ churches per union
- Efficient query patterns for aggregated reports
- Modular architecture for feature additions

### Mobile-First
- Responsive design for all screen sizes
- Touch-friendly interfaces
- Offline capability consideration (PWA planned)

---

## Current Phase
Building foundational RBAC and the secure higher-level dashboard system for conference/union oversight.
