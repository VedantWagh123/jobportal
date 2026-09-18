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
                        <ul className={tmpl === 'Modern Professional' ? "text-sm list-disc pl-5 space-y-2 text-gray-700" : "list-none space-y-0.5 text-[11px]"}>
                            {resume.certifications.map((cert, idx) => (
                                <li key={idx} className="font-bold">
                                    <EditableText path={`certifications.${idx}`} value={cert} />
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
                        <ul className={tmpl === 'Modern Professional' ? "text-sm list-disc pl-5 space-y-2 text-gray-700" : "list-none space-y-0.5 text-[11px]"}>
                            {resume.achievements.map((ach, idx) => (
                                <li key={idx}>
                                    <EditableText path={`achievements.${idx}`} value={ach} />
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
        containerClass += " p-8"; // Padding for standard templates
    }
    
    // Add custom design options
    const customStyle = { width: '210mm', minHeight: '297mm' }; // A4 dimensions
    if(resume.design?.fontFamily) customStyle.fontFamily = resume.design.fontFamily;

    const defaultOrder = ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements'];
    const activeOrder = (resume.sectionOrder && resume.sectionOrder.length > 0) ? resume.sectionOrder : defaultOrder;

    const content = (
        <div ref={containerRef} className={containerClass} style={{...customStyle, transform: `scale(${activeScale})`, transformOrigin: 'top center'}} onClick={() => !isMagnifier && onFocusSection('personalInfo')}>
            {resume.template === 'Modern Professional' ? (
                <>
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
                                <EditableText tag="div" path="personalInfo.email" value={resume.personalInfo?.email} placeholder="Email" />
                                <EditableText tag="div" path="personalInfo.location" value={resume.personalInfo?.location} placeholder="Location" />
                                <EditableText tag="div" path="personalInfo.linkedin" value={resume.personalInfo?.linkedin} placeholder="LinkedIn" />
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
                    <div ref={contentRef} className="w-[65%] p-8 bg-white text-gray-800 flex flex-col">
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
                </>
            ) : (
                <div ref={contentRef} className="w-full">
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
                        {resume.template !== 'ATS Classic' && resume.personalInfo?.professionalTitle && (
                            <EditableText 
                                tag="h2" 
                                path="personalInfo.professionalTitle" 
                                value={resume.personalInfo?.professionalTitle} 
                                placeholder="Professional Title"
                                className="text-[13px] text-gray-500 uppercase tracking-widest mb-3"
                            />
                        )}
                        <div className={`text-[11px] flex flex-wrap gap-2 text-gray-600 ${resume.template === 'Tech Professional' ? 'justify-start' : 'justify-center'}`}>
                            <EditableText path="personalInfo.email" value={resume.personalInfo?.email} placeholder="Email" />
                            {resume.personalInfo?.phone && <span>|</span>}
                            <EditableText path="personalInfo.phone" value={resume.personalInfo?.phone} placeholder="Phone" />
                            {resume.personalInfo?.location && <span>|</span>}
                            <EditableText path="personalInfo.location" value={resume.personalInfo?.location} placeholder="Location" />
                            {resume.personalInfo?.linkedin && <span>|</span>}
                            <EditableText path="personalInfo.linkedin" value={resume.personalInfo?.linkedin} placeholder="LinkedIn" />
                        </div>
                    </div>
                    {renderDynamicSections(activeOrder)}
                </div>
            )}
        </div>
    );

    return isMagnifier ? content : (
        <div className="flex justify-center p-4 h-full">
            {content}
        </div>
    );
};
