import fs from 'fs';
let c = fs.readFileSync("src/routes/index.tsx", "utf8");

// Add employee filter to daily priority bar
c = c.replace(
  '<div className="flex items-center gap-1 pb-2"><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mr-1">Priority</span>{opts.map(p=><button key={p} onClick={()=>setPf(p)} className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${pf===p?pa[p]:pi[p]}`}>{pl[p]}</button>)}</div>',
  '<div className="flex items-center gap-1 pb-2"><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mr-1">Priority</span>{opts.map(p=><button key={p} onClick={()=>setPf(p)} className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${pf===p?pa[p]:pi[p]}`}>{pl[p]}</button>)}<span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 ml-3 mr-1">Assignee</span><select value={af} onChange={e=>setAf(e.target.value)} className="rounded-md border border-gray-200/70 dark:border-gray-700/70 bg-white/50 dark:bg-gray-800/50 px-2 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"><option value="all">All</option>{empList.map(n=><option key={n} value={n}>{n}</option>)}</select></div>'
);

// Update TaskList to accept af and filter by it
c = c.replace(
  'function TaskList({type,day,dateStr,pf}:{type:TaskType;day:number;dateStr:string;pf:Priority|\'all\'})',
  'function TaskList({type,day,dateStr,pf,af}:{type:TaskType;day:number;dateStr:string;pf:Priority|\'all\';af:string})'
);

c = c.replace(
  'const act=tasks.filter(t=>!t.archived).filter(t=>pf===\'all\'||t.priority===pf).sort',
  'const act=tasks.filter(t=>!t.archived).filter(t=>pf===\'all\'||t.priority===pf).filter(t=>af===\'all\'||t.assignedTo===af).sort'
);

// Update TaskList call to pass af
c = c.replace(
  '<TaskList type={tab} day={today} dateStr={sds} pf={pf}/>',
  '<TaskList type={tab} day={today} dateStr={sds} pf={pf} af={af}/>'
);

fs.writeFileSync("src/routes/index.tsx", c);
console.log("Added employee filter");