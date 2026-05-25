import fs from 'fs';
let c = fs.readFileSync("src/routes/index.tsx", "utf8");

c = c.replace("function TaskList({type,day,dateStr,pf}", `function gtc(p,ic){var b=p==="red"?"border-red-200/60 dark:border-red-900/40 bg-gradient-to-r from-red-50/70 via-red-50/40 to-transparent dark:from-red-950/30 dark:via-red-950/15":p==="amber"?"border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-r from-amber-50/70 via-amber-50/40 to-transparent dark:from-amber-950/30 dark:via-amber-950/15":"border-green-200/60 dark:border-green-900/40 bg-gradient-to-r from-green-50/70 via-green-50/40 to-transparent dark:from-green-950/30 dark:via-green-950/15";return ic?"opacity-70 border-gray-100/30 dark:border-gray-800/30 bg-gray-50/20 dark:bg-gray-900/20":b}\nfunction TaskList({type,day,dateStr,pf}`);

const oldBlock = c.match(/<div className="space-y-2">{act\.map.*?<\/div><\/div>\)\n\}/s);
if (!oldBlock) { console.log("Not found!"); process.exit(1); }

const newContent = `<div className="space-y-3">{act.map(task=>{const ic=cids.has(task._id);const com=comp.find(x=>x.taskId===task._id);return(<div key={task._id} className={"group relative overflow-hidden rounded-xl border-2 transition-all duration-200 " + gtc(task.priority,ic) + " shadow-sm hover:shadow-lg"}>
      <div className="flex items-start gap-4 p-5"><div className="flex-shrink-0 pt-0.5"><button onClick={()=>ht(task._id,cb[task._id]||task.assignedTo)} className={"h-6 w-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 " + (ic?"bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 text-white shadow-sm shadow-blue-500/20":"border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm")}>{ic&&<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}</button></div>
        <div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-2"><span className={"text-base font-semibold truncate " + (ic?"text-gray-400 dark:text-gray-500 line-through":"text-gray-900 dark:text-white")}>{task.title}</span></div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={"inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide " + (task.priority==="red"?"bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400":task.priority==="amber"?"bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400":"bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400")}>{task.priority==="red"?"🔴 High":task.priority==="amber"?"🟡 Medium":"🟢 Low"}</span>
            {task.link&&<a href={task.link} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="inline-flex items-center gap-1 rounded-full bg-blue-50/70 dark:bg-blue-900/15 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all hover:shadow-sm"><svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg> Link</a>}
            <select value={cb[task._id]||task.assignedTo} onChange={e=>setCb(prev=>({...prev,[task._id]:e.target.value}))} onClick={e=>e.stopPropagation()} className={"text-xs rounded-full border px-2.5 py-1 font-medium transition-all " + (ic?"border-gray-200/50 dark:border-gray-700/50 text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/50":"border-gray-200/70 dark:border-gray-700/70 text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10")}>{ae.map(n=><option key={n} value={n}>{n}</option>)}</select>
            {ic&&com&&<span className="text-xs text-gray-400 dark:text-gray-500 font-medium">✓ {com.completedBy}</span>}
          </div>
        </div>
        {type==="weekly"&&ic&&<button onClick={()=>ar({taskId:task._id})} className="flex-shrink-0 rounded-lg p-2 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all opacity-0 group-hover:opacity-100" title="Archive task"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg></button>}
      </div>
    </div>)})}</div></div>)`;

c = c.replace(oldBlock[0], newContent);
fs.writeFileSync("src/routes/index.tsx", c);
console.log("Done");