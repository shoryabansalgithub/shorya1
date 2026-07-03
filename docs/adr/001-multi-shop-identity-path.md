# Architecture Decision Record (ADR): 001 - Multi-Shop Identity Path

## Context
DukanAI currently operates on a strict 1-User to 1-Shop model where `User.shopId` is a NOT NULL foreign key. As DukanAI scales to Enterprise level, organizations may require a single identity (User) to own or access multiple shops.

## Decision
We will transition the Identity Architecture toward a multi-tenant hierarchy incrementally without breaking current constraints. The future path will involve:

1. **Decoupling `User.shopId`**:
   Currently, `User` is strongly bound to a single `Shop`. We will eventually make `User.shopId` nullable and introduce a junction table `UserShopMembership` (or similar) to handle many-to-many relationships.

2. **Tenant Context Switcher**:
   When users belong to multiple shops, their JWT will only represent an active session for *one* shop at a time. A new `/auth/switch-tenant` endpoint will issue a new JWT containing the selected `shopId`. 

3. **Global Identities**:
   Authentication will shift from tenant-scoped `(email, shopId)` to global `email`. The login flow will prompt for a Shop selection if the user belongs to multiple shops.

## Consequences
* **Positive**: Enterprise organizations can group multiple shops under a single owner identity. Users do not need separate credentials for different branches.
* **Negative**: Introduces complexity into the login flow (tenant selection step) and breaks the simplicity of single-tenant JWT generation.
* **Migration Strategy**: Existing `User.shopId` will be migrated into `UserShopMembership`, and `User.shopId` will be dropped.

## Status
**Proposed** - To be implemented in Epic 3 (Multi-Branch Management).
