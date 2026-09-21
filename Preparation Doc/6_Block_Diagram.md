# Prompt for Generating Block Diagram (Horizontal)

Kyunki aap block diagram khud banane wale ho (ya kisi AI tool/designer se banwane wale ho), toh maine aapke poore project ko scan karke ek ekdum **Deep aur Logical Flowchart Structure** banaya hai. 

Isme theory kam aur sirf "kaunsa block kahan jayega aur arrow kis taraf jayega" ispe focus kiya gaya hai. 

Neeche diya gaya **"Master Prompt"** aap directly copy karke kisi bhi flowchart AI (jaise ChatGPT Plus, Eraser.io, Whimsical) ko de sakte ho, ya khud Canva/Visio pe is structure ko dekh ke design kar sakte ho.

---

### **Master Prompt (Copy & Paste this):**

Create a highly detailed, **HORIZONTAL** Block Diagram for an enterprise-level "Multi-Tenant Skill Demand Intelligence Ecosystem." 

The flowchart must flow strictly horizontally from Left to Right, divided into 5 distinct logical layers. Please use professional IT architecture styling.

**Layer 1: User Roles (Extreme Left)**
Create 4 distinct user blocks:
1. Job Seekers / Candidates
2. Employers / Recruiters
3. Training Institutes / Colleges
4. Government / State Administrators

**Layer 2: Frontend Portals (Micro-Frontends)**
Create 4 separate portal blocks and connect them horizontally to their respective users from Layer 1:
1. **Client Portal ('Insiders')**: Connected to Job Seekers and Employers.
2. **Institute Admin Portal**: Connected to Training Institutes.
3. **State Admin Portal**: Connected to Government Administrators.
4. **Super Admin Portal**: Independent global control panel.

**Layer 3: Core Backend (The Gateway)**
Create a large central block named **Node.js / Express API Gateway**.
- Draw bi-directional horizontal arrows connecting ALL the 4 Frontend Portals from Layer 2 into this central Gateway.
- Add a small sub-block inside or attached to the Gateway named **Socket.IO (Real-Time Events)**.

**Layer 4: AI Intelligence Layer (The Brain)**
Create a dedicated vertical stack of AI processing blocks next to the Backend. Connect the API Gateway to these blocks:
1. **Resume Parser & Smart Job Matcher**
2. **Curriculum Gap Analyzer** 
3. **Predictive "What-If" Simulator**
- Enclose these 3 blocks in a larger box labeled **"Generative AI Engine (Google Gemini)"**.

**Layer 5: Database Layer (Extreme Right)**
Create a database cylinder block on the far right.
- Name it **Centralized Cloud Database (MongoDB)**.
- Draw bi-directional horizontal arrows connecting the "Core Backend (Layer 3)" and the "AI Intelligence Layer (Layer 4)" directly to this Database block.

**Data Flow Annotations (Text on Arrows):**
Please label the connecting arrows with the following actions:
- Arrow from *Client Portal* to *AI Layer*: "Resume Upload & Semantic Matching"
- Arrow from *Institute Portal* to *AI Layer*: "Syllabus vs Industry Demand"
- Arrow from *State Portal* to *AI Layer*: "Policy Simulation & Forecasting"
- Arrows from *API Gateway* to *Database*: "Read/Write State Synchronization"

Make sure the entire diagram is strictly **HORIZONTAL** (Landscape mode) to fit perfectly on a standard 16:9 PowerPoint Presentation slide. Use modern colors (e.g., Blue for Frontend, Green for Backend, Purple for AI, and Orange for Database).

---

### **Khud banate time dhyan rakhne wali baatein:**
Bhai, agar tu khud draw kar raha hai toh bas page ko landscape (aada) pakadna aur **5 Columns** banana:
**User -> Portals -> API Backend -> AI Engine -> Database**
Aur sabhi boxes ko ek dusre se arrow se jod dena. Ye architecture ekdum solid aur technically 100% accurate hai tere project ke hisaab se.
