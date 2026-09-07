# Goal: Placement Feedback Loop & Application Tracking

Aapka question 100% valid aur ekdum point par hai! Agar system ko pata hi nahi ki bachcha Test ya GD pass karke Interview tak pohocha hai, toh AI feedback kab aur kisse mangega? Yeh ek basic flaw tha jisko aapne bohot sahi se pakda.

Is feature ko hum **Employer / Company Portal** (jo `admin` folder mein hai) mein implement karenge. 

Yahan detail plan hai ki yeh system mein practically kaise kaam karega:

## 1. How will the system track the student's journey?
Abhi database mein Job Application ka status sirf "Pending" hota hai. Humein isko ek proper **Applicant Tracking System (ATS)** pipeline mein convert karna hoga.

**New Status Pipeline:**
`Pending` ➡️ `Test_Cleared` ➡️ `GD_Cleared` ➡️ `Interview_Scheduled` ➡️ `Hired` / `Rejected`

**Company Portal (admin) UI Update:**
Company dashboard mein jahan HR applications dekhta hai, wahan hum ek **Status Update Dropdown** (ya Kanban board) dalenge. Jab bachcha Test pass karega, HR uska status "Test_Cleared" kar dega. Jab GD pass karega, toh "GD_Cleared".

## 2. When will the Feedback happen?
Jab HR candidate ka status **`Interview_Scheduled`** ke baad **`Rejected`** ya **`Hired`** mein change karega, sirf tab system automatically ek **"Skill Feedback Modal"** (Popup) open karega. 

System HR se puchega: 
*"Aapne is candidate ka interview liya. Job ke liye [React, Node.js, AWS] chahiye tha. In skills mein candidate kaisa tha?"*

HR simple rating dega:
- React: ✅ Strong
- Node.js: ⚠️ Weak
- AWS: ❌ Missing

## Proposed Changes

### Database Models

#### [MODIFY] `server/models/JobApplication.js`
- Update `status` field to accept specific pipeline stages: `enum: ['Pending', 'Test_Cleared', 'GD_Cleared', 'Interview_Scheduled', 'Hired', 'Rejected']`.

#### [NEW] `server/models/EmployerFeedback.js`
- Create a new collection to store the feedback. Fields: `companyId`, `jobId`, `candidateId`, `skillsFeedback: [{ skillName, rating }]`.

### Backend APIs

#### [MODIFY] `server/controllers/companyController.js`
- Update the API that changes application status (`changeJobApplicationStatus`) to support the new pipeline stages.
- Create a new API endpoint `/api/company/feedback` to save the feedback form data.

### Frontend (Company Portal)

#### [MODIFY] `admin/src/pages/ViewApplications.jsx`
- Update the UI to show the new status pipeline.
- Add the ability for HR to change statuses step-by-step.

#### [NEW] `admin/src/components/SkillFeedbackModal.jsx`
- Create a popup component that triggers only when status changes to `Hired` or `Rejected`.
- Fetch the required skills for that specific job and render a quick rating form for the HR.

## Open Questions for You
1. Aapke hisab se pipeline stages (`Pending`, `Test_Cleared`, `GD_Cleared`, `Interview_Scheduled`, `Hired`, `Rejected`) sahi hain, ya koi aur stage bhi add karna chahiye?
2. Kya humein yeh Feedback submit karna HR ke liye **Mandatory** (compulsory) rakhna chahiye jab wo kisi ko reject karein, ya **Optional**? (Agar compulsory rakhenge toh AI ko zyada data milega, par HR irritate ho sakta hai).
