import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Task Queries ───────────────────────────────────────────────────────────

export const list = query({
  args: {
    type: v.optional(v.union(v.literal("daily"), v.literal("weekly"))),
    dayOfWeek: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("tasks"),
      _creationTime: v.number(),
      title: v.string(),
      link: v.optional(v.string()),
      priority: v.union(v.literal("red"), v.literal("amber"), v.literal("green")),
      assignedTo: v.string(),
      type: v.union(v.literal("daily"), v.literal("weekly")),
      dayOfWeek: v.optional(v.number()),
      archived: v.boolean(),
      order: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    if (args.type && args.dayOfWeek !== undefined) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_type_and_day", (q) =>
          q.eq("type", args.type!).eq("dayOfWeek", args.dayOfWeek!),
        )
        .order("asc")
        .collect();
    }
    if (args.type) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .order("asc")
        .collect();
    }
    return await ctx.db.query("tasks").order("asc").collect();
  },
});

export const get = query({
  args: { taskId: v.id("tasks") },
  returns: v.union(
    v.object({
      _id: v.id("tasks"),
      _creationTime: v.number(),
      title: v.string(),
      link: v.optional(v.string()),
      priority: v.union(v.literal("red"), v.literal("amber"), v.literal("green")),
      assignedTo: v.string(),
      type: v.union(v.literal("daily"), v.literal("weekly")),
      dayOfWeek: v.optional(v.number()),
      archived: v.boolean(),
      order: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.taskId);
  },
});

// ─── Task Mutations ─────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    title: v.string(),
    link: v.optional(v.string()),
    priority: v.union(v.literal("red"), v.literal("amber"), v.literal("green")),
    assignedTo: v.string(),
    type: v.union(v.literal("daily"), v.literal("weekly")),
    dayOfWeek: v.optional(v.number()),
  },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("tasks")
      .order("desc")
      .take(1);

    const maxOrder = existing.length > 0 ? existing[0].order : -1;

    return await ctx.db.insert("tasks", {
      title: args.title,
      link: args.link,
      priority: args.priority,
      assignedTo: args.assignedTo,
      type: args.type,
      dayOfWeek: args.dayOfWeek,
      archived: false,
      order: maxOrder + 1,
    });
  },
});

export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    link: v.optional(v.string()),
    priority: v.optional(
      v.union(v.literal("red"), v.literal("amber"), v.literal("green")),
    ),
    assignedTo: v.optional(v.string()),
    dayOfWeek: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { taskId, ...fields } = args;
    const patch: Record<string, any> = {};
    if (fields.title !== undefined) patch.title = fields.title;
    if (fields.link !== undefined) patch.link = fields.link;
    if (fields.priority !== undefined) patch.priority = fields.priority;
    if (fields.assignedTo !== undefined) patch.assignedTo = fields.assignedTo;
    if (fields.dayOfWeek !== undefined) patch.dayOfWeek = fields.dayOfWeek;
    await ctx.db.patch(taskId, patch);
    return null;
  },
});

export const archive = mutation({
  args: { taskId: v.id("tasks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, { archived: true });
    return null;
  },
});

export const unarchive = mutation({
  args: { taskId: v.id("tasks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, { archived: false });
    return null;
  },
});

export const remove = mutation({
  args: { taskId: v.id("tasks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Delete associated completions
    const completions = await ctx.db
      .query("completions")
      .withIndex("by_task_and_date", (q) => q.eq("taskId", args.taskId))
      .collect();

    for (const c of completions) {
      await ctx.db.delete(c._id);
    }

    await ctx.db.delete(args.taskId);
    return null;
  },
});

export const reorder = mutation({
  args: { taskIds: v.array(v.id("tasks")) },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (let i = 0; i < args.taskIds.length; i++) {
      await ctx.db.patch(args.taskIds[i], { order: i });
    }
    return null;
  },
});

// ─── Completion Queries ─────────────────────────────────────────────────────

export const getCompletionsForDate = query({
  args: { date: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("completions"),
      _creationTime: v.number(),
      taskId: v.id("tasks"),
      date: v.string(),
      completedBy: v.string(),
      completedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("completions")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
  },
});

export const getCompletionForTaskOnDate = query({
  args: { taskId: v.id("tasks"), date: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("completions"),
      _creationTime: v.number(),
      taskId: v.id("tasks"),
      date: v.string(),
      completedBy: v.string(),
      completedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("completions")
      .withIndex("by_task_and_date", (q) =>
        q.eq("taskId", args.taskId).eq("date", args.date),
      )
      .unique();
  },
});

// ─── Completion Mutations ───────────────────────────────────────────────────

export const completeTask = mutation({
  args: {
    taskId: v.id("tasks"),
    date: v.string(),
    completedBy: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("completions")
      .withIndex("by_task_and_date", (q) =>
        q.eq("taskId", args.taskId).eq("date", args.date),
      )
      .unique();

    if (existing) {
      // Toggle off
      await ctx.db.delete(existing._id);
    } else {
      await ctx.db.insert("completions", {
        taskId: args.taskId,
        date: args.date,
        completedBy: args.completedBy,
        completedAt: Date.now(),
      });
    }
    return null;
  },
});

export const uncompleteTask = mutation({
  args: { taskId: v.id("tasks"), date: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("completions")
      .withIndex("by_task_and_date", (q) =>
        q.eq("taskId", args.taskId).eq("date", args.date),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return null;
  },
});

// ─── Employee Stats ──────────────────────────────────────────────────────────

export const employees = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const dbEmps = await ctx.db.query("employees").order("asc").collect();
    return dbEmps.map((e) => e.name);
  },
});

async function getEmployeeNames(ctx: any): Promise<string[]> {
  const dbEmps = await ctx.db.query("employees").order("asc").collect();
  const empSet = new Set<string>(dbEmps.map((e: any) => e.name));
  // Include names from task assignments only
  const allTasks = await ctx.db.query("tasks").collect();
  for (const t of allTasks) {
    if (t.assignedTo && t.assignedTo !== "Un-assigned") empSet.add(t.assignedTo);
  }
  return [...empSet].sort() as string[];
}

export const employeeStats = query({
  args: { date: v.string() },
  returns: v.array(
    v.object({
      name: v.string(),
      completed: v.number(),
      total: v.number(),
      percentage: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const allTasks = await ctx.db.query("tasks").collect();
    const activeTasks = allTasks.filter((t) => !t.archived);
    const empList = await getEmployeeNames(ctx);

    const completions = await ctx.db
      .query("completions")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    return empList.flatMap((name) => {
      const total = activeTasks.filter((t) => t.assignedTo === name).length;
      const completed = completions.filter((c) => c.completedBy === name).length;
      if (total === 0 && completed === 0) return [];
      return [{
        name,
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      }];
    });
  },
});

export const weeklyEmployeeStats = query({
  args: { weekStart: v.string() },
  returns: v.array(
    v.object({
      name: v.string(),
      completed: v.number(),
      total: v.number(),
      percentage: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const startDate = new Date(args.weekStart + "T00:00:00");
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${day}`);
    }

    const allTasks = await ctx.db.query("tasks").collect();
    const activeTasks = allTasks.filter((t) => !t.archived);
    const allCompletions = await ctx.db.query("completions").collect();
    const weekCompletions = allCompletions.filter((c) => dates.includes(c.date));
    const empList = await getEmployeeNames(ctx);

    return empList.flatMap((name) => {
      const tasksForEmployee = activeTasks.filter((t) => t.assignedTo === name);
      const dailyTasks = tasksForEmployee.filter((t) => t.type === "daily");
      const weeklyTasks = tasksForEmployee.filter((t) => t.type === "weekly");
      const total = dailyTasks.length * 7 + weeklyTasks.length;
      const completed = weekCompletions.filter((c) => c.completedBy === name).length;

      if (total === 0 && completed === 0) return [];
      return [{
        name,
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      }];
    });
  },
});