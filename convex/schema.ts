import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  tasks: defineTable({
    title: v.string(),
    link: v.optional(v.string()),
    priority: v.union(v.literal("red"), v.literal("amber"), v.literal("green")),
    assignedTo: v.string(),
    type: v.union(v.literal("daily"), v.literal("weekly")),
    dayOfWeek: v.optional(v.number()),
    archived: v.boolean(),
    order: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_day", ["dayOfWeek"])
    .index("by_assigned", ["assignedTo"])
    .index("by_type_and_day", ["type", "dayOfWeek"]),

  completions: defineTable({
    taskId: v.id("tasks"),
    date: v.string(),
    completedBy: v.string(),
    completedAt: v.number(),
  })
    .index("by_task_and_date", ["taskId", "date"])
    .index("by_date", ["date"])
    .index("by_completedBy", ["completedBy"]),

  employees: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  config: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
});
