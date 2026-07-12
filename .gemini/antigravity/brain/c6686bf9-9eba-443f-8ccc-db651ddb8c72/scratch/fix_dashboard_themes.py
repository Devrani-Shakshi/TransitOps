import re

file_path = "frontend/src/app/features/dashboard/dashboard.component.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replacements mapping
replacements = {
    # Typography & Headings
    'text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400': 'text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-200 dark:to-slate-400',
    'text-slate-400 tracking-wider uppercase mt-1': 'text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-1',
    'bg-[#0d1426]/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/5': 'bg-slate-100 dark:bg-[#0d1426]/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5',
    'border-r border-white/5 pr-4': 'border-r border-slate-200 dark:border-white/5 pr-4',
    'text-slate-400 uppercase tracking-widest': 'text-slate-500 dark:text-slate-400 uppercase tracking-widest',
    'text-sm font-bold text-sky-400': 'text-sm font-bold text-sky-600 dark:text-sky-400',
    'text-sm font-bold text-amber-400': 'text-sm font-bold text-amber-600 dark:text-amber-400',
    'text-sm font-bold text-slate-200': 'text-sm font-bold text-slate-800 dark:text-slate-200',
    'text-slate-400 mb-4 flex items-center': 'text-slate-500 dark:text-slate-400 mb-4 flex items-center',
    
    # KPI cards values
    'text-slate-400 uppercase tracking-wider block': 'text-slate-500 dark:text-slate-400 uppercase tracking-wider block',
    'text-3xl font-extrabold text-white mt-1': 'text-3xl font-extrabold text-slate-900 dark:text-white mt-1',
    'text-[9px] text-slate-400 font-medium': 'text-[9px] text-slate-500 dark:text-slate-400 font-medium',
    'text-xs text-amber-400 font-bold': 'text-xs text-amber-600 dark:text-amber-400 font-bold',
    'text-xs text-purple-400 font-bold': 'text-xs text-purple-600 dark:text-purple-400 font-bold',
    
    # Map & command overlays
    'text-sm font-bold text-white tracking-wide': 'text-sm font-bold text-slate-900 dark:text-white tracking-wide',
    'text-[10px] text-slate-400 uppercase tracking-widest font-bold': 'text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold',
    'bg-[#0a0e1a]/80': 'bg-slate-100/50 dark:bg-[#0a0e1a]/80',
    'bg-slate-950/80': 'bg-white/95 dark:bg-slate-950/80',
    'text-slate-200 mt-1 truncate': 'text-slate-800 dark:text-slate-200 mt-1 truncate',
    'text-sky-400 mt-0.5': 'text-sky-600 dark:text-sky-400 mt-0.5',
    'text-slate-400 mt-0.5': 'text-slate-500 dark:text-slate-400 mt-0.5',
    'text-amber-400 mt-1': 'text-amber-600 dark:text-amber-400 mt-1',
    'bg-slate-950/40 border border-white/5': 'bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5',
    'text-xs font-bold text-white mt-1.5': 'text-xs font-bold text-slate-900 dark:text-white mt-1.5',
    'text-[10px] text-slate-400 mt-1 leading-normal': 'text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-normal',
    
    # Stepper and Registry
    'text-xs font-bold text-white">Select': 'text-xs font-bold text-slate-900 dark:text-white">Select',
    'text-xs font-bold text-white">Specify': 'text-xs font-bold text-slate-900 dark:text-white">Specify',
    'text-xs font-bold text-white">Review': 'text-xs font-bold text-slate-900 dark:text-white">Review',
    'text-sm font-bold text-white block mt-1': 'text-sm font-bold text-slate-900 dark:text-white block mt-1',
    'bg-slate-900/40 border-white/5': 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-white/5',
    'text-[10px] text-slate-400 block mt-0.5': 'text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5',
    'font-bold text-white mt-1 block': 'font-bold text-slate-900 dark:text-white mt-1 block',
    'bg-slate-800 h-1.5': 'bg-slate-200 dark:bg-slate-800 h-1.5',
    'bg-slate-800 h-1': 'bg-slate-200 dark:bg-slate-800 h-1',
    'bg-slate-800 h-3': 'bg-slate-200 dark:bg-slate-800 h-3',
    'text-sm font-extrabold text-white mt-3': 'text-sm font-extrabold text-slate-900 dark:text-white mt-3',
    'text-[10px] text-slate-400 text-center max-w-[200px] leading-normal': 'text-[10px] text-slate-600 dark:text-slate-400 text-center max-w-[200px] leading-normal',
    'text-slate-200">98% Health': 'text-slate-800 dark:text-slate-200">98% Health',
    'text-slate-200">92% Health': 'text-slate-800 dark:text-slate-200">92% Health',
    'text-slate-200">15:15': 'text-slate-800 dark:text-slate-200">15:15',
    'text-slate-200 font-bold': 'text-slate-800 dark:text-slate-200 font-bold',
    
    # Leaderboard & Maintenance
    'text-xs font-bold text-white">Tesla': 'text-xs font-bold text-slate-900 dark:text-white">Tesla',
    'text-xs font-bold text-white">Volvo': 'text-xs font-bold text-slate-900 dark:text-white">Volvo',
    'text-xs font-bold text-white">Ford': 'text-xs font-bold text-slate-900 dark:text-white">Ford',
    'text-slate-200 border': 'text-slate-800 dark:text-slate-200 border',
    'text-slate-200 font-medium': 'text-slate-800 dark:text-slate-200 font-medium',
    'font-bold text-white font-manrope': 'font-bold text-slate-900 dark:text-white font-manrope',
    'font-bold text-white shrink-0': 'font-bold text-slate-900 dark:text-white shrink-0',
    'text-xs font-bold text-white block': 'text-xs font-bold text-slate-900 dark:text-white block',
    'text-xs font-bold text-white">': 'text-xs font-bold text-slate-900 dark:text-white">',
    'text-xs font-bold text-white inline-block': 'text-xs font-bold text-slate-900 dark:text-white inline-block',
    'border-white/20': 'border-slate-200 dark:border-white/20',
    
    # AI chatbot popup
    'bg-slate-950/60': 'bg-slate-100 dark:bg-slate-950/60',
    'bg-slate-950/40': 'bg-slate-100/70 dark:bg-slate-950/40',
    'bg-slate-950/80': 'bg-slate-100 dark:bg-slate-950/80',
    'text-slate-200 rounded-tl-none': 'text-slate-800 dark:text-slate-200 rounded-tl-none'
}

for src, dest in replacements.items():
    content = content.replace(src, dest)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Dashboard theme color visibility fix applied successfully!")
