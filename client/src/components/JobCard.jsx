import { useNavigate } from 'react-router-dom'
import { Bookmark, Briefcase, MapPin, Send, Database, Code, Cloud, Terminal, Monitor, Sparkles, BarChart } from 'lucide-react'

const colorVariants = [
    { bg: 'bg-blue-50/50', border: 'border-blue-100/50', text: 'text-blue-600', iconText: 'text-blue-400', chipBg: 'bg-blue-100/60', chipText: 'text-blue-700', btnBg: 'bg-blue-600 hover:bg-blue-700', hoverBorder: 'hover:border-blue-300/60', glow: 'from-blue-50/50' },
    { bg: 'bg-emerald-50/50', border: 'border-emerald-100/50', text: 'text-emerald-600', iconText: 'text-emerald-400', chipBg: 'bg-emerald-100/60', chipText: 'text-emerald-700', btnBg: 'bg-emerald-500 hover:bg-emerald-600', hoverBorder: 'hover:border-emerald-300/60', glow: 'from-emerald-50/50' },
    { bg: 'bg-orange-50/50', border: 'border-orange-100/50', text: 'text-orange-600', iconText: 'text-orange-400', chipBg: 'bg-orange-100/60', chipText: 'text-orange-700', btnBg: 'bg-orange-500 hover:bg-orange-600', hoverBorder: 'hover:border-orange-300/60', glow: 'from-orange-50/50' },
    { bg: 'bg-purple-50/50', border: 'border-purple-100/50', text: 'text-purple-600', iconText: 'text-purple-400', chipBg: 'bg-purple-100/60', chipText: 'text-purple-700', btnBg: 'bg-purple-600 hover:bg-purple-700', hoverBorder: 'hover:border-purple-300/60', glow: 'from-purple-50/50' },
    { bg: 'bg-pink-50/50', border: 'border-pink-100/50', text: 'text-pink-600', iconText: 'text-pink-400', chipBg: 'bg-pink-100/60', chipText: 'text-pink-700', btnBg: 'bg-pink-500 hover:bg-pink-600', hoverBorder: 'hover:border-pink-300/60', glow: 'from-pink-50/50' },
    { bg: 'bg-cyan-50/50', border: 'border-cyan-100/50', text: 'text-cyan-600', iconText: 'text-cyan-400', chipBg: 'bg-cyan-100/60', chipText: 'text-cyan-700', btnBg: 'bg-cyan-500 hover:bg-cyan-600', hoverBorder: 'hover:border-cyan-300/60', glow: 'from-cyan-50/50' },
];

const getVariant = (id) => {
    if (!id) return colorVariants[0];
    const charCode = id.charCodeAt(id.length - 1);
    return colorVariants[charCode % 6];
};

const getCategoryIcon = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('data')) return Database;
    if (cat.includes('cloud') || cat.includes('devops')) return Cloud;
    if (cat.includes('backend') || cat.includes('api')) return Terminal;
    if (cat.includes('frontend') || cat.includes('ui') || cat.includes('design')) return Monitor;
    if (cat.includes('developer') || cat.includes('software') || cat.includes('programming')) return Code;
    return Sparkles;
};

const JobCard = ({ job }) => {
    const navigate = useNavigate();
    const variant = getVariant(job._id);
    const CategoryIcon = getCategoryIcon(job.category);
    
    // Process Skills dynamically
    const allSkills = job.skills && job.skills.length > 0 
        ? job.skills 
        : [job.category, 'Problem Solving']; // fallback if no skills mapped
        
    const displaySkills = allSkills.slice(0, 3);
    const extraSkillsCount = allSkills.length > 3 ? allSkills.length - 3 : 0;

    return (
        <div 
            onClick={() => { navigate(`/apply-job/${job._id}`); window.scrollTo(0, 0) }} 
            className={`relative overflow-hidden ${variant.bg} p-6 rounded-[24px] border ${variant.border} shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)] ${variant.hoverBorder} hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 cursor-pointer transition-all duration-300 flex flex-col h-full group bg-gradient-to-br ${variant.glow} to-white/10`}
        >
            {/* Top Header */}
            <div className='flex justify-between items-start mb-6 relative z-10'>
                <div 
                    className='flex items-center gap-3 cursor-pointer group/company'
                    onClick={(e) => { e.stopPropagation(); navigate(`/company/${job.companyId._id}`); window.scrollTo(0,0); }}
                >
                    <div className='w-12 h-12 bg-white rounded-[14px] shadow-sm border border-gray-100/80 flex items-center justify-center p-2.5 shrink-0 group-hover/company:border-blue-200 transition-colors'>
                        <img className='max-h-full max-w-full object-contain' src={job.companyId.image} alt={job.companyId.name} />
                    </div>
                    <div>
                        <h4 className='font-bold text-gray-900 text-sm tracking-tight group-hover/company:text-blue-600 transition-colors'>{job.companyId.name}</h4>
                        <p className='text-[11px] text-gray-500 font-medium mt-0.5'>{job.location}</p>
                    </div>
                </div>
                
                <div className='flex gap-2 items-start'>
                    <div className={`p-2 rounded-xl bg-white/60 backdrop-blur-sm shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] ${variant.iconText}`}>
                        <CategoryIcon size={20} strokeWidth={1.5} />
                    </div>
                    <button className='text-gray-400 hover:text-orange-500 transition-colors p-1'>
                        <Bookmark size={20} className='group-hover:text-orange-400 transition-colors' />
                    </button>
                </div>
            </div>

            {/* Job Title & Meta */}
            <div className='mb-5 flex-1 relative z-10'>
                <h3 className='font-extrabold text-[19px] text-gray-900 leading-[1.3] group-hover:text-gray-700 transition-colors line-clamp-2 mb-4'>
                    {job.title}
                </h3>
                
                <div className='flex items-center flex-wrap gap-x-4 gap-y-2 text-[12px] font-medium text-gray-500'>
                    <div className='flex items-center gap-1.5'>
                        <Briefcase size={14} className='text-gray-400' />
                        <span>Full Time</span>
                    </div>
                    <div className='flex items-center gap-1.5'>
                        <BarChart size={14} className='text-gray-400' />
                        <span>{job.level}</span>
                    </div>
                    <div className='flex items-center gap-1.5 max-sm:hidden'>
                        <MapPin size={14} className='text-gray-400' />
                        <span>{job.location}</span>
                    </div>
                </div>
            </div>

            {/* Skills Chips */}
            <div className='flex flex-wrap gap-2 mb-6 relative z-10'>
                {displaySkills.map((skill, idx) => (
                    <span key={idx} className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide ${variant.chipBg} ${variant.chipText}`}>
                        {skill}
                    </span>
                ))}
                {extraSkillsCount > 0 && (
                    <span className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide ${variant.chipBg} ${variant.chipText}`}>
                        +{extraSkillsCount}
                    </span>
                )}
            </div>

            {/* Action Area */}
            <div className='flex items-center justify-between mt-auto pt-4 border-t border-black/5 relative z-10'>
                <span className={`text-[13px] font-bold ${variant.text} flex items-center gap-1 group-hover:translate-x-1 transition-transform`}>
                    View Details &rarr;
                </span>
                
                <button className={`px-5 py-2.5 rounded-full text-white text-[13px] font-bold flex items-center gap-2 shadow-sm ${variant.btnBg} transition-all group-hover:shadow-md group-hover:scale-105 active:scale-95`}>
                    <Send size={14} /> Apply Now
                </button>
            </div>
        </div>
    )
}

export default JobCard