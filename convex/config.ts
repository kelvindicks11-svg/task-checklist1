import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const PASSCODE_KEY = "manager_passcode";
const TITLE_KEY = "app_title";

async function getConfigValue(ctx: any, key: string, fallback: string): Promise<string> {
  const entry = await ctx.db
    .query("config")
    .withIndex("by_key", (q: any) => q.eq("key", key))
    .unique();
  return entry?.value ?? fallback;
}

async function setConfigValue(ctx: any, key: string, value: string): Promise<void> {
  const existing = await ctx.db
    .query("config")
    .withIndex("by_key", (q: any) => q.eq("key", key))
    .unique();
  if (existing) {
    await ctx.db.patch(existing._id, { value });
  } else {
    await ctx.db.insert("config", { key, value });
  }
}

export const getPasscode = query({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await getConfigValue(ctx, PASSCODE_KEY, "1234");
  },
});

export const setPasscode = mutation({
  args: { passcode: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await setConfigValue(ctx, PASSCODE_KEY, args.passcode);
    return null;
  },
});

export const getTitle = query({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await getConfigValue(ctx, TITLE_KEY, "Task Checklist");
  },
});

export const setTitle = mutation({
  args: { title: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await setConfigValue(ctx, TITLE_KEY, args.title);
    return null;
  },
});
