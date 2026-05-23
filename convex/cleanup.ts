import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const clearAllCompletions = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const all = await ctx.db.query("completions").collect();
    for (const c of all) {
      await ctx.db.delete(c._id);
    }
    return null;
  },
});
