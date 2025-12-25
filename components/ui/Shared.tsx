
import React from 'react';

export const Button = ({ className = '', variant = 'default', size = 'md', ...props }: any) => {
  const variants: any = {
    default: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95 transition-all',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm active:scale-95 transition-all',
    ghost: 'hover:bg-slate-100 text-slate-600 active:scale-95 transition-all',
    destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-100 active:scale-95 transition-all',
  };
  const sizes: any = {
    sm: 'px-4 py-2 text-[10px] font-black uppercase tracking-widest',
    md: 'px-6 py-3 text-sm font-bold',
    lg: 'px-8 py-4 text-base font-black uppercase tracking-[0.1em]',
  };
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-2xl font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
};

export const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }: any) => (
  <div className={`px-8 py-6 border-b border-slate-50 bg-slate-50/30 ${className}`}>{children}</div>
);

export const CardContent = ({ children, className = '' }: any) => (
  <div className={`p-8 ${className}`}>{children}</div>
);

export const Input = ({ className = '', ...props }: any) => (
  <input 
    className={`flex h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:bg-white disabled:cursor-not-allowed disabled:opacity-50 transition-all ${className}`}
    {...props}
  />
);

export const Badge = ({ children, variant = 'default', className = '' }: any) => {
  const variants: any = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    error: 'bg-rose-50 text-rose-700 border-rose-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  };
  return (
    <span className={`inline-flex items-center rounded-xl border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
