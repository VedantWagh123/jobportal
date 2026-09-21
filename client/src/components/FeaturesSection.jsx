import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { Sparkles, Target, ClipboardList, GraduationCap, Building2, ArrowRight, FileText, Star, Users } from 'lucide-react'
import { motion } from 'framer-motion'

const FEATURES = [
    {
        num: '01',
        icon: Target,
        title: 'Personalized Job Recommendations',
        description: 'Get AI-powered job matches based on your skills, experience, and career goals — tailored just for you.',
        cta: 'Find Your Match',
        action: 'chatbot', // special: opens chatbot
        accent: {
            bg: 'bg-blue-50',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            numColor: 'text-blue-200',
            border: 'border-blue-100',
            glow: 'hover:border-blue-300 hover:shadow-blue-100',
            ctaColor: 'text-blue-600 hover:text-blue-700',
            badge: 'bg-blue-600',
        }
    },
    {
        num: '02',
        icon: ClipboardList,
        title: 'Track Your Applications',
        description: 'Keep track of all your applications in one place with real-time status updates and recruiter activity.',
        cta: 'Stay Organized',
        action: 'navigate',
        link: '/applications',
        accent: {
            bg: 'bg-purple-50',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            numColor: 'text-purple-200',
            border: 'border-purple-100',
            glow: 'hover:border-purple-300 hover:shadow-purple-100',
            ctaColor: 'text-purple-600 hover:text-purple-700',
            badge: 'bg-purple-600',
        }
    },
    {
        num: '03',
        icon: GraduationCap,
        title: 'Upskill & Grow',
        description: 'Access curated courses, certifications and learning resources to bridge skill gaps and boost your career.',
        cta: 'Start Learning',
        action: 'navigate',
        link: '/upskilling',
        accent: {
            bg: 'bg-emerald-50',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            numColor: 'text-emerald-200',
            border: 'border-emerald-100',
            glow: 'hover:border-emerald-300 hover:shadow-emerald-100',
            ctaColor: 'text-emerald-600 hover:text-emerald-700',
            badge: 'bg-emerald-600',
        }
    },
    {
        num: '04',
        icon: Building2,
        title: 'Connect with Top Employers',
        description: "Explore opportunities from India's leading companies, get noticed by recruiters and build your network.",
        cta: 'Browse Jobs',
        action: 'scroll',
        scrollId: 'job-list',
        accent: {
            bg: 'bg-amber-50',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            numColor: 'text-amber-200',
            border: 'border-amber-100',
            glow: 'hover:border-amber-300 hover:shadow-amber-100',
            ctaColor: 'text-amber-600 hover:text-amber-700',
            badge: 'bg-amber-500',
        }
    },
]

const STATS = [
    { icon: FileText, value: '10K+', label: 'Active Job Listings', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Building2, value: '5K+', label: 'Trusted Companies', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Users, value: '100K+', label: 'Successful Placements', color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: Star, value: '4.9/5', label: 'User Satisfaction', color: 'text-amber-500', bg: 'bg-amber-50' },
]

const FeaturesSection = () => {
    const navigate = useNavigate()
    const { setIsChatbotOpen } = useContext(AppContext)

    const handleCardClick = (f) => {
        if (f.action === 'chatbot') {
            setIsChatbotOpen(true)
        } else if (f.action === 'navigate') {
            navigate(f.link)
        } else if (f.action === 'scroll') {
            const el = document.getElementById(f.scrollId)
            if (el) el.scrollIntoView({ behavior: 'smooth' })
            else navigate('/')
        }
    }

    return (
        <section className="px-6 lg:px-8 mx-auto py-16 overflow-hidden">
            <div className="max-w-screen-xl mx-auto">

                {/* ── Section Header ── */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12"
                >
                    <div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 tracking-widest uppercase mb-3">
                            <Sparkles size={13} className="text-blue-500" />
                            Why InsiderJobs?
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
                            More Than Just{' '}
                            <span className="text-blue-600">Job Listings</span>
                        </h2>
                        <p className="text-gray-500 mt-3 text-base font-medium max-w-lg">
                            Everything you need to build a successful career, all in one place.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="shrink-0 inline-flex items-center gap-2 text-sm font-bold text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm self-start sm:self-auto"
                    >
                        Explore All Features <ArrowRight size={16} />
                    </button>
                </motion.div>

                {/* ── Feature Cards Grid ── */}
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={{
                        hidden: {},
                        visible: {
                            transition: {
                                staggerChildren: 0.15
                            }
                        }
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8"
                >
                    {FEATURES.map((f) => {
                        const Icon = f.icon
                        return (
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, y: 30 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
                                }}
                                key={f.num}
                                className={`group relative flex flex-col p-6 bg-white rounded-2xl border ${f.accent.border} ${f.accent.glow} shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden`}
                                onClick={() => handleCardClick(f)}
                            >
                                {/* Large number watermark */}
                                <span className={`absolute -top-2 -right-1 text-7xl font-black ${f.accent.numColor} select-none pointer-events-none leading-none`}>
                                    {f.num}
                                </span>

                                {/* Number badge + Icon */}
                                <div className="flex items-center gap-3 mb-5 relative z-10">
                                    <span className={`text-xs font-extrabold ${f.accent.badge} text-white px-2.5 py-1 rounded-lg tracking-wider`}>
                                        {f.num}
                                    </span>
                                    <div className={`w-10 h-10 ${f.accent.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon size={20} className={f.accent.iconColor} strokeWidth={2} />
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 relative z-10">
                                    {f.title}
                                </h3>
                                <p className="text-sm text-gray-500 leading-relaxed flex-1 relative z-10">
                                    {f.description}
                                </p>

                                {/* CTA */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleCardClick(f) }}
                                    className={`mt-5 inline-flex items-center gap-1.5 text-sm font-bold ${f.accent.ctaColor} transition-colors group/btn relative z-10 self-start`}
                                >
                                    {f.cta}
                                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
                                </button>
                            </motion.div>
                        )
                    })}
                </motion.div>

                {/* ── Stats Row ── */}
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={{
                        hidden: {},
                        visible: {
                            transition: {
                                staggerChildren: 0.15
                            }
                        }
                    }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                >
                    {STATS.map((stat) => {
                        const Icon = stat.icon
                        return (
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, scale: 0.9 },
                                    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
                                }}
                                key={stat.label}
                                className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}>
                                    <Icon size={20} className={stat.color} strokeWidth={2} />
                                </div>
                                <div>
                                    <p className={`text-xl font-extrabold ${stat.color} leading-none`}>{stat.value}</p>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5 leading-tight">{stat.label}</p>
                                </div>
                            </motion.div>
                        )
                    })}
                </motion.div>

            </div>
        </section>
    )
}

export default FeaturesSection
