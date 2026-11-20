# AgileFlow User Manual

AgileFlow helps a team plan and track work the Agile way. Work is organised in three levels:

**Project → User Stories → Tasks**

A *project* is the overall goal, a *user story* is one requirement written from the user's point of view, and a *task* is a concrete piece of work that belongs to a story.

---

## 1. Getting started

### 1.1 Open the application
Start the backend and frontend (see the README), then open **http://localhost:5173** in your browser.

### 1.2 Create an account
1. On the login page click **Register**.
2. Enter your full name, e-mail and a password, then submit.
3. You are signed in automatically and land on the **Dashboard**.

> Every teammate must register their own account first. Only registered users can be added to a project.

### 1.3 Sign in / sign out
- **Sign in:** enter e-mail and password. On a fresh install you can click the demo-account hint on the login page (`demo@agileflow.local` / `Demo@1234`). Other seeded accounts: `alex@`, `sam@`, `priya@`, `jordan@agileflow.local` (same password).
- **Sample data:** a fresh install contains four example projects. *Customer Support Portal* is owned by Alex, so signed in as the demo user you see how a plain member's view differs from an owner's. To reload the samples, stop the backend, delete `backend\agileflow.db` and start again (this erases all data).
- **Sign out:** click the logout icon at the bottom of the left sidebar.
- Sessions expire after a while; if you are sent back to the login page, just sign in again.

### 1.4 Finding your way around
The dark sidebar on the left has: **Dashboard, Projects, User Stories, Tasks, Kanban Board, Team, Notifications, Profile**. On a phone, open it with the menu button in the top bar. A red badge on *Notifications* shows how many are unread.

---

## 2. Dashboard
Your overview across every project you belong to:
- Totals for **projects, user stories, tasks**, plus **completed, pending and overdue** tasks.
- **Overall progress %** and charts of tasks by status.
- **Recent activity** – who did what (created, moved, assigned, removed…).

---

## 3. Projects
**Create:** *Projects → New project* → give it a name, optional description, start date and deadline (the deadline cannot be earlier than the start). You become the project **Owner**.

**Browse:** use the search box to filter cards. Each card shows dates, team size and a progress bar (share of tasks that are Done).

**Open:** click a project to see its details: description, dates, progress, **team**, and all its stories with their tasks.

**Edit / delete:** use the pencil and trash icons (**owner only**). A project that still contains user stories cannot be deleted – delete its stories first. This protects you from losing work by accident.

---

## 4. User stories
Open **User Stories** (all projects, with a project selector) or work from a project's detail page.

1. Click **New story**.
2. Fill in the **title** (e.g. *As a customer I can reset my password*), **description**, **acceptance criteria** (how you will know it is done), **priority** (Low / Medium / High / Critical) and **status** (To Do / In Progress / Done).
3. Save. Use the search box and the priority/status filters to find stories; use the pencil to edit and the trash icon to delete.

A story that still has tasks cannot be deleted – remove or finish its tasks first.

---

## 5. Tasks
Open **Tasks** for a table of every task, or add tasks inside a story on the project page or from the Kanban board.

1. Click **New task** and choose the **user story** it belongs to.
2. Enter title, description, **priority**, **status** (To Do / In Progress / Testing / Done), **start date**, **due date** and the **assignee**.
3. The assignee list only contains members of that project. The due date cannot be earlier than the start date.
4. In the table, change a task's status straight from its status dropdown. Search and filter by project, status and priority.

---

## 6. Kanban board
**Kanban Board** shows four columns: **To Do → In Progress → Testing → Done**.

- **Drag a card** to another column to change its status – the change is saved immediately. If saving fails the card jumps back and an error message appears.
- **Click a card** to edit it.
- Tick **My tasks** to show only the tasks assigned to you.
- Use the project selector at the top to switch projects.

---

## 7. Managing your team

### Who can do what
| Action | Owner | Member |
|---|:-:|:-:|
| See the project, its stories, tasks and team | ✔ | ✔ |
| Create / edit / delete stories and tasks, move cards | ✔ | ✔ |
| Edit or delete the project | ✔ | ✖ |
| **Add or remove team members** | ✔ | ✖ |

People who are not in a project cannot see any of its data.

### Add a team member
1. Make sure the person has **registered** an account.
2. Go to **Team** (pick the project in the selector) *or* open the project's detail page.
3. In the **"Select a user to add…"** / **"Add member…"** dropdown choose the person and click **Add to project**.
4. They now see the project in their own account and can be assigned tasks.

If the dropdown says *"Everyone is already a member"*, every registered user is already on the project.

### Remove a team member
1. On **Team** or the project detail page click the **✕** next to the member (visible to the owner only).
2. Confirm in the dialog.
3. If the person has assigned tasks in this project, the dialog tells you how many. Confirming **keeps the tasks but makes them unassigned**, so you can give them to someone else afterwards.

Rules: the project **owner cannot be removed**, and you cannot add the same person twice. Removed members immediately lose access to the project.

### Workload
Each member card shows their role (Owner/Member) and the **number of tasks assigned** to them in that project – useful for balancing work.

---

## 8. Notifications
The system checks task deadlines automatically in the background (about once a minute) and creates a notification for the **assignee** when a task:
- is **due soon**, or
- is **overdue**.

Open **Notifications** to read them. Each shows its type and time. Click **Mark read** on one, or **Mark all read**; tick **Unread only** to hide the ones you have dealt with. You get at most one notification of each type per task, and tasks that are Done or unassigned are ignored. If a delivery fails it is retried a few times automatically.

---

## 9. Profile
Under **Profile** you can change your **name** and **password** (enter your current password to set a new one). Your e-mail address cannot be changed.

---

## 10. Typical workflow (example)
1. The project lead registers, creates the project *Website Redesign*.
2. Teammates register; the lead adds them under **Team**.
3. The team writes **user stories** with acceptance criteria.
4. Each story is broken into **tasks** with due dates and assignees.
5. During the sprint everybody drags their cards across the **Kanban board**.
6. The lead watches progress on the **Dashboard**; assignees get **notifications** for deadlines.
7. When all tasks are Done the project shows 100 % progress.

---

## 11. Troubleshooting
| Symptom | What to do |
|---|---|
| "Invalid credentials" | Check e-mail and password; register if you have no account. |
| Can't find a colleague in the add-member list | They must register first; reload the page. |
| "Member still has assigned tasks" (API) | Use the app (it unassigns automatically) or reassign the tasks first. |
| "Project still has user stories" / "Story still has tasks" | Delete the child items first – this is a safety rule. |
| Page keeps returning to login | Your session expired – sign in again. |
| Nothing loads / network error | Make sure the backend is running on port 8080. |
| Notifications don't appear yet | Wait about a minute after a task becomes due; only assigned, unfinished tasks qualify. |
