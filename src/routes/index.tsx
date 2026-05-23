import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState, useEffect, useCallback } from 'react'
import type { Id } from '../../convex/_generated/dataModel'

export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: 'Workplace Task Checklist' }] }),
  component: Home,
})

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
type Priority = 'red'|'amber'|'green'
type TaskType = 'daily'|'weekly'

function getDateString(d:Date):string{return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function getTodayDateString():string{return getDateString(new Date())}
function getTodayDayOfWeek():number{return new Date().getDay()}
function getWeekStartDate(b?:Date):Date{const d=b?new Date(b):new Date();const s=new Date(d);s.setDate(d.getDate()-d.getDay());s.setHours(0,0,0,0);return s}
function formatWeekStart(d:Date):string{return d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}
function getDateForDay(w:Date,i:number):Date{const d=new Date(w);d.setDate(d.getDate()+i);return d}

function useDarkMode(){
  const[d,setD]=useState(false)
  useEffect(()=>setD(document.documentElement.classList.contains('dark')),[])
  const t=useCallback(()=>{const n=!d;setD(n);document.documentElement.classList.toggle('dark',n);localStorage.setItem('theme',n?'dark':'light')},[d])
  return{dark:d,toggle:t}
}

function Home(){
  const{dark,toggle:td}=useDarkMode()
  const[ts,setTs]=useState('Task Checklist')
  const{data:appTitle}=useSuspenseQuery(convexQuery(api.config.getTitle,{}))
  useEffect(()=>{if(appTitle)setTs(appTitle)},[appTitle])
  const[today,setToday]=useState(getTodayDayOfWeek())
  const[tab,setTab]=useState<TaskType>('daily')
  const[mg,setMg]=useState(false)
  const[st,setSt]=useState(false)
  const[ws,setWs]=useState(()=>getWeekStartDate())
  const[pf,setPf]=useState<Priority|'all'>('all')
  const[pp,setPp]=useState(false)
  const[mu,setMu]=useState(()=>{try{return sessionStorage.getItem('mu')==='1'}catch(e){return false}})
  const hMc=()=>{if(mu){setMg(!mg);setSt(false)}else setPp(true)}
  const hPs=()=>{setMu(true);try{sessionStorage.setItem('mu','1')}catch(e){}setPp(false);setMg(true);setSt(false)}
  const gpw=()=>{const p=new Date(ws);p.setDate(p.getDate()-7);setWs(p)}
  const gnw=()=>{const n=new Date(ws);n.setDate(n.getDate()+7);setWs(n)}
  const gcw=()=>{setWs(getWeekStartDate());setToday(getTodayDayOfWeek())}
  const sd=getDateForDay(ws,today)
  const sds=getDateString(sd)
  const opts=['all','red','amber','green']as const
  const pl={all:'All',red:'High',amber:'Medium',green:'Low'}
  const pa:Record<string,string>={all:'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 shadow-sm',red:'bg-red-500 text-white shadow-sm shadow-red-500/30',amber:'bg-amber-500 text-white shadow-sm shadow-amber-500/30',green:'bg-green-500 text-white shadow-sm shadow-green-500/30'}
  const pi:Record<string,string>={all:'text-gray-500 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-gray-800/60',red:'bg-red-50 dark:bg-red-900/15 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30',amber:'bg-amber-50 dark:bg-amber-900/15 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30',green:'bg-green-50 dark:bg-green-900/15 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'}

  return(<div className="min-h-screen bg-gray-50 dark:bg-gray-950 bg-grid transition-colors duration-200">
    <header className="sticky top-0 z-30 border-b border-gray-200/70 dark:border-gray-800/70 glass shadow-sm"><div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8"><div className="flex h-16 items-center justify-between">
      <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20">TC</div><h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">{ts}</h1></div>
      <div className="flex items-center gap-1.5">
        <button onClick={()=>{setSt(!st);setMg(false)}} className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${st?'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20':'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:shadow-sm'}`}>Stats</button>
        <button onClick={hMc} className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${mg&&mu?'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20':'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:shadow-sm'}`}>Manager</button>
        <button onClick={td} className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:text-gray-700 dark:hover:text-gray-200 transition-all" aria-label="Toggle dark mode">{dark?<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>:<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>}</button>
      </div>
    </div></div></header>

    <div className="border-b border-gray-200/70 dark:border-gray-800/70 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl"><div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8"><div className="flex gap-1 py-2">
      <button onClick={()=>setTab('daily')} className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab==='daily'?'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20':'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50'}`}>Daily Tasks</button>
      <button onClick={()=>setTab('weekly')} className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab==='weekly'?'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20':'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50'}`}>Weekly Tasks</button>
    </div></div></div>

    {tab==='daily'&&<div className="border-b border-gray-200/70 dark:border-gray-800/70 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl"><div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between pt-3 pb-1"><div className="flex items-center gap-2"><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">Week Commencing</span><span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{formatWeekStart(ws)}</span></div>
        <div className="flex items-center gap-0.5 rounded-lg bg-gray-100/80 dark:bg-gray-800/80 p-0.5">
          <button onClick={gpw} className="rounded-md p-1.5 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-all" title="Previous week"><svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg></button>
          <button onClick={gcw} className="rounded-md px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-gray-700 transition-all">Today</button>
          <button onClick={gnw} className="rounded-md p-1.5 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-all" title="Next week"><svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg></button>
        </div>
      </div>
      <div className="flex items-center gap-1 pb-2"><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mr-1">Priority</span>{opts.map(p=><button key={p} onClick={()=>setPf(p)} className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${pf===p?pa[p]:pi[p]}`}>{pl[p]}</button>)}</div>
      <div className="flex overflow-x-auto gap-1 py-2 scrollbar-hide">{DAY_NAMES.map((n,i)=>{const d=getDateForDay(ws,i);const t=getDateString(d)===getTodayDateString();let c='flex-1 flex-shrink-0 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200';if(today===i)c+=' bg-gradient-to-b from-white to-blue-50 dark:from-gray-800 dark:to-blue-950/40 text-blue-700 dark:text-blue-300 shadow-md shadow-blue-500/10 ring-1 ring-blue-200/50 dark:ring-blue-800/50 scale-105';else if(t)c+=' text-gray-900 dark:text-white ring-1 ring-gray-200/70 dark:ring-gray-700/70 hover:ring-blue-300/50 dark:hover:ring-blue-700/50 hover:shadow-sm';else c+=' text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:shadow-sm';return<button key={i} onClick={()=>setToday(i)} className={c}><div className="text-[10px] font-medium uppercase tracking-wide opacity-70">{n.slice(0,3)}</div><div className="text-base font-bold leading-tight mt-0.5">{d.getDate()}</div></button>})}</div>
    </div></div>}

    {tab==='weekly'&&<div className="border-b border-gray-200/70 dark:border-gray-800/70 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl"><div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between py-3"><div className="flex items-center gap-2"><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">Week Commencing</span><span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{formatWeekStart(ws)}</span></div>
        <div className="flex items-center gap-0.5 rounded-lg bg-gray-100/80 dark:bg-gray-800/80 p-0.5">
          <button onClick={gpw} className="rounded-md p-1.5 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-all" title="Previous week"><svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg></button>
          <button onClick={gcw} className="rounded-md px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-gray-700 transition-all">This Week</button>
          <button onClick={gnw} className="rounded-md p-1.5 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-all" title="Next week"><svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg></button>
        </div>
      </div>
      <div className="flex items-center gap-1 pb-2"><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mr-1">Priority</span>{opts.map(p=><button key={p} onClick={()=>setPf(p)} className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${pf===p?pa[p]:pi[p]}`}>{pl[p]}</button>)}</div>
    </div></div>}

    <main className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6">
      {st&&<StatsPanel date={sds} ws={ws}/>}
      {mg&&<ManagerPanel/>}
      <TaskList type={tab} day={today} dateStr={sds} pf={pf}/>
    </main>
    {pp&&<PasscodeModal onSuccess={hPs} onClose={()=>setPp(false)}/>}
  </div>)
}

function PasscodeModal({onSuccess,onClose}:{onSuccess:()=>void;onClose:()=>void}){
  const{data:sp}=useSuspenseQuery(convexQuery(api.config.getPasscode,{}))
  const[inp,setInp]=useState('')
  const[err,setErr]=useState(false)
  const hs=(e:React.FormEvent)=>{e.preventDefault();if(inp===sp)onSuccess();else{setErr(true);setInp('')}}
  return(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
    <div className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl w-full max-w-sm mx-4 border border-gray-200 dark:border-gray-800" onClick={e=>e.stopPropagation()}>
      <div className="text-center mb-4"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30"><svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></div><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manager Access</h3><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter the manager passcode to continue</p></div>
      <form onSubmit={hs}><input type="password" value={inp} onChange={e=>{setInp(e.target.value);setErr(false)}} placeholder="Passcode" autoFocus className={`w-full rounded-lg border px-3 py-2.5 text-sm text-center text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 ${err?'border-red-400 focus:ring-red-500':'border-gray-300 dark:border-gray-700 focus:ring-blue-500'}`}/>
        {err&&<p className="text-xs text-red-500 mt-1.5 text-center">Incorrect passcode. Try again.</p>}
        <div className="flex gap-2 mt-4"><button type="button" onClick={onClose} className="flex-1 rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button><button type="submit" className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">Unlock</button></div>
      </form>
    </div>
  </div>)
}

function StatsPanel({date,ws}:{date:string;ws:Date}){
  const wss=getDateString(ws)
  const{data:ds}=useSuspenseQuery(convexQuery(api.tasks.employeeStats,{date}))
  const{data:ws2}=useSuspenseQuery(convexQuery(api.tasks.weeklyEmployeeStats,{weekStart:wss}))
  const[v,setV]=useState<'daily'|'weekly'>('weekly')
  const st=v==='daily'?ds:ws2
  const t=st.reduce((s,e)=>s+e.completed,0)
  const m=st.reduce((s,e)=>s+e.total,0)
  const p=m>0?Math.round((t/m)*100):0
  return(<div className="mb-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
    <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Employee Performance</h2>
      <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5">
        <button onClick={()=>setV('daily')} className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${v==='daily'?'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm':'text-gray-500 dark:text-gray-400'}`}>{date}</button>
        <button onClick={()=>setV('weekly')} className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${v==='weekly'?'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm':'text-gray-500 dark:text-gray-400'}`}>Week</button>
      </div>
    </div>
    <div className="mb-4 flex items-center gap-3"><div className="flex-1 h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"><div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{width:p+'%'}}/></div><span className="text-sm font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">{t}/{m} ({p}%)</span></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{st.map(e=>(<div key={e.name} className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3"><div className="flex items-center justify-between mb-2"><span className="font-medium text-sm text-gray-900 dark:text-white">{e.name}</span><span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{e.completed}/{e.total}</span></div><div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"><div className={`h-full rounded-full transition-all duration-500 ${e.percentage>=80?'bg-green-500':e.percentage>=50?'bg-amber-500':'bg-red-500'}`} style={{width:e.percentage+'%'}}/></div><span className="mt-1 block text-right text-xs font-semibold text-gray-500 dark:text-gray-400">{e.percentage}%</span></div>))}</div>
  </div>)
}

function ManagerPanel(){
  const[t,setT]=useState('')
  const[l,setL]=useState('')
  const[p,setP]=useState<Priority>('amber')
  const[a,setA]=useState('Un-assigned')
  const[ty,setTy]=useState<TaskType>('daily')
  const[dw,setDw]=useState(getTodayDayOfWeek())
  const[et,setEt]=useState<any>(null)
  const[np,setNp]=useState('')
  const[spi,setSpi]=useState(false)
  const ct=useMutation(api.tasks.create)
  const ut=useMutation(api.tasks.update)
  const rt=useMutation(api.tasks.remove)
  const at=useMutation(api.tasks.archive)
  const ua=useMutation(api.tasks.unarchive)
  const ro=useMutation(api.tasks.reorder)
  const sp=useMutation(api.config.setPasscode)
  const st=useMutation(api.config.setTitle)
  const[rn,setRn]=useState('')
  const[rti,setRti]=useState(false)
  const{data:all}=useSuspenseQuery(convexQuery(api.tasks.list,{}))
  const{data:dbe}=useSuspenseQuery(convexQuery(api.employees.list,{}))
  const{data:cp}=useSuspenseQuery(convexQuery(api.config.getPasscode,{}))
  const{data:cp2}=useSuspenseQuery(convexQuery(api.config.getTitle,{}))
  const ae=['Un-assigned',...dbe]
  const act=all.filter(t=>!t.archived).sort((a,b)=>a.order-b.order)
  const arc=all.filter(t=>t.archived)
  const ad=useMutation(api.employees.add)
  const rm=useMutation(api.employees.remove)
  const[nn,setNn]=useState('')
  const mt=async(tid:Id<'tasks'>,d:'up'|'down')=>{const i=act.findIndex(x=>x._id===tid);if(i===-1)return;const si=d==='up'?i-1:i+1;if(si<0||si>=act.length)return;await ro({taskIds:act.map(x=>{if(x._id===act[i]._id)return act[si]._id;if(x._id===act[si]._id)return act[i]._id;return x._id})})}
  const hs2=async(e:React.FormEvent)=>{e.preventDefault();if(!t.trim())return;if(et){await ut({taskId:et._id,title:t.trim(),link:l.trim()||undefined,priority:p,assignedTo:a,dayOfWeek:ty==='daily'?dw:undefined});setEt(null)}else{await ct({title:t.trim(),link:l.trim()||undefined,priority:p,assignedTo:a,type:ty,dayOfWeek:ty==='daily'?dw:undefined})};setT('');setL('');setP('amber');setA('Un-assigned');setTy('daily');setDw(getTodayDayOfWeek())}
  const he=(task:any)=>{setEt(task);setT(task.title);setL(task.link||'');setP(task.priority);setA(task.assignedTo);setTy(task.type);setDw(task.dayOfWeek??getTodayDayOfWeek())}
  const hce=()=>{setEt(null);setT('');setL('');setP('amber');setA('Un-assigned');setTy('daily');setDw(getTodayDayOfWeek())}
  const hae=async()=>{if(!nn.trim())return;await ad({name:nn.trim()});setNn('')}
  const hcp=async()=>{if(!np.trim())return;await sp({passcode:np.trim()});setNp('');setSpi(false)}
  const hrt=async()=>{if(!rn.trim())return;await st({title:rn.trim()});setRn('');setRti(false)}
  const pc:Record<Priority,string>={red:'bg-red-500',amber:'bg-amber-500',green:'bg-green-500'}
  return(<div className="mb-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{et?'Edit Task':'Add New Task'}</h2>
    <form onSubmit={hs2} className="space-y-4 mb-6"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Title</label><input type="text" value={t} onChange={e=>setT(e.target.value)} placeholder="Enter task description..." className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" required/></div>
      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link (optional)</label><input type="url" value={l} onChange={e=>setL(e.target.value)} placeholder="https://..." className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label><select value={p} onChange={e=>setP(e.target.value as Priority)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="red">🔴 Red - High</option><option value="amber">🟡 Amber - Medium</option><option value="green">🟢 Green - Low</option></select></div>
      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned To</label><select value={a} onChange={e=>setA(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">{ae.map(n=><option key={n} value={n}>{n}</option>)}</select></div>
      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label><select value={ty} onChange={e=>setTy(e.target.value as TaskType)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="daily">Daily</option><option value="weekly">Weekly</option></select></div>
      {ty==='daily'&&<div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day of Week</label><div className="flex gap-2"><select value={dw} onChange={e=>setDw(Number(e.target.value))} className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">{DAY_NAMES.map((n,i)=><option key={i} value={i}>{n}</option>)}</select><button type="button" onClick={async()=>{if(!t.trim())return;for(let d=0;d<7;d++)await ct({title:t.trim(),link:l.trim()||undefined,priority:p,assignedTo:a,type:'daily',dayOfWeek:d});setT('');setL('');setP('amber');setA('Un-assigned');setTy('daily');setDw(getTodayDayOfWeek())}} className="flex-shrink-0 rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors">+ All Days</button></div></div>}
    </div><div className="flex gap-2"><button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">{et?'Update Task':'Add Task'}</button>{et&&<button type="button" onClick={hce} className="rounded-lg bg-gray-200 dark:bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>}</div></form>

    <div className="grid gap-6 lg:grid-cols-2 mb-6">
      <div><h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">All Active Tasks ({act.length})</h3><div className="space-y-2 max-h-80 overflow-y-auto">{act.length===0&&<p className="text-sm text-gray-400 dark:text-gray-500">No tasks yet</p>}{act.map(task=>(<div key={task._id} className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-2.5"><div className="flex items-center gap-2 min-w-0 flex-1"><span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${pc[task.priority]}`}/><span className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</span><span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{task.type==='daily'?DAY_NAMES[task.dayOfWeek??0]:'Weekly'} · {task.assignedTo}</span></div>
        <div className="flex items-center gap-1 flex-shrink-0"><div className="flex flex-col gap-0.5 mr-1"><button onClick={()=>mt(task._id,'up')} className="rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Move up"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/></svg></button><button onClick={()=>mt(task._id,'down')} className="rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Move down"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg></button></div>
          <button onClick={()=>he(task)} className="rounded p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Edit"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
          <button onClick={()=>at({taskId:task._id})} className="rounded p-1 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Archive"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg></button>
          <button onClick={()=>rt({taskId:task._id})} className="rounded p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Delete"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
        </div></div>))}</div></div>
      <div><h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Archived Tasks ({arc.length})</h3><div className="space-y-2 max-h-80 overflow-y-auto">{arc.length===0&&<p className="text-sm text-gray-400 dark:text-gray-500">No archived tasks</p>}{arc.map(task=>(<div key={task._id} className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-2.5 opacity-60"><div className="flex items-center gap-2 min-w-0 flex-1"><span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${pc[task.priority]}`}/><span className="text-sm text-gray-500 dark:text-gray-400 line-through truncate">{task.title}</span></div><button onClick={()=>ua({taskId:task._id})} className="rounded p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Restore"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg></button></div>))}</div></div>
    </div>

    <div className="border-t border-gray-200 dark:border-gray-800 pt-6 space-y-6">
      <div><h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Manage Employees</h3>
        <div className="flex gap-2 mb-3"><input type="text" value={nn} onChange={e=>setNn(e.target.value)} placeholder="New employee name..." className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"/><button onClick={hae} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors flex-shrink-0">Add</button></div>
        <div className="flex flex-wrap gap-2">{dbe.map(n=>(<div key={n} className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300"><span>{n}</span><button onClick={()=>rm({name:n})} className="rounded-full p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title={"Remove "+n}><svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></div>))}</div>
      </div>
      <div><h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Rename Checklist</h3>
        {rti?(<div className="flex gap-2"><input type="text" value={rn} onChange={e=>setRn(e.target.value)} placeholder="New title..." className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"/><button onClick={hrt} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">Save</button><button onClick={()=>{setRti(false);setRn('')}} className="rounded-lg bg-gray-200 dark:bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button></div>):(<div className="flex items-center gap-3"><span className="text-sm text-gray-500 dark:text-gray-400">Current title: <span className="text-gray-800 dark:text-gray-200 font-semibold">{cp2}</span></span><button onClick={()=>setRti(true)} className="rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Rename</button></div>)}
      </div>
      <div><h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Change Passcode</h3>
        {spi?(<div className="flex gap-2"><input type="text" value={np} onChange={e=>setNp(e.target.value)} placeholder="New passcode..." className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"/><button onClick={hcp} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">Save</button><button onClick={()=>{setSpi(false);setNp('')}} className="rounded-lg bg-gray-200 dark:bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button></div>):(<div className="flex items-center gap-3"><span className="text-sm text-gray-500 dark:text-gray-400">Current passcode: <code className="text-gray-800 dark:text-gray-200 font-mono font-semibold">{cp}</code></span><button onClick={()=>setSpi(true)} className="rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Change</button></div>)}
      </div>
    </div>
  </div>)
}

function TaskList({type,day,dateStr,pf}:{type:TaskType;day:number;dateStr:string;pf:Priority|'all'}){
  const ws=getWeekStartDate()
  const wss=getDateString(ws)
  const{data:tasks}=useSuspenseQuery(convexQuery(api.tasks.list,{type,...(type==='daily'?{dayOfWeek:day}:{})}))
  const{data:dc}=useSuspenseQuery(convexQuery(api.tasks.getCompletionsForDate,{date:dateStr}))
  const{data:wc}=useSuspenseQuery(convexQuery(api.tasks.getCompletionsForDate,{date:wss}))
  const{data:dbe}=useSuspenseQuery(convexQuery(api.employees.list,{}))
  const ae=['Un-assigned',...dbe]
  const c=useMutation(api.tasks.completeTask)
  const ar=useMutation(api.tasks.archive)
  const comp=type==='daily'?dc:wc
  const cids=new Set(comp.map(x=>x.taskId))
  const act=tasks.filter(t=>!t.archived).filter(t=>pf==='all'||t.priority===pf).sort((a,b)=>{const aD=cids.has(a._id),bD=cids.has(b._id);if(aD&&!bD)return 1;if(!aD&&bD)return -1;return a.order-b.order})
  const ht=(tid:Id<'tasks'>,cb:string)=>{c({taskId:tid,date:type==='daily'?dateStr:wss,completedBy:cb})}
  const[cb,setCb]=useState<Record<string,string>>({})
  useEffect(()=>{const d:Record<string,string>={};tasks.forEach(t=>{const e=comp.find(x=>x.taskId===t._id);d[t._id]=e?.completedBy||t.assignedTo});setCb(prev=>{const m={...d};Object.keys(prev).forEach(k=>{if(d[k]!==undefined)m[k]=prev[k]});return m})},[tasks,comp])
  if(act.length===0)return(<div className="flex flex-col items-center justify-center py-16 text-center"><svg className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg><p className="text-gray-400 dark:text-gray-500 font-medium">No tasks for this day</p><p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Use the Manager tab to add tasks</p></div>)
  const cc=act.filter(t=>cids.has(t._id)).length
  return(<div><div className="mb-4 flex items-center gap-3"><div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"><div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{width:(cc/act.length)*100+'%'}}/></div><span className="text-sm font-medium text-gray-500 dark:text-gray-400">{cc}/{act.length} complete</span></div>
    <div className="space-y-2">{act.map(task=>{const ic=cids.has(task._id);const com=comp.find(x=>x.taskId===task._id);return(<div key={task._id} className={`group relative overflow-hidden rounded-xl border transition-all duration-200 ${ic?'border-gray-100/50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-gray-900/20':'border-gray-200/70 dark:border-gray-700/70 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg hover:border-gray-300/70 dark:hover:border-gray-600/70'}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all duration-200 ${ic?'opacity-30':'opacity-100'} ${task.priority==='red'?'bg-gradient-to-b from-red-400 to-red-600':task.priority==='amber'?'bg-gradient-to-b from-amber-400 to-amber-500':'bg-gradient-to-b from-green-400 to-green-500'}`}/>
      <div className="flex items-start gap-3 p-4"><div className="flex-shrink-0 pt-0.5"><button onClick={()=>ht(task._id,cb[task._id]||task.assignedTo)} className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${ic?'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 text-white shadow-sm shadow-blue-500/20':'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm'}`}>{ic&&<svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}</button></div>
        <div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1.5"><span className={`text-sm font-medium truncate ${ic?'text-gray-400 dark:text-gray-500 line-through':'text-gray-800 dark:text-gray-100'}`}>{task.title}</span></div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${task.priority==='red'?'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400':task.priority==='amber'?'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400':'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'}`}>{task.priority==='red'?'High':task.priority==='amber'?'Medium':'Low'}</span>
            {task.link&&<a href={task.link} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="inline-flex items-center gap-1 rounded-full bg-blue-50/70 dark:bg-blue-900/15 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all hover:shadow-sm"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg> Link</a>}
            <select value={cb[task._id]||task.assignedTo} onChange={e=>setCb(prev=>({...prev,[task._id]:e.target.value}))} onClick={e=>e.stopPropagation()} className={`text-[11px] rounded-full border px-2 py-0.5 font-medium transition-all ${ic?'border-gray-200/50 dark:border-gray-700/50 text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/50':'border-gray-200/70 dark:border-gray-700/70 text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'}`}>{ae.map(n=><option key={n} value={n}>{n}</option>)}</select>
            {ic&&com&&<span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">✓ {com.completedBy}</span>}
          </div>
        </div>
        {type==='weekly'&&ic&&<button onClick={()=>ar({taskId:task._id})} className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all opacity-0 group-hover:opacity-100" title="Archive task"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg></button>}
      </div>
    </div>)})}</div></div>)
}
