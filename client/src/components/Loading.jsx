import React from 'react';

const Loading = () => {
  return (
    <div className='fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#F8FAFC] backdrop-blur-sm'>
      <div className="relative flex items-center justify-center w-20 h-20 mb-6">
        {/* Outer glowing spinning ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-600 border-r-blue-600 animate-spin shadow-[0_0_10px_rgba(37,99,235,0.2)]"></div>
        
        {/* Middle reverse spinning ring */}
        <div className="absolute inset-2 rounded-full border-[3px] border-transparent border-b-blue-400 border-l-blue-400 animate-[spin_1.5s_linear_infinite_reverse]"></div>
        
        {/* Inner pulsing core */}
        <div className="w-6 h-6 bg-blue-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.6)]"></div>
      </div>
      <p className="text-blue-600 font-extrabold text-[13px] tracking-[0.2em] uppercase animate-pulse">
        Loading...
      </p>
    </div>
  )
}

export default Loading