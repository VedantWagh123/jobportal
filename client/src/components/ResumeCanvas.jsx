import React from 'react';
import { ZoomIn, ZoomOut, Maximize, Phone, Mail } from 'lucide-react';

const LinkedInIcon = () => (
    <svg className="w-3 h-3 inline-block shrink-0 fill-current" viewBox="0 0 24 24">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
    </svg>
);

const GithubIcon = () => (
    <svg className="w-3 h-3 inline-block shrink-0 fill-current" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
);

const ResumeTemplateRenderer = ({ resume, onUpdate, onFocusSection, isMagnifier, onScaleChange, ...props }) => {
    
    const containerRef = React.useRef(null);
    const contentRef = React.useRef(null);
    const [scale, setScale] = React.useState(1);

    const activeScale = scale;

    React.useEffect(() => {
        if (onScaleChange && !isMagnifier) {
            onScaleChange(activeScale);
        }
    }, [activeScale, isMagnifier, onScaleChange]);

    React.useEffect(() => {
        
        const updateScale = () => {
            if (containerRef.current && contentRef.current) {
                const containerHeight = containerRef.current.clientHeight;
                const contentHeight = contentRef.current.scrollHeight;
                // If content is taller than the container (A4 height), scale it down
                if (contentHeight > containerHeight && containerHeight > 0) {
                    setScale(containerHeight / contentHeight);
                } else {
                    setScale(1);
                    setViewportScale(1);
                }
            }
        };

        const timer = setTimeout(updateScale, 50);
        return () => clearTimeout(timer);
    }, [resume, isMagnifier, onScaleChange]);

    // Helper to safely handle inline edits
    const handleEdit = (path, value) => {
        // deep update object logic
        const keys = path.split('.');
        onUpdate((prev) => {
            const newState = JSON.parse(JSON.stringify(prev));
            let curr = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                if(!curr[keys[i]]) curr[keys[i]] = {};
                curr = curr[keys[i]];
            }
            curr[keys[keys.length - 1]] = value;
            return newState;
        });
    };

    const EditableText = ({ tag: Tag = 'span', path, value, placeholder, className, style, onClick, isLink, href }) => {
        const linkClass = isLink ? "text-blue-600 hover:underline" : "";
        const hasContent = Boolean(value && String(value).trim().length > 0);
        
        if (isMagnifier) {
            if (isLink) {
                return (
                    <a href={href || '#'} target="_blank" rel="noopener noreferrer" className={`${linkClass} ${className || ''}`} style={style}>
                        {hasContent ? value : (placeholder || '')}
                    </a>
                );
            }
            return (
                <Tag className={`${className || ''}`} style={style}>
                    {hasContent ? value : (placeholder || '')}
                </Tag>
            );
        }
        
        const TagToUse = isLink ? 'a' : Tag;

        return (
            <TagToUse 
                href={isLink ? (href || '#') : undefined}
                target={isLink ? "_blank" : undefined}
                className={`outline-none hover:bg-blue-50/50 hover:ring-2 hover:ring-blue-200/50 transition-all rounded-sm cursor-text ${linkClass} ${className || ''}`}
                style={style}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                    const text = e.target.innerText.trim();
                    if(text !== (value || '')) {
                        handleEdit(path, text);
                    }
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    if(onClick) onClick();
                }}
                data-placeholder={placeholder}
            >
                {hasContent ? value : (placeholder ? <span className="text-gray-400 italic opacity-60 pointer-events-none select-none">{placeholder}</span> : '')}
            </TagToUse>
        );
    };

    const renderList = (text, path) => {
        if(!text) text = '';
        return (
            <div 
                className="outline-none hover:bg-blue-50/50 hover:ring-2 hover:ring-blue-200/50 transition-all rounded-sm cursor-text min-h-[1.5em]"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                    let newText = e.target.innerText;
                    if(newText !== text) handleEdit(path, newText);
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {text.split('\n').map((line, i) => {
                    const trimmed = line.trim();
                    const isBullet = trimmed.startsWith('-') || trimmed.startsWith('•');
                    const cleanLine = isBullet ? trimmed.replace(/^[-•]\s*/, '') : line;
                    if (isBullet) {
                        return (
                            <div key={i} className="flex items-start gap-1.5 mb-0.5 text-justify">
                                <span className="select-none font-bold text-gray-900 shrink-0 mt-[1px]">•</span>
                                <span className="flex-1">{cleanLine}</span>
                            </div>
                        );
                    }
                    return <div key={i}>{line}</div>;
                })}
            </div>
        );
    };

    const getHeaderClass = (tmpl) => {
        if (tmpl === 'Modern Professional') return "text-[13px] font-bold font-serif border-b border-black pb-0.5 mb-1 text-gray-900";
        if (tmpl === 'Tech Professional') return "text-[12px] bg-gray-100 px-2 py-1 font-bold uppercase mt-4 mb-2 inline-block";
        if (tmpl === 'Minimal Executive') return "text-[12px] text-gray-400 uppercase tracking-widest mt-5 mb-2 border-b border-gray-100 pb-1";
        return "text-[13px] font-bold border-b-[1.5px] border-gray-800 uppercase mb-1.5 pb-0.5";
    };

    const getTitleClass = (tmpl) => {
        if (tmpl === 'Modern Professional') return "font-bold text-gray-900 text-[12px] font-serif";
        if (tmpl === 'Tech Professional') return "font-bold text-[12px]";
        if (tmpl === 'Minimal Executive') return "font-semibold text-gray-800 text-[11px] tracking-wide";
        return "font-bold text-[11px]"; 
    };

    const getSubtitleClass = (tmpl) => {
        if (tmpl === 'Modern Professional') return "text-[11px] font-serif text-gray-700 italic";
        if (tmpl === 'Tech Professional') return "text-[11px] italic mb-1";
        if (tmpl === 'Minimal Executive') return "text-[11px] text-gray-500 mb-1";
        return "italic text-[11px] text-gray-700"; 
    };

    const getDescClass = (tmpl) => {
        if (tmpl === 'Modern Professional') return "text-[11px] font-serif leading-[1.45] text-gray-800 pl-2 mt-0.5";
        if (tmpl === 'Tech Professional') return "text-[11px] text-gray-700 mt-1";
        if (tmpl === 'Minimal Executive') return "text-[11px] text-gray-600 font-light leading-relaxed mt-1";
        return "text-[11px] leading-[1.5] pl-3"; 
    };

    const getItemContainerClass = (tmpl) => {
        if (tmpl === 'Modern Professional') return "mb-2";
        if (tmpl === 'Tech Professional') return "mb-2 border-l-2 border-gray-200 pl-3";
        if (tmpl === 'Minimal Executive') return "mb-3";
        return "mb-2.5";
    }

    const getListContainerClass = (tmpl) => {
        if (tmpl === 'Modern Professional') return "mb-2.5";
        if (tmpl === 'Tech Professional') return "mb-4";
        if (tmpl === 'Minimal Executive') return "mb-5";
        return "mb-3";
    }

    // Dynamic Section Renderer
    const renderDynamicSections = (activeOrder) => {
        const tmpl = resume.template || 'ATS Classic';
        return activeOrder.map(section => {
            if (section === 'summary' && resume.summary) {
                return (
                    <div key="summary" className={getListContainerClass(tmpl)}>
                        <h2 className={getHeaderClass(tmpl)}>{tmpl === 'Modern Professional' ? 'Profile Summary' : 'Professional Summary'}</h2>
                        <div className={tmpl === 'Modern Professional' ? "text-[11px] font-serif leading-[1.45] text-gray-800" : (tmpl === 'Minimal Executive' ? "text-[11px] text-gray-600 font-light leading-relaxed text-justify" : "text-[11px] leading-[1.5] text-justify text-gray-800")}>
                            {renderList(resume.summary, 'summary')}
                        </div>
                    </div>
                );
            }

            if (section === 'coursework' && resume.skills?.coursework?.length > 0) {
                return (
                    <div key="coursework" className={getListContainerClass(tmpl)} onClick={() => onFocusSection('skills')}>
                        <h2 className={getHeaderClass(tmpl)}>Relevant Coursework</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-[11px] font-serif text-gray-800 my-0.5">
                            {resume.skills.coursework.map((course, idx) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                    <span className="text-gray-700 font-bold select-none">•</span>
                                    <EditableText path={`skills.coursework.${idx}`} value={course} placeholder="Course Name" />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }
            
            if (section === 'experience' && resume.experience?.length > 0) {
                return (
                    <div key="experience" className={getListContainerClass(tmpl)} onClick={() => onFocusSection('experience')}>
                        <h2 className={getHeaderClass(tmpl)}>Experience</h2>
                        {resume.experience.map((exp, idx) => (
                            <div key={idx} className={getItemContainerClass(tmpl)}>
                                <div className={`flex justify-between ${getTitleClass(tmpl)} text-gray-900 mb-0.5`}>
                                    <div>
                                        <EditableText path={`experience.${idx}.company`} value={exp.company} placeholder="Company" />
                                        {exp.jobTitle && (
                                            <span>
                                                {tmpl === 'Modern Professional' ? ' - ' : ', '}
                                                <EditableText path={`experience.${idx}.jobTitle`} value={exp.jobTitle} placeholder="Job Title" />
                                            </span>
                                        )}
                                        {exp.location && <span className="ml-1 font-normal text-gray-600 font-serif">, <EditableText path={`experience.${idx}.location`} value={exp.location} placeholder="Location" /></span>}
                                    </div>
                                    <span className="font-normal text-gray-700 text-[11px] shrink-0 ml-2 font-serif">
                                        <EditableText path={`experience.${idx}.startDate`} value={exp.startDate} placeholder="Start" /> – <EditableText path={`experience.${idx}.endDate`} value={exp.currentlyWorking ? 'Present' : exp.endDate} placeholder="End" />
                                    </span>
                                </div>
                                <div className={getDescClass(tmpl)}>
                                    {renderList(exp.responsibilities, `experience.${idx}.responsibilities`)}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }
            
            if (section === 'projects' && resume.projects?.length > 0) {
                return (
                    <div key="projects" className={getListContainerClass(tmpl)} onClick={() => onFocusSection('projects')}>
                        <h2 className={getHeaderClass(tmpl)}>Projects</h2>
                        {resume.projects.map((proj, idx) => (
                            <div key={idx} className={getItemContainerClass(tmpl)}>
                                <div className="flex justify-between items-baseline mb-0.5 font-serif text-[11px]">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="font-bold text-[12px] text-gray-900">
                                            <EditableText path={`projects.${idx}.projectName`} value={proj.projectName} placeholder="Project Name" />
                                        </span>
                                        {proj.technologies?.length > 0 && (
                                            <span className="italic text-gray-700 font-serif">| {proj.technologies.join(', ')}</span>
                                        )}
                                        {proj.liveDemoUrl && (
                                            <span>| <a href={proj.liveDemoUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Live Dashboard</a></span>
                                        )}
                                        {proj.githubUrl && (
                                            <span>| <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">GitHub Repository</a></span>
                                        )}
                                    </div>
                                    <span className="font-serif text-[11px] text-gray-800 font-normal shrink-0 ml-2">
                                        <EditableText path={`projects.${idx}.role`} value={proj.role} placeholder="Month Year" />
                                    </span>
                                </div>
                                <div className={getDescClass(tmpl)}>
                                    {renderList(proj.description, `projects.${idx}.description`)}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }
            
            if (section === 'skills' && resume.skills && (resume.skills.technical?.length > 0 || resume.skills.programmingLanguages?.length > 0 || resume.skills.frameworks?.length > 0 || resume.skills.databases?.length > 0 || resume.skills.tools?.length > 0 || resume.skills.softSkills?.length > 0)) {
                return (
                    <div key="skills" className={getListContainerClass(tmpl)} onClick={() => onFocusSection('skills')}>
                        <h2 className={getHeaderClass(tmpl)}>{tmpl === 'Modern Professional' ? 'Technical Skills' : 'Skills'}</h2>
                        <div className="text-[11px] leading-relaxed space-y-0.5 font-serif">
                            {resume.skills.tools?.length > 0 && (
                                <div><strong className="text-gray-900">{tmpl === 'Modern Professional' ? 'Analytical Tools' : 'Tools'}:</strong> {resume.skills.tools.join(', ')}</div>
                            )}
                            {resume.skills.programmingLanguages?.length > 0 && (
                                <div><strong className="text-gray-900">Languages:</strong> {resume.skills.programmingLanguages.join(', ')}</div>
                            )}
                            {resume.skills.frameworks?.length > 0 && (
                                <div><strong className="text-gray-900">{tmpl === 'Modern Professional' ? 'Technologies/Frameworks' : 'Frameworks'}:</strong> {resume.skills.frameworks.join(', ')}</div>
                            )}
                            {resume.skills.technical?.length > 0 && (
                                <div><strong className="text-gray-900">Technical:</strong> {resume.skills.technical.join(', ')}</div>
                            )}
                            {resume.skills.databases?.length > 0 && (
                                <div><strong className="text-gray-900">Databases:</strong> {resume.skills.databases.join(', ')}</div>
                            )}
                            {resume.skills.softSkills?.length > 0 && (
                                <div><strong className="text-gray-900">Soft Skills:</strong> {resume.skills.softSkills.join(', ')}</div>
                            )}
                        </div>
                    </div>
                );
            }

            if (section === 'education' && resume.education?.length > 0) {
                return (
                    <div key="education" className={getListContainerClass(tmpl)} onClick={() => onFocusSection('education')}>
                        <h2 className={getHeaderClass(tmpl)}>Education</h2>
                        {resume.education.map((edu, idx) => (
                            <div key={idx} className={getItemContainerClass(tmpl)}>
                                <div className="flex justify-between items-baseline font-serif">
                                    <span className="font-bold text-[12px] text-gray-900">
                                        <EditableText path={`education.${idx}.institution`} value={edu.institution} placeholder="Institution" />
                                    </span>
                                    <span className="font-serif text-[11px] text-gray-800">
                                        <EditableText path={`education.${idx}.startYear`} value={edu.startYear} placeholder="Start" /> – <EditableText path={`education.${idx}.endYear`} value={edu.endYear} placeholder="End" />
                                    </span>
                                </div>
                                <div className="flex justify-between items-baseline italic text-gray-700 font-serif text-[11px]">
                                    <span>
                                        <EditableText path={`education.${idx}.degree`} value={edu.degree} placeholder="Degree" />
                                        {edu.score && !edu.degree?.includes(edu.score) && <span className="ml-1 font-normal not-italic">({edu.score})</span>}
                                    </span>
                                    {edu.location && (
                                        <span>
                                            <EditableText path={`education.${idx}.location`} value={edu.location} placeholder="Location" />
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }
            
            if (section === 'certifications' && resume.certifications?.length > 0) {
                return (
                    <div key="certifications" className={getListContainerClass(tmpl)} onClick={() => onFocusSection('certifications')}>
                        <h2 className={getHeaderClass(tmpl)}>{tmpl === 'Modern Professional' ? 'Extracurricular / Certifications' : 'Certifications'}</h2>
                        <ul className="list-none space-y-1 text-[11px] font-serif">
                            {resume.certifications.map((cert, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                    <span className="font-bold text-gray-700 select-none">•</span>
                                    <div>
                                        <EditableText path={`certifications.${idx}.certificateName`} value={cert.certificateName} placeholder="Certification Name" />
                                        {cert.credentialUrl && (
                                            <span>—<a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View Credentials</a></span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            }

            if (section === 'achievements' && resume.achievements?.length > 0) {
                return (
                    <div key="achievements" className={getListContainerClass(tmpl)} onClick={() => onFocusSection('achievements')}>
                        <h2 className={getHeaderClass(tmpl)}>Achievements</h2>
                        <ul className={tmpl === 'Modern Professional' ? "text-sm list-none space-y-2 text-gray-700" : "list-none space-y-1.5 text-[11px]"}>
                            {resume.achievements.map((ach, idx) => (
                                <li key={idx} className={getItemContainerClass(tmpl)}>
                                    <div className={`flex justify-between ${getTitleClass(tmpl)}`}>
                                        <span>
                                            <EditableText path={`achievements.${idx}.achievementName`} value={ach.achievementName} placeholder="Achievement Name" />
                                            {(ach.organization || !ach.achievementName) && (
                                                <span className="font-normal italic">
                                                    {ach.achievementName ? ', ' : ''}
                                                    <EditableText path={`achievements.${idx}.organization`} value={ach.organization} placeholder="Organization / Event" />
                                                </span>
                                            )}
                                        </span>
                                        <span className="font-normal text-gray-500 text-[10px]">
                                            <EditableText path={`achievements.${idx}.date`} value={ach.date} placeholder="MM/YYYY" />
                                        </span>
                                    </div>
                                    {ach.description && (
                                        <div className={getDescClass(tmpl)}>
                                            {renderList(ach.description, `achievements.${idx}.description`)}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            }
            
            return null;
        });
    };

    // Styling logic similar to PDF generator
    let containerClass = "bg-white overflow-hidden shadow-xl mx-auto text-gray-900 relative";
    
    // Add custom design options
    const customStyle = { width: '210mm', height: '297mm' }; // fixed height for auto-scaling
    const fontFamilies = {
        'Inter': "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        'Roboto': "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
        'Merriweather': "'Merriweather', Georgia, Cambria, 'Times New Roman', serif",
        'Outfit': "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    };

    const chosenFont = resume.design?.fontFamily;
    const activeFont = chosenFont && fontFamilies[chosenFont]
        ? fontFamilies[chosenFont]
        : (chosenFont ? `'${chosenFont}', sans-serif` : (resume.template === 'ATS Classic' || resume.template === 'Modern Professional' ? '"Times New Roman", Times, Georgia, serif' : "'Inter', sans-serif"));

    customStyle.fontFamily = activeFont;

    const fontStyleBlock = (
        <style>{`
            .resume-canvas-scope, 
            .resume-canvas-scope *,
            .resume-canvas-scope h1,
            .resume-canvas-scope h2,
            .resume-canvas-scope h3,
            .resume-canvas-scope div,
            .resume-canvas-scope span,
            .resume-canvas-scope p,
            .resume-canvas-scope a,
            .resume-canvas-scope li {
                font-family: ${activeFont} !important;
            }
        `}</style>
    );

    const defaultOrder = ['summary', 'coursework', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements'];
    const rawOrder = (resume.sectionOrder && resume.sectionOrder.length > 0) ? resume.sectionOrder : defaultOrder;
    const activeOrder = [...rawOrder];
    defaultOrder.forEach(sec => {
        if (!activeOrder.includes(sec)) {
            activeOrder.push(sec);
        }
    });

    let innerClass = "w-full";
    if (resume.template === 'ATS Classic') {
        innerClass += " px-14 py-10"; // Approx 0.6-0.75 inch margins
    } else if (resume.template === 'Modern Professional') {
        innerClass += " px-12 py-8";
    } else {
        innerClass += " p-8";
    }

    return (
        <div ref={containerRef} className={`${containerClass} resume-canvas-scope`} style={customStyle} onClick={() => onFocusSection('personalInfo')}>
            {fontStyleBlock}
            <div ref={contentRef} className={innerClass} style={{ transform: `scale(${activeScale})`, transformOrigin: 'top center', width: '100%' }}>
                {/* Header based on Template */}
                <div className={`text-center ${resume.template === 'Tech Professional' ? 'text-left border-b border-gray-200 pb-4 mb-6' : 'mb-4'}`}>
                    {resume.template === 'Modern Professional' ? (
                        <>
                            <div className="text-center mb-1">
                                <EditableText 
                                    tag="h1" 
                                    path="personalInfo.fullName" 
                                    value={resume.personalInfo?.fullName} 
                                    placeholder="PRADEEP M"
                                    className="font-serif text-[28px] tracking-[0.22em] font-normal uppercase text-gray-900 block"
                                />
                                {resume.personalInfo?.location && (
                                    <div className="text-[12px] font-serif text-gray-800 mt-0.5">
                                        <EditableText path="personalInfo.location" value={resume.personalInfo?.location} placeholder="Location" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-serif text-gray-800 mb-2">
                                {resume.personalInfo?.phone && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Phone size={12} className="text-gray-900 fill-current" />
                                        <EditableText path="personalInfo.phone" value={resume.personalInfo?.phone} placeholder="Phone" />
                                    </span>
                                )}
                                {resume.personalInfo?.email && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Mail size={12} className="text-gray-900" />
                                        <EditableText path="personalInfo.email" value={resume.personalInfo?.email} placeholder="Email" isLink={true} href={`mailto:${resume.personalInfo?.email}`} />
                                    </span>
                                )}
                                {resume.personalInfo?.linkedin && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <LinkedInIcon />
                                        <EditableText path="personalInfo.linkedin" value={resume.personalInfo?.linkedin} placeholder="LinkedIn" isLink={true} href={resume.personalInfo?.linkedin?.startsWith('http') ? resume.personalInfo?.linkedin : `https://${resume.personalInfo?.linkedin}`} />
                                    </span>
                                )}
                                {resume.personalInfo?.portfolioUrl && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <GithubIcon />
                                        <EditableText path="personalInfo.portfolioUrl" value={resume.personalInfo?.portfolioUrl} placeholder="Portfolio" isLink={true} href={resume.personalInfo?.portfolioUrl?.startsWith('http') ? resume.personalInfo?.portfolioUrl : `https://${resume.personalInfo?.portfolioUrl}`} />
                                    </span>
                                )}
                            </div>
                        </>
                    ) : (
                        <EditableText 
                            tag="h1" 
                            path="personalInfo.fullName" 
                            value={resume.personalInfo?.fullName} 
                            placeholder="Your Name"
                            className={
                                resume.template === 'Tech Professional' ? 'text-2xl font-black uppercase mb-1' :
                                resume.template === 'Minimal Executive' ? 'text-3xl font-light tracking-widest uppercase mb-2' :
                                'text-2xl font-bold uppercase tracking-wider mb-1'
                            }
                        />
                    )}
                    
                    {resume.template === 'Modern Professional' ? null : resume.template === 'ATS Classic' ? (
                        <>
                            <div className="text-[13px] flex flex-wrap gap-1 text-gray-700 justify-center mb-1">
                                {resume.personalInfo?.professionalTitle && <EditableText path="personalInfo.professionalTitle" value={resume.personalInfo?.professionalTitle} placeholder="Professional Title" />}
                                {(resume.personalInfo?.professionalTitle && resume.personalInfo?.location) && <span className="mx-1">|</span>}
                                {resume.personalInfo?.location && <EditableText path="personalInfo.location" value={resume.personalInfo?.location} placeholder="Location" />}
                            </div>
                            <div className="text-[11.5px] flex flex-wrap gap-1 text-gray-600 justify-center">
                                {resume.personalInfo?.email && <EditableText path="personalInfo.email" value={resume.personalInfo?.email} placeholder="Email" isLink={true} href={`mailto:${resume.personalInfo?.email}`} />}
                                {(resume.personalInfo?.email && resume.personalInfo?.phone) && <span className="mx-1">|</span>}
                                {resume.personalInfo?.phone && <EditableText path="personalInfo.phone" value={resume.personalInfo?.phone} placeholder="Phone" />}
                                {((resume.personalInfo?.email || resume.personalInfo?.phone) && resume.personalInfo?.linkedin) && <span className="mx-1">|</span>}
                                {resume.personalInfo?.linkedin && <EditableText path="personalInfo.linkedin" value={resume.personalInfo?.linkedin} placeholder="LinkedIn" isLink={true} href={resume.personalInfo?.linkedin?.startsWith('http') ? resume.personalInfo?.linkedin : `https://${resume.personalInfo?.linkedin}`} />}
                                {((resume.personalInfo?.email || resume.personalInfo?.phone || resume.personalInfo?.linkedin) && resume.personalInfo?.portfolioUrl) && <span className="mx-1">|</span>}
                                {resume.personalInfo?.portfolioUrl && <EditableText path="personalInfo.portfolioUrl" value={resume.personalInfo?.portfolioUrl} placeholder="Portfolio/GitHub" isLink={true} href={resume.personalInfo?.portfolioUrl?.startsWith('http') ? resume.personalInfo?.portfolioUrl : `https://${resume.personalInfo?.portfolioUrl}`} />}
                            </div>
                        </>
                    ) : (
                        <>
                            {resume.personalInfo?.professionalTitle && (
                                <EditableText 
                                    tag="h2" 
                                    path="personalInfo.professionalTitle" 
                                    value={resume.personalInfo?.professionalTitle} 
                                    placeholder="Professional Title"
                                    className="text-[13px] text-gray-500 uppercase tracking-widest mb-3"
                                />
                            )}
                            <div className={`text-[11px] flex flex-col gap-1 text-gray-600 ${resume.template === 'Tech Professional' ? 'items-start' : 'items-center'}`}>
                                <div className="flex flex-wrap gap-2">
                                    <EditableText path="personalInfo.email" value={resume.personalInfo?.email} placeholder="Email" isLink={true} href={`mailto:${resume.personalInfo?.email}`} />
                                    {resume.personalInfo?.phone && <span>|</span>}
                                    <EditableText path="personalInfo.phone" value={resume.personalInfo?.phone} placeholder="Phone" />
                                    {resume.personalInfo?.location && <span>|</span>}
                                    <EditableText path="personalInfo.location" value={resume.personalInfo?.location} placeholder="Location" />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <EditableText path="personalInfo.linkedin" value={resume.personalInfo?.linkedin} placeholder="LinkedIn" isLink={true} href={resume.personalInfo?.linkedin?.startsWith('http') ? resume.personalInfo?.linkedin : `https://${resume.personalInfo?.linkedin}`} />
                                    {resume.personalInfo?.portfolioUrl && <span>|</span>}
                                    <EditableText path="personalInfo.portfolioUrl" value={resume.personalInfo?.portfolioUrl} placeholder="Portfolio/GitHub" isLink={true} href={resume.personalInfo?.portfolioUrl?.startsWith('http') ? resume.personalInfo?.portfolioUrl : `https://${resume.personalInfo?.portfolioUrl}`} />
                                </div>
                            </div>
                        </>
                    )}
                </div>
                {renderDynamicSections(activeOrder)}
            </div>
        </div>
    );
};



const ResumeCanvas = (props) => {
    const [isMagnifierActive, setIsMagnifierActive] = React.useState(false);
    const [currentScale, setCurrentScale] = React.useState(1);
    const [viewportScale, setViewportScale] = React.useState(1);
    const [magnifierPos, setMagnifierPos] = React.useState({ targetX: 0, targetY: 0, circleX: 0, circleY: 0 });
    const scrollContainerRef = React.useRef(null);
    const resumeWrapperRef = React.useRef(null);
    const requestRef = React.useRef();

    const handleMouseMove = (e) => {
        if (isMagnifierActive && scrollContainerRef.current && resumeWrapperRef.current) {
            // 1. Mouse position relative to the exact Resume content (for accurate zoom targeting)
            const resumeRect = resumeWrapperRef.current.getBoundingClientRect();
            // Divide by viewportScale to map back to original unscaled coordinates
            const targetX = (e.clientX - resumeRect.left) / viewportScale;
            const targetY = (e.clientY - resumeRect.top) / viewportScale;
            
            // 2. Mouse position relative to the scroll container (for placing the circular magnifier box)
            const scrollRect = scrollContainerRef.current.getBoundingClientRect();
            let circleX = e.clientX - scrollRect.left + 30; // 30px offset right
            let circleY = e.clientY - scrollRect.top + 30;  // 30px offset down
            
            // Constrain circle inside the wrapper
            if (circleX + 350 > scrollRect.width) circleX = (e.clientX - scrollRect.left) - 350 - 30;
            if (circleY + 350 > scrollRect.height) circleY = (e.clientY - scrollRect.top) - 350 - 30;
            
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            requestRef.current = requestAnimationFrame(() => {
                setMagnifierPos({ targetX, targetY, circleX, circleY });
            });
        }
    };

    React.useEffect(() => {
        const updateViewport = () => {
            if (scrollContainerRef.current) {
                const { clientWidth, clientHeight } = scrollContainerRef.current;
                const scaleX = (clientWidth - 32) / 794; // 16px padding on each side
                const scaleY = (clientHeight - 32) / 1122;
                
                let finalScale = 1;
                if (props.resume.template === 'Modern Professional') {
                    finalScale = Math.min(1, scaleX); // Allow unlimited height for Modern Pro
                } else {
                    finalScale = Math.min(1, Math.min(scaleX, scaleY));
                }
                setViewportScale(finalScale);
            }
        };

        updateViewport();
        window.addEventListener('resize', updateViewport);
        
        const resizeObserver = new ResizeObserver(() => updateViewport());
        if (scrollContainerRef.current) {
            resizeObserver.observe(scrollContainerRef.current);
        }
        
        return () => {
            window.removeEventListener('resize', updateViewport);
            resizeObserver.disconnect();
        };
    }, [props.resume.template]);

    return (
        <div 
            className="relative w-full h-full flex flex-col bg-gray-100 overflow-hidden group" 
            onDoubleClick={() => setIsMagnifierActive(!isMagnifierActive)} 
        >
            {/* Zoom Controls Removed as per request */}
            {isMagnifierActive && (
                <div className="absolute top-4 right-4 z-[60] pointer-events-none">
                    <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow animate-pulse">
                        Magnifier ON (Double-click to turn off)
                    </div>
                </div>
            )}

            {/* The Resume Render */}
            <div 
                ref={scrollContainerRef} 
                className="flex-1 overflow-y-auto overflow-x-hidden flex justify-center items-start p-4 relative custom-scrollbar" 
                onMouseMove={handleMouseMove}
            >
                <div 
                    className="relative transition-transform duration-200" 
                    ref={resumeWrapperRef}
                    style={{ transform: `scale(${viewportScale})`, transformOrigin: 'center center' }}
                >
                    <ResumeTemplateRenderer {...props} onScaleChange={setCurrentScale} />
                </div>
            </div>

            {/* Magnifier Overlay */}
            {isMagnifierActive && resumeWrapperRef.current && (
                <div 
                    className="absolute pointer-events-none border-4 border-blue-500 bg-white rounded-full overflow-hidden shadow-2xl z-50 transition-opacity duration-200 opacity-0 group-hover:opacity-100"
                    style={{
                        width: 350, height: 350,
                        left: magnifierPos.circleX,
                        top: magnifierPos.circleY,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)', // Clean shadow without dark background
                    }}
                >
                    <div className="absolute top-0 left-0" style={{
                        transform: `translate(${-magnifierPos.targetX * 2.5 + 175}px, ${-magnifierPos.targetY * 2.5 + 175}px) scale(2.5)`,
                        transformOrigin: '0 0',
                        width: 794,
                        height: props.resume.template === 'Modern Professional' ? (resumeWrapperRef.current ? resumeWrapperRef.current.scrollHeight : 1122) : 1122
                    }}>
                        <ResumeTemplateRenderer {...props} />
                    </div>
                    {/* Crosshair dot at exact center to verify accuracy */}
                    <div className="absolute w-1.5 h-1.5 bg-red-500 rounded-full shadow-md z-[60]" style={{ left: '175px', top: '175px', transform: 'translate(-50%, -50%)' }}></div>
                </div>
            )}
        </div>
    );
};

export default ResumeCanvas;
