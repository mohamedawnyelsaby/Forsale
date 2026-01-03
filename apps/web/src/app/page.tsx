'use client';
import React, { useEffect, useState } from 'react';

export default function HomePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // جلب المنتجات التي أضافها مروان وحفظها لوجي
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error:", err));
  }, []);

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <header className="p-6 border-b flex justify-between items-center">
        <span className="font-black text-purple-900 text-2xl tracking-tighter">FORSALE</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
          <span className="text-[10px] font-bold text-gray-500">PI NETWORK LIVE</span>
        </div>
      </header>
      
      <main className="p-6">
        <h2 className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-8 text-right">المعروضات الجديدة</h2>
        
        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-300 font-bold border-4 border-dashed rounded-[40px]">
            لا توجد منتجات حالياً.. ابدأ بالإظافة من مركز مروان
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {products.map((p: any) => (
              <div key={p.id} className="bg-white rounded-[45px] overflow-hidden shadow-xl border border-gray-50 p-2">
                <div className="h-64 bg-slate-100 rounded-[35px] flex items-center justify-center text-slate-300 font-bold">
                   صورة {p.title}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-gray-900">{p.title}</h3>
                    <span className="text-2xl font-black text-purple-600">π {p.price}</span>
                  </div>
                  <button className="w-full bg-purple-600 text-white py-5 rounded-[25px] font-black text-lg shadow-lg shadow-purple-200">
                    شراء الآن
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
