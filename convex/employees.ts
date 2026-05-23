import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const employees = await ctx.db.query("employees").order("asc").collect();
    return employees.map((e) => e.name);
  },
});

export const add = mutation({
  args: { name: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (!name) return null;
    const existing = await ctx.db
      .query("employees")
      .withIndex("by_name", (q) => q.eq("name", name))
      .unique();
    if (existing) return null;
    await ctx.db.insert("employees", { name });
    return null;
  },
});

export const remove = mutation({
  args: { name: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("employees")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return null;
  },
});
