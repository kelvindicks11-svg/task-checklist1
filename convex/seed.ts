import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seed = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db.query("tasks").take(1);
    if (existing.length > 0) return null;

    const EMPLOYEES = [
      "Alex", "Bailey", "Casey", "Drew", "Ellis",
      "Finn", "Gale", "Hayden", "Jordan",
    ];

    // Seed employees
    for (const name of EMPLOYEES) {
      const dup = await ctx.db.query("employees").withIndex("by_name", (q) => q.eq("name", name)).unique();
      if (!dup) {
        await ctx.db.insert("employees", { name });
      }
    }

    const dailyTasks = [
      { title: "Review daily sales report", link: "https://sheets.google.com", priority: "red" as const, assignedTo: "Alex", day: 0 },
      { title: "Check and respond to emails", link: "https://mail.google.com", priority: "red" as const, assignedTo: "Bailey", day: 1 },
      { title: "Update project tracker", link: "https://docs.google.com", priority: "amber" as const, assignedTo: "Casey", day: 1 },
      { title: "Team standup meeting notes", link: "https://meet.google.com", priority: "green" as const, assignedTo: "Drew", day: 2 },
      { title: "Review customer feedback", priority: "amber" as const, assignedTo: "Ellis", day: 2 },
      { title: "Process pending approvals", link: "https://admin.google.com", priority: "red" as const, assignedTo: "Finn", day: 3 },
      { title: "Update team calendar", link: "https://calendar.google.com", priority: "green" as const, assignedTo: "Gale", day: 3 },
      { title: "Monitor dashboard metrics", link: "https://analytics.google.com", priority: "amber" as const, assignedTo: "Hayden", day: 4 },
      { title: "Submit timesheet", link: "https://forms.google.com", priority: "red" as const, assignedTo: "Jordan", day: 4 },
      { title: "Check inventory levels", priority: "green" as const, assignedTo: "Alex", day: 5 },
      { title: "Prepare daily handover notes", link: "https://docs.google.com", priority: "amber" as const, assignedTo: "Bailey", day: 5 },
      { title: "Review open tickets", link: "https://chat.google.com", priority: "red" as const, assignedTo: "Casey", day: 6 },
    ];

    const weeklyTasks = [
      { title: "Submit weekly progress report", link: "https://docs.google.com", priority: "red" as const, assignedTo: "Ellis" },
      { title: "Team performance review", priority: "amber" as const, assignedTo: "Finn" },
      { title: "Update department wiki", link: "https://sites.google.com", priority: "green" as const, assignedTo: "Gale" },
      { title: "Process expense reports", link: "https://sheets.google.com", priority: "amber" as const, assignedTo: "Hayden" },
      { title: "Prepare Monday presentation", link: "https://slides.google.com", priority: "red" as const, assignedTo: "Jordan" },
    ];

    let order = 0;

    for (const task of dailyTasks) {
      await ctx.db.insert("tasks", {
        title: task.title,
        link: task.link,
        priority: task.priority,
        assignedTo: task.assignedTo,
        type: "daily",
        dayOfWeek: task.day,
        archived: false,
        order: order++,
      });
    }

    for (const task of weeklyTasks) {
      await ctx.db.insert("tasks", {
        title: task.title,
        link: task.link,
        priority: task.priority,
        assignedTo: task.assignedTo,
        type: "weekly",
        archived: false,
        order: order++,
      });
    }

    return null;
  },
});