# Step 7: Govt Admin UI for Unresolved Skills (Human-in-the-Loop)

## Background Context
The Gemini AI is successfully extracting skills from Employer Job Descriptions. However, because our `Skill` Master Database is currently empty (or missing some skills), Gemini safely places these new skills into the `UnresolvedSkill` database instead of blindly creating official skills.

This is where the **Government Admin** steps in. The admin acts as the gatekeeper. They will review these "Unknown Skills" and approve them. Only after approval will they become official Master Skills. This prevents spam, duplicates, and fake skills in the government's database.

## Proposed Changes

### 1. Backend APIs (Government Admin)
We need to give the Government Admin the power to fetch and resolve these skills.

#### [NEW] `server/controllers/adminSkillResolutionController.js`
- `getUnresolvedSkills`: Fetch all pending skills from the `UnresolvedSkill` collection.
- `resolveSkill`: Admin action to either `approve` (creates a new Master `Skill` and marks as resolved) or `reject` (marks as rejected).

#### [MODIFY] `server/routes/adminIntelligenceRoutes.js`
- Route `GET /unresolved-skills`
- Route `POST /unresolved-skills/:id/resolve`

### 2. Frontend Government Admin UI
We need a clean interface in the Government Admin Dashboard to review these AI-extracted skills.

#### [NEW] `client/src/pages/admin/UnresolvedSkills.jsx`
- A data table displaying all pending skills extracted by Gemini.
- Columns: `Raw Name`, `Normalized Name`, `Confidence`, `Source`, `Actions (Approve/Reject)`
- When "Approve" is clicked, it calls the backend to officially add the skill to the Master Database.

#### [MODIFY] `client/src/App.jsx`
- Add route for `/government-admin/unresolved-skills`

#### [MODIFY] `client/src/components/admin/AdminSidebar.jsx`
- Add a new navigation link "Review AI Skills" to the sidebar.

## Verification Plan

### Manual Verification
1. Login to the Government Admin portal.
2. Go to the "Review AI Skills" page.
3. You should see the 4 skills that Gemini extracted earlier ("Python", "SQL", etc.).
4. Click "Approve" on one of them.
5. The skill should disappear from the list and be officially added to the Master Database.

> [!NOTE]
> Please review this plan. This is exactly how we give control to the Government to manage the AI! If you approve, I will write the code.
