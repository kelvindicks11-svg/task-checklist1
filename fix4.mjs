import fs from 'fs';
let c = fs.readFileSync("src/routes/index.tsx", "utf8");

const staffBtns = `<span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 ml-3 mr-1">Staff</span><button onClick={()=>setAf('all')} className={\`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all \${af==='all'?'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 shadow-sm':'text-gray-500 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-gray-800/60'}\`}>All</button>{empList.map(n=><button key={n} onClick={()=>setAf(n)} className={\`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all \${af===n?'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 shadow-sm':'text-gray-500 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-gray-800/60'}\`}>{n}</button>)}`;

// Replace dropdown in daily tab
c = c.replace(
  `<select value={af} onChange={e=>setAf(e.target.value)} className="rounded-md border border-gray-200/70 dark:border-gray-700/70 bg-white/50 dark:bg-gray-800/50 px-2 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"><option value="all">All</option>{empList.map(n=><option key={n} value={n}>{n}</option>)}</select>`,
  staffBtns
);

// Add staff buttons to the weekly tab's priority line
// The weekly line currently has: `<div className="flex items-center gap-1 pb-2"><span...Priority</span>...</div>`
// We need to find it and append staff buttons
c = c.replace(
  `<div className="flex items-center gap-1 pb-2"><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mr-1">Priority</span>{opts.map(p=><button key={p} onClick={()=>setPf(p)} className={\`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all \${pf===p?pa[p]:pi[p]}\`}>{pl[p]}</button>)}</div>
    </div></div>}

    <main className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6">`,
  `<div className="flex items-center gap-1 pb-2"><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mr-1">Priority</span>{opts.map(p=><button key={p} onClick={()=>setPf(p)} className={\`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all \${pf===p?pa[p]:pi[p]}\`}>{pl[p]}</button>)}${staffBtns}</div>
    </div></div>}

    <main className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6">`
);

fs.writeFileSync("src/routes/index.tsx", c);
console.log("Updated assignee to buttons");