import React from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

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
        if (resume.template === 'Modern Professional') {
            setScale(1);
            return;
        }
        if (resume.template !== 'ATS Classic' && resume.template !== 'Tech Professional' && resume.template !== 'Minimal Executive') return;
        
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
        
        if (isMagnifier) {
            if (isLink) {
                return (
                    <a href={href || '#'} target="_blank" rel="noopener noreferrer" className={`${linkClass} ${className || ''}`} style={style}>
                        {value || ''}
                    </a>
                );
            }
            return (
                <Tag className={`${className || ''}`} style={style}>
                    {value || ''}
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
                    if(text !== value) {
                        handleEdit(path, text);
                    }
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    if(onClick) onClick();
                }}
                data-placeholder={placeholder}
            >
                {value || ''}
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
                    const html = e.target.innerHTML;
                    // very basic parse back to text if they created divs/brs
                    let newText = e.target.innerText;
                    if(newText !== text) handleEdit(path, newText);
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {text.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                ))}
            </div>
        );
    };

    const getHeaderClass = (tmpl) => {
        if (tmpl === 'Modern Professional') return "text-lg font-bold uppercase bg-gray-800 text-white py-1 px-3 mb-4 inline-block tracking-wider";
        if (tmpl === 'Tech Professional') return "text-[12px] bg-gray-100 px-2 py-1 font-bold uppercase mt-4 mb-2 inline-block";
        if (tmpl === 'Minimal Executive') return "text-[12px] text-gray-400 uppercase tracking-widest mt-5 mb-2 border-b border-gray-100 pb-1";
        return "text-[13px] font-bold border-b-[1.5px] border-gray-800 uppercase mb-1.5 pb-0.5";
    };

    const getTitleClass = (tmpl) => {
        if (tmpl === 'Modern Professional') return "font-bold text-gray-800 text-sm";
        if (tmpl === 'Tech Professional') return "font-bold text-[12px]";
        if (tmpl === 'Minimal Executive') return "font-semibold text-gray-800 text-[11px] tracking-wide";
        return "font-bold text-[11px]"; 
    };

    const getSubtitleClass = (tmpl) => {
        if (tmpl === 'Modern Professional') return "text-sm font-medium text-blue-600 mb-2";
        if (tmpl === 'Tech Professional') return "text-[11px] italic mb-1";
        if (tmpl === 'Minimal Executive') return "text-[11px] text-gray-500 mb-1";
        return "italic text-[11px] text-gray-700"; 
    };

    const getDescClass = (tmpl) => {
        if (tmpl === 'Modern Professional') return "text-sm text-gray-700 pl-4 border-l border-gray-200 mt-1";
        if (tmpl === 'Tech Professional') return "text-[11px] text-gray-700 mt-1";
        if (tmpl === 'Minimal Executive') return "text-[11px] text-gray-600 font-light leading-relaxed mt-1";
        return "text-[11px] leading-[1.5] pl-3"; 
    };

    const getItemContainerClass = (tmpl) => {
        if (tmpl === 'Modern Professional') return "mb-4";
        if (tmpl === 'Tech Professional') return "mb-2 border-l-2 border-gray-200 pl-3";
        if (tmpl === 'Minimal Executive') return "mb-3";
        return "mb-2.5";
    }

    const getListContainerClass = (tmpl) => {
        if (tmpl === 'Modern Professional') return "mb-6";
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
                        <h2 className={getHeaderClass(tmpl)}>Professional Summary</h2>
                        <EditableText 
                            tag="div" 
                            path="summary" 
                            value={resume.summary} 
                            className={tmpl === 'Modern Professional' ? "text-sm leading-relaxed" : (tmpl === 'Minimal Executive' ? "text-[11px] text-gray-600 font-light leading-relaxed text-justify" : "text-[11px] leading-[1.5] text-justify text-gray-800")}
                            onClick={() => onFocusSection('summary')}
                        />
                    </div>
                );
            }
            
            if (section === 'experience' && resume.experience?.length > 0) {
                return (
                    <div key="experience" className={getListContainerClass(tmpl)} onClick={() => onFocusSection('experience')}>
                        <h2 className={getHeaderClass(tmpl)}>Experience</h2>
                        {resume.experience.map((exp, idx) => (
                            <div key={idx} className={getItemContainerClass(tmpl)}>
                                <div className={`flex justify-between ${getTitleClass(tmpl)} text-gray-900`}>
                                    <EditableText path={`experience.${idx}.jobTitle`} value={exp.jobTitle} />
                                    <span className="font-normal text-gray-500 text-[10px] md:text-inherit">
                                        <EditableText path={`experience.${idx}.startDate`} value={exp.startDate} /> - <EditableText path={`experience.${idx}.endDate`} value={exp.currentlyWorking ? 'Present' : exp.endDate} />
                                    </span>
                                </div>
                                <div className={getSubtitleClass(tmpl)}>
                                    <EditableText path={`experience.${idx}.company`} value={exp.company} /> 
                                    {exp.location && <span className="ml-1 font-normal">(<EditableText path={`experience.${idx}.location`} value={exp.location} />)</span>}
                                </div>
                                <div className={getDescClass(tmpl)}>
                                    {renderList(exp.responsibilities, `experience.${idx}.responsibilities`)}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }
            
            if (section === 'education' && resume.education?.length > 0) {
                return (
                    <div key="education" className={getListContainerClass(tmpl)} onClick={() => onFocusSection('education')}>
                        <h2 className={getHeaderClass(tmpl)}>Education</h2>
                        {resume.education.map((edu, idx) => (
                            <div key={idx} className={getItemContainerClass(tmpl)}>
                                <div className={`flex justify-between ${getTitleClass(tmpl)}`}>
                                    <EditableText path={`education.${idx}.degree`} value={edu.degree} />
                                    <span className="font-normal text-gray-500 text-[10px] md:text-inherit">
                                        <EditableText path={`education.${idx}.startYear`} value={edu.startYear} /> - <EditableText path={`education.${idx}.endYear`} value={edu.endYear} />
                                    </span>
                                </div>
                                <div className={getSubtitleClass(tmpl)}>
                                    <EditableText path={`education.${idx}.institution`} value={edu.institution} />
                                    {edu.score && <span className="ml-2 font-normal">(<EditableText path={`education.${idx}.score`} value={edu.score} />)</span>}
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
                                <div className={getTitleClass(tmpl)}>
                                    <EditableText path={`projects.${idx}.projectName`} value={proj.projectName} />
                                </div>
                                <div className={`${getSubtitleClass(tmpl)} flex gap-3`}>
                                    {(proj.technologies && proj.technologies.length > 0) && (
                                        <span>Tech: {proj.technologies.join(', ')}</span>
                                    )}
                                    {proj.liveDemoUrl && <a href={proj.liveDemoUrl} target="_blank" rel="noreferrer" className="text-blue-600">Live Demo</a>}
                                    {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-blue-600">GitHub</a>}
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
                        <h2 className={getHeaderClass(tmpl)}>Skills</h2>
                        <div className={tmpl === 'Modern Professional' ? "text-sm space-y-3" : "text-[11px] leading-[1.4] space-y-0.5"}>
                            {resume.skills.programmingLanguages?.length > 0 && (
                                <div><span className="font-bold text-gray-800">Languages:</span> {resume.skills.programmingLanguages.join(', ')}</div>
                            )}
                            {resume.skills.frameworks?.length > 0 && (
                                <div><span className="font-bold text-gray-800">Frameworks:</span> {resume.skills.frameworks.join(', ')}</div>
                            )}
                            {resume.skills.technical?.length > 0 && (
                                <div><span className="font-bold text-gray-800">Technical:</span> {resume.skills.technical.join(', ')}</div>
                            )}
                            {resume.skills.databases?.length > 0 && (
                                <div><span className="font-bold text-gray-800">Databases:</span> {resume.skills.databases.join(', ')}</div>
                            )}
                            {resume.skills.tools?.length > 0 && (
                                <div><span className="font-bold text-gray-800">Tools:</span> {resume.skills.tools.join(', ')}</div>
                            )}
                            {resume.skills.softSkills?.length > 0 && (
                                <div><span className="font-bold text-gray-800">Soft Skills:</span> {resume.skills.softSkills.join(', ')}</div>
                            )}
                        </div>
                    </div>
                );
            }
            
            if (section === 'certifications' && resume.certifications?.length > 0) {
                return (
                    <div key="certifications" className={getListContainerClass(tmpl)} onClick={() => onFocusSection('certifications')}>
                        <h2 className={getHeaderClass(tmpl)}>Certifications</h2>
                        <ul className={tmpl === 'Modern Professional' ? "text-sm list-none space-y-2 text-gray-700" : "list-none space-y-1.5 text-[11px]"}>
                            {resume.certifications.map((cert, idx) => (
                                <li key={idx} className={getItemContainerClass(tmpl)}>
                                    <div className={`flex justify-between ${getTitleClass(tmpl)}`}>
                                        <EditableText path={`certifications.${idx}.certificateName`} value={cert.certificateName} />
                                        <span className="font-normal text-gray-500 text-[10px]">
                                            <EditableText path={`certifications.${idx}.issueDate`} value={cert.issueDate} />
                                        </span>
                                    </div>
                                    <div className={getSubtitleClass(tmpl)}>
                                        <EditableText path={`certifications.${idx}.issuingOrganization`} value={cert.issuingOrganization} />
                                    </div>
                                    {cert.credentialId && <div className={getDescClass(tmpl)}>ID: {cert.credentialId}</div>}
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
                                        <EditableText path={`achievements.${idx}.achievementName`} value={ach.achievementName} />
                                        <span className="font-normal text-gray-500 text-[10px]">
                                            <EditableText path={`achievements.${idx}.date`} value={ach.date} />
                                        </span>
                                    </div>
                                    <div className={getSubtitleClass(tmpl)}>
                                        <EditableText path={`achievements.${idx}.organization`} value={ach.organization} />
                                    </div>
                                    <div className={getDescClass(tmpl)}>
                                        {renderList(ach.description, `achievements.${idx}.description`)}
                                    </div>
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
    let containerClass = "bg-white overflow-hidden shadow-xl mx-auto text-gray-900";
    if (resume.template === 'Modern Professional') {
        containerClass += " flex"; // Add flex for 2 columns
    } else {
        containerClass += " relative"; 
    }
    
    // Add custom design options
    const customStyle = { width: '210mm' }; // A4 dimensions
    if (resume.template === 'Modern Professional') {
        customStyle.minHeight = '297mm';
    } else {
        customStyle.height = '297mm'; // fixed height for auto-scaling
    }
    if(resume.design?.fontFamily) customStyle.fontFamily = resume.design.fontFamily;

    const defaultOrder = ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements'];
    const activeOrder = (resume.sectionOrder && resume.sectionOrder.length > 0) ? resume.sectionOrder : defaultOrder;

    if (resume.template === 'Modern Professional') {
        return (
            <div ref={containerRef} className={containerClass} style={customStyle} onClick={() => onFocusSection('personalInfo')}>
                {/* Left Column */}
                <div className="w-[35%] bg-gray-800 text-white p-6 shrink-0">
                    <div className="text-center mb-8">
                        <div className="w-32 h-32 bg-gray-600 rounded-full mx-auto mb-4 overflow-hidden border-2 border-gray-500">
                            {resume.personalInfo?.profilePhoto && (
                                <img src={resume.personalInfo.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                            )}
                        </div>
                        <h2 className="text-xl font-bold uppercase tracking-wider mb-2">Contact</h2>
                        <div className="w-full h-px bg-gray-600 mb-4"></div>
                        <div className="text-sm space-y-3 text-left">
                            <EditableText tag="div" path="personalInfo.phone" value={resume.personalInfo?.phone} placeholder="Phone" />
                            <EditableText tag="div" path="personalInfo.email" value={resume.personalInfo?.email} placeholder="Email" isLink={true} href={`mailto:${resume.personalInfo?.email}`} />
                            <EditableText tag="div" path="personalInfo.location" value={resume.personalInfo?.location} placeholder="Location" />
                            <EditableText tag="div" path="personalInfo.linkedin" value={resume.personalInfo?.linkedin} placeholder="LinkedIn" isLink={true} href={resume.personalInfo?.linkedin?.startsWith('http') ? resume.personalInfo?.linkedin : `https://${resume.personalInfo?.linkedin}`} />
                            <EditableText tag="div" path="personalInfo.portfolioUrl" value={resume.personalInfo?.portfolioUrl} placeholder="Portfolio/GitHub" isLink={true} href={resume.personalInfo?.portfolioUrl?.startsWith('http') ? resume.personalInfo?.portfolioUrl : `https://${resume.personalInfo?.portfolioUrl}`} />
                        </div>
                    </div>
                    
                    {(resume.skills && (resume.skills.technical?.length > 0 || resume.skills.programmingLanguages?.length > 0 || resume.skills.frameworks?.length > 0 || resume.skills.databases?.length > 0 || resume.skills.tools?.length > 0 || resume.skills.softSkills?.length > 0)) && (
                        <div className="mb-8" onClick={() => onFocusSection('skills')}>
                            <h2 className="text-xl font-bold uppercase tracking-wider mb-2 text-center">Skills</h2>
                            <div className="w-full h-px bg-gray-600 mb-4"></div>
                            <div className="text-sm space-y-3 text-left">
                                {resume.skills.programmingLanguages?.length > 0 && (
                                    <div><span className="font-bold text-gray-400 block mb-1">Languages</span> {resume.skills.programmingLanguages.join(', ')}</div>
                                )}
                                {resume.skills.frameworks?.length > 0 && (
                                    <div><span className="font-bold text-gray-400 block mb-1">Frameworks</span> {resume.skills.frameworks.join(', ')}</div>
                                )}
                                {resume.skills.technical?.length > 0 && (
                                    <div><span className="font-bold text-gray-400 block mb-1">Technical</span> {resume.skills.technical.join(', ')}</div>
                                )}
                                {resume.skills.databases?.length > 0 && (
                                    <div><span className="font-bold text-gray-400 block mb-1">Databases</span> {resume.skills.databases.join(', ')}</div>
                                )}
                                {resume.skills.tools?.length > 0 && (
                                    <div><span className="font-bold text-gray-400 block mb-1">Tools</span> {resume.skills.tools.join(', ')}</div>
                                )}
                                {resume.skills.softSkills?.length > 0 && (
                                    <div><span className="font-bold text-gray-400 block mb-1">Soft Skills</span> {resume.skills.softSkills.join(', ')}</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {/* Right Column */}
                <div className="w-[65%] p-8 bg-white text-gray-800 flex flex-col">
                    <EditableText 
                        tag="h1" 
                        path="personalInfo.fullName" 
                        value={resume.personalInfo?.fullName} 
                        placeholder="Your Name"
                        className="text-4xl font-bold text-blue-600 uppercase mb-1"
                    />
                    <EditableText 
                        tag="h2" 
                        path="personalInfo.professionalTitle" 
                        value={resume.personalInfo?.professionalTitle} 
                        placeholder="Professional Title"
                        className="text-xl font-medium tracking-widest text-gray-500 mb-6 uppercase"
                    />
                    {renderDynamicSections(activeOrder.filter(s => s !== 'skills'))}
                </div>
            </div>
        );
    }

    let innerClass = "w-full";
    if (resume.template === 'ATS Classic') {
        innerClass += " px-14 py-10"; // Approx 0.6-0.75 inch margins
    } else {
        innerClass += " p-8";
    }

    return (
        <div ref={containerRef} className={containerClass} style={customStyle} onClick={() => onFocusSection('personalInfo')}>
            <div ref={contentRef} className={innerClass} style={{ transform: `scale(${activeScale})`, transformOrigin: 'top center', width: '100%' }}>
                {/* Header based on Template */}
                <div className={`text-center ${resume.template === 'Tech Professional' ? 'text-left border-b border-gray-200 pb-4 mb-6' : 'mb-6'}`}>
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
                    
                    {resume.template === 'ATS Classic' ? (
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
