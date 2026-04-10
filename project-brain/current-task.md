# Current Task: Secure Higher-Level Oversight Dashboard

**Status:** In Progress  
**Priority:** High  
**Started:** April 2025  
**Target Completion:** April 2025

---

## Objective

Build a secure, role-based dashboard system for district, conference, and union-level oversight that:
1. Is completely inaccessible to normal church users
2. Provides appropriate aggregated data views for each oversight level
3. Maintains strict privacy boundaries (no individual financial data)
4. Uses clean, modular architecture that follows project patterns

---

## Scope

### In Scope
- [ ] District Director Dashboard
  - List of churches in district
  - Aggregated membership statistics
  - Recent activity summary
  - Department health metrics
  - Event participation (aggregated)
  
- [ ] Conference Officer Dashboard
  - List of districts in conference
  - Aggregated data from all district churches
  - Comparative analytics across districts
  - Administrative tools for district management
  
- [ ] Union Officer Dashboard
  - List of conferences in union
  - High-level strategic overview
  - Union-wide metrics and trends
  - Policy and configuration management

- [ ] Security Implementation
  - Route-level access guards
  - Database RLS policies for oversight queries
  - Audit logging for oversight access
  - Forbidden page for unauthorized attempts

### Out of Scope (Future Phases)
- Real-time notifications
- Advanced data visualization
- Predictive analytics
- Cross-union comparisons
- Mobile app version

---

## Technical Requirements

### Access Control
```typescript
// Required role checks
- District Dashboard: role === 'district_director' || higher
- Conference Dashboard: role === 'conference_officer' || higher  
- Union Dashboard: role === 'union_officer' || 'super_admin'
```

### Route Structure
```
app/
└── (oversight)/
    ├── layout.tsx              # Oversight shell with role check
    ├── unauthorized/page.tsx   # Access denied page
    ├── district/
    │   └── [districtId]/
    │       ├── page.tsx        # District overview
    │       ├── churches/
    │       ├── reports/
    │       └── layout.tsx
    ├── conference/
    │   └── [conferenceId]/
    │       ├── page.tsx        # Conference overview
    │       ├── districts/
    │       ├── reports/
    │       └── layout.tsx
    └── union/
        └── [unionId]/
            ├── page.tsx        # Union overview
            ├── conferences/
            ├── reports/
            └── layout.tsx
```

### Data Aggregation Rules

| Data Type | Church | District | Conference | Union |
|-----------|--------|----------|------------|-------|
| Member count | ✅ Individual | ✅ Aggregated | ✅ Aggregated | ✅ Aggregated |
| Member names | ✅ Full list | ❌ No access | ❌ No access | ❌ No access |
| Department counts | ✅ Details | ✅ Aggregated | ✅ Aggregated | ✅ Aggregated |
| Financial totals | ✅ Individual | ⚠️ Summary only | ⚠️ Summary only | ⚠️ Summary only |
| Event counts | ✅ Details | ✅ Aggregated | ✅ Aggregated | ✅ Aggregated |
| Complaint counts | ✅ Details | ✅ Count only | ✅ Count only | ✅ Count only |

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Create `(oversight)` route group
- [ ] Implement role-check middleware/guards
- [ ] Create unauthorized access page
- [ ] Set up database views for aggregated queries

### Phase 2: District Dashboard
- [ ] District layout with navigation
- [ ] District overview page with key metrics
- [ ] Church list view (read-only summary)
- [ ] District reports page

### Phase 3: Conference Dashboard
- [ ] Conference layout with navigation
- [ ] Conference overview page
- [ ] District list view
- [ ] Cross-district comparison tools

### Phase 4: Union Dashboard
- [ ] Union layout with navigation
- [ ] Union overview page
- [ ] Conference list view
- [ ] Union-wide administrative tools

### Phase 5: Security Hardening
- [ ] Comprehensive RLS policy review
- [ ] Audit logging implementation
- [ ] Security testing (attempt unauthorized access)
- [ ] Documentation updates

---

## Design Guidelines

### Visual Hierarchy
- Use distinct color scheme for oversight (different from church workspace)
- Clear labeling: "District Dashboard - [District Name]"
- Breadcrumb navigation showing level (Union > Conference > District)

### Key Metrics to Display

**District Level:**
- Total churches
- Total members (sum)
- Average attendance trend
- Active departments count
- Pending complaints/issues

**Conference Level:**
- Total districts
- Total churches
- Total members
- Year-over-year growth
- District comparison chart

**Union Level:**
- Total conferences
- Total districts
- Total churches
- Strategic KPIs
- Health indicators

---

## API/Server Actions Needed

```typescript
// features/oversight/server/

// District level
- getDistrictOverview(districtId)
- getDistrictChurchesSummary(districtId)
- getDistrictMetrics(districtId, dateRange)

// Conference level
- getConferenceOverview(conferenceId)
- getConferenceDistrictsSummary(conferenceId)
- getConferenceMetrics(conferenceId)

// Union level
- getUnionOverview(unionId)
- getUnionConferencesSummary(unionId)
- getUnionMetrics(unionId)
```

---

## Testing Criteria

1. **Access Control**
   - [ ] Church user cannot access `/district/[id]`
   - [ ] District director can access their district only
   - [ ] Conference officer can access all districts in conference
   - [ ] Union officer can access everything

2. **Data Privacy**
   - [ ] Individual member names not visible at oversight level
   - [ ] Individual giving records not visible
   - [ ] Only aggregated/summary data shown

3. **Functionality**
   - [ ] Dashboards load within 3 seconds
   - [ ] Navigation works between levels
   - [ ] Mobile responsive

---

## Dependencies

- [x] RBAC system implemented
- [x] Organization hierarchy in database
- [ ] Database aggregation queries
- [ ] Role-based route guards

---

## Notes

- **Important:** This is a RESTRICTED area of the application. Normal church users should never see these routes.
- Consider adding a "Switch to Oversight View" button for users with multiple roles
- Audit all database queries to ensure they respect organization boundaries
- Document any new environment variables or configuration needed

---

## Blockers

None currently identified.

---

**Last Updated:** April 11, 2025  
**Next Review:** Upon completion of Phase 2
