import fs from 'fs';
let c = fs.readFileSync('convex/tasks.ts', 'utf8');

// Fix both stats queries to use flatMap instead of map+null+filter
// Daily employeeStats
c = c.replace(
  `    return empList.map((name) => {\n      const total = activeTasks.filter((t) => t.assignedTo === name).length;\n      const completed = completions.filter((c) => c.completedBy === name).length;\n\n      if (total === 0 && completed === 0) return null;\n      return {\n        name,\n        completed,\n        total: total || completed,\n        percentage: Math.round((completed / (total || completed)) * 100),\n      };\n    }).filter((e) => e !== null) as NonNullable<typeof empList[0]>[];`,
  `    return empList.flatMap((name) => {\n      const total = activeTasks.filter((t) => t.assignedTo === name).length;\n      const completed = completions.filter((c) => c.completedBy === name).length;\n\n      if (total === 0 && completed === 0) return [];\n      return [{\n        name,\n        completed,\n        total: total || completed,\n        percentage: Math.round((completed / (total || completed)) * 100),\n      }];\n    });`
);

// Weekly weeklyEmployeeStats
c = c.replace(
  `    return empList.map((name) => {\n      const tasksForEmployee = activeTasks.filter((t) => t.assignedTo === name);\n      const dailyTasks = tasksForEmployee.filter((t) => t.type === "daily");\n      const weeklyTasks = tasksForEmployee.filter((t) => t.type === "weekly");\n      const total = dailyTasks.length * 7 + weeklyTasks.length;\n      const completed = weekCompletions.filter((c) => c.completedBy === name).length;\n\n      if (total === 0 && completed === 0) return null;\n      return {\n        name,\n        completed,\n        total: total || completed,\n        percentage: Math.round((completed / (total || completed)) * 100),\n      };\n    }).filter((e): e is NonNullable<typeof e> => e !== null);`,
  `    return empList.flatMap((name) => {\n      const tasksForEmployee = activeTasks.filter((t) => t.assignedTo === name);\n      const dailyTasks = tasksForEmployee.filter((t) => t.type === "daily");\n      const weeklyTasks = tasksForEmployee.filter((t) => t.type === "weekly");\n      const total = dailyTasks.length * 7 + weeklyTasks.length;\n      const completed = weekCompletions.filter((c) => c.completedBy === name).length;\n\n      if (total === 0 && completed === 0) return [];\n      return [{\n        name,\n        completed,\n        total: total || completed,\n        percentage: Math.round((completed / (total || completed)) * 100),\n      }];\n    });`
);

fs.writeFileSync('convex/tasks.ts', c);
console.log('Fixed with flatMap');