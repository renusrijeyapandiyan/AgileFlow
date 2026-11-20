package com.agileflow.config;

import com.agileflow.entity.*;
import com.agileflow.enums.*;
import com.agileflow.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;

/** Creates demo accounts and sample data on first start (disable with SEED_DEMO=false). */
@Component
public class DataSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private final UserRepository users; private final ProjectRepository projects; private final ProjectMemberRepository members;
    private final UserStoryRepository stories; private final TaskRepository tasks; private final ActivityLogRepository logs;
    private final PasswordEncoder encoder; private final TransactionTemplate tx;
    private final boolean enabled; private final String password;

    public DataSeeder(UserRepository users, ProjectRepository projects, ProjectMemberRepository members, UserStoryRepository stories,
                      TaskRepository tasks, ActivityLogRepository logs, PasswordEncoder encoder, TransactionTemplate tx,
                      @Value("${agileflow.seed-demo:true}") boolean enabled, @Value("${agileflow.demo-password:Demo@1234}") String password) {
        this.users = users; this.projects = projects; this.members = members; this.stories = stories; this.tasks = tasks;
        this.logs = logs; this.encoder = encoder; this.tx = tx; this.enabled = enabled; this.password = password;
    }

    @Override
    public void run(String... args) {
        if (!enabled || users.count() > 0) return;
        tx.executeWithoutResult(s -> seed());
        log.info("Seeded demo data. Login: demo@agileflow.local / {}", password);
    }

    private void seed() {
        User demo = user("Demo User", "demo@agileflow.local");
        User alex = user("Alex Morgan", "alex@agileflow.local");
        User sam = user("Sam Rivera", "sam@agileflow.local");
        User priya = user("Priya Nair", "priya@agileflow.local");
        User jordan = user("Jordan Lee", "jordan@agileflow.local");

        // ---- 1. Website Redesign (demo owns) : active, a couple of overdue tasks ----
        Project web = project("Website Redesign", "Redesign the marketing website with a new design system, better SEO and faster pages.", -14, 45, demo, alex, sam, priya);
        UserStory w1 = story(web, "As a visitor I can browse the new landing page", "Responsive hero, features and pricing sections.",
                "Lighthouse score above 90; works on mobile and desktop.", Priority.HIGH, StoryStatus.IN_PROGRESS);
        UserStory w2 = story(web, "As an admin I can edit page content", "Simple CMS so marketing can change copy without a developer.",
                "Edits appear live within 1 minute; changes are versioned.", Priority.MEDIUM, StoryStatus.TO_DO);
        UserStory w3 = story(web, "As a visitor I can find pages through search engines", "Meta tags, sitemap and structured data.",
                "All pages have unique titles and descriptions; sitemap.xml published.", Priority.LOW, StoryStatus.TO_DO);
        task(w1, "Design hero section", "Create Figma mockups for desktop and mobile hero.", alex, Priority.HIGH, TaskStatus.DONE, -10, -3);
        task(w1, "Implement responsive navigation", "Sticky header with collapsible mobile menu.", demo, Priority.MEDIUM, TaskStatus.IN_PROGRESS, -5, 1);
        task(w1, "Optimize images", "Convert to WebP and lazy-load below the fold.", sam, Priority.LOW, TaskStatus.TESTING, -4, 4);
        task(w1, "Fix footer layout bug", "Footer links overlap on tablet widths.", alex, Priority.CRITICAL, TaskStatus.TO_DO, -3, -1);
        task(w2, "Choose CMS provider", "Compare three headless CMS options and recommend one.", demo, Priority.MEDIUM, TaskStatus.TO_DO, 0, 10);
        task(w2, "Write content model", "Define page, section and media content types.", sam, Priority.LOW, TaskStatus.TO_DO, 2, 14);
        task(w3, "Add meta tags and Open Graph data", "Titles, descriptions and social preview images.", priya, Priority.MEDIUM, TaskStatus.IN_PROGRESS, -2, 2);
        task(w3, "Generate sitemap.xml", "Auto-generate on build and submit to search consoles.", priya, Priority.LOW, TaskStatus.TO_DO, 3, 20);
        activity(web, demo, "CREATED", "PROJECT", web.getName());
        activity(web, demo, "ADDED_MEMBER", "MEMBER", "Alex Morgan");
        activity(web, demo, "ADDED_MEMBER", "MEMBER", "Priya Nair");
        activity(web, alex, "MOVED", "TASK", "Design hero section → Done");

        // ---- 2. Mobile App Launch (demo owns) : mid-sprint, healthy ----
        Project app = project("Mobile App Launch", "Ship version 1.0 of the iOS and Android app to both app stores.", -30, 60, demo, alex, jordan);
        UserStory m1 = story(app, "As a user I can sign up and log in", "E-mail/password and social sign-in.",
                "Account created in under 30 seconds; password reset works.", Priority.CRITICAL, StoryStatus.DONE);
        UserStory m2 = story(app, "As a user I can receive push notifications", "Reminders and updates delivered to my device.",
                "Opt-in prompt shown once; notifications open the right screen.", Priority.HIGH, StoryStatus.IN_PROGRESS);
        UserStory m3 = story(app, "As a product owner I can see usage analytics", "Track key funnel events in the app.",
                "Sign-up, activation and retention events visible in the dashboard.", Priority.MEDIUM, StoryStatus.TO_DO);
        task(m1, "Build sign-up screen", "Form validation and error states.", jordan, Priority.HIGH, TaskStatus.DONE, -28, -20);
        task(m1, "Integrate social login", "Google and Apple sign-in.", alex, Priority.MEDIUM, TaskStatus.DONE, -22, -12);
        task(m2, "Set up push provider", "Configure FCM and APNs credentials.", jordan, Priority.HIGH, TaskStatus.TESTING, -8, 2);
        task(m2, "Notification deep links", "Open the correct screen from a tapped notification.", alex, Priority.MEDIUM, TaskStatus.IN_PROGRESS, -3, 7);
        task(m2, "Opt-in permission flow", "Explain value before the system prompt.", demo, Priority.MEDIUM, TaskStatus.TO_DO, 1, 9);
        task(m3, "Define analytics events", "Agree on naming and properties.", demo, Priority.LOW, TaskStatus.TO_DO, 4, 15);
        task(m3, "Submit to app stores", "Prepare screenshots, descriptions and review submission.", jordan, Priority.CRITICAL, TaskStatus.TO_DO, 20, 55);
        activity(app, demo, "CREATED", "PROJECT", app.getName());
        activity(app, demo, "ADDED_MEMBER", "MEMBER", "Jordan Lee");
        activity(app, jordan, "MOVED", "TASK", "Build sign-up screen → Done");

        // ---- 3. Customer Support Portal (Alex owns, demo is a MEMBER): shows member permissions ----
        Project sup = project("Customer Support Portal", "Self-service help center and ticketing for customers.", -7, 90, alex, demo, sam);
        UserStory c1 = story(sup, "As a customer I can search help articles", "Full-text search across the knowledge base.",
                "Results in under 1 second; typo tolerant.", Priority.HIGH, StoryStatus.IN_PROGRESS);
        UserStory c2 = story(sup, "As a customer I can open and track a ticket", "Create tickets and follow their status.",
                "E-mail confirmation sent; status visible in the portal.", Priority.HIGH, StoryStatus.TO_DO);
        task(c1, "Index existing articles", "Import 300 articles into the search service.", sam, Priority.HIGH, TaskStatus.IN_PROGRESS, -5, 3);
        task(c1, "Design search results page", "Filters, highlights and empty state.", demo, Priority.MEDIUM, TaskStatus.TESTING, -4, 0);
        task(c2, "Ticket form and validation", "Subject, category, attachments.", demo, Priority.MEDIUM, TaskStatus.TO_DO, 1, 12);
        task(c2, "Ticket status e-mails", "Send updates when status changes.", alex, Priority.LOW, TaskStatus.TO_DO, 5, 25);
        activity(sup, alex, "CREATED", "PROJECT", sup.getName());
        activity(sup, alex, "ADDED_MEMBER", "MEMBER", "Demo User");

        // ---- 4. Q4 Marketing Campaign (demo owns): nearly finished ----
        Project mkt = project("Q4 Marketing Campaign", "Seasonal campaign across e-mail, social and paid ads.", -45, 6, demo, priya, jordan);
        UserStory k1 = story(mkt, "As marketing I can launch the e-mail series", "Three-part nurture sequence.",
                "Sequence live; open rate tracked.", Priority.HIGH, StoryStatus.DONE);
        UserStory k2 = story(mkt, "As marketing I can report campaign results", "One-page summary for leadership.",
                "Includes spend, leads and conversion by channel.", Priority.MEDIUM, StoryStatus.IN_PROGRESS);
        task(k1, "Write e-mail copy", "Subject lines and body for all three e-mails.", priya, Priority.HIGH, TaskStatus.DONE, -40, -30);
        task(k1, "Build e-mail templates", "Responsive templates in the ESP.", jordan, Priority.MEDIUM, TaskStatus.DONE, -35, -25);
        task(k1, "Schedule and send", "Schedule across three weeks.", priya, Priority.MEDIUM, TaskStatus.DONE, -24, -15);
        task(k2, "Collect channel metrics", "Export from ads, social and e-mail tools.", jordan, Priority.MEDIUM, TaskStatus.DONE, -10, -2);
        task(k2, "Write results summary", "Draft one-page report for leadership.", demo, Priority.HIGH, TaskStatus.IN_PROGRESS, -2, 2);
    }

    private Project project(String name, String desc, int startOffset, int deadlineOffset, User owner, User... team) {
        Project p = new Project();
        p.setName(name); p.setDescription(desc);
        p.setStartDate(LocalDate.now().plusDays(startOffset)); p.setDeadline(LocalDate.now().plusDays(deadlineOffset));
        p.setOwner(owner);
        p = projects.save(p);
        member(p, owner, MemberRole.OWNER);
        for (User u : team) member(p, u, MemberRole.MEMBER);
        return p;
    }

    private void activity(Project p, User u, String action, String type, String details) {
        ActivityLog a = new ActivityLog();
        a.setProject(p); a.setUser(u); a.setAction(action); a.setEntityType(type); a.setEntityId(p.getId()); a.setDetails(details);
        logs.save(a);
    }

    private User user(String name, String email) {
        User u = new User(); u.setName(name); u.setEmail(email); u.setPasswordHash(encoder.encode(password));
        return users.save(u);
    }

    private void member(Project p, User u, MemberRole r) {
        ProjectMember m = new ProjectMember(); m.setProject(p); m.setUser(u); m.setRole(r); members.save(m);
    }

    private UserStory story(Project p, String title, String desc, String ac, Priority pr, StoryStatus st) {
        UserStory s = new UserStory(); s.setProject(p); s.setTitle(title); s.setDescription(desc); s.setAcceptanceCriteria(ac);
        s.setPriority(pr); s.setStatus(st);
        return stories.save(s);
    }

    private void task(UserStory s, String title, String desc, User assignee, Priority pr, TaskStatus st, int startOffset, int dueOffset) {
        Task t = new Task(); t.setStory(s); t.setTitle(title); t.setDescription(desc); t.setAssignee(assignee);
        t.setPriority(pr); t.setStatus(st);
        t.setStartDate(LocalDate.now().plusDays(startOffset)); t.setDueDate(LocalDate.now().plusDays(dueOffset));
        tasks.save(t);
    }
}
