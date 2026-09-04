import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';

const AdminCourseSkills = () => {
    const { backendUrl, adminToken } = useContext(AdminContext);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/government-admin/course-skills`, {
                    headers: { token: adminToken }
                });
                if (data.success) setSkills(data.courseSkills);
            } catch (error) {
                toast.error('Failed to fetch course skills');
            } finally {
                setLoading(false);
            }
        };
        fetchSkills();
    }, [adminToken, backendUrl]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Course Skill Mappings</h1>
                    <p className="text-sm text-gray-500 mt-1">Map supply curriculum to skill ontology</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                <th className="py-4 px-6">Course</th>
                                <th className="py-4 px-6">Skill</th>
                                <th className="py-4 px-6">Proficiency</th>
                                <th className="py-4 px-6">Module</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {skills.length === 0 ? (
                                <tr><td colSpan="4" className="py-8 text-center text-gray-500">No skill mappings found</td></tr>
                            ) : (
                                skills.map(s => (
                                    <tr key={s._id} className="hover:bg-gray-50 transition">
                                        <td className="py-4 px-6 font-medium text-gray-900">{s.courseId?.name || 'Unknown'}</td>
                                        <td className="py-4 px-6 text-blue-600">{s.skillId?.name || 'Unknown'}</td>
                                        <td className="py-4 px-6 text-gray-600">{s.proficiencyTaught}</td>
                                        <td className="py-4 px-6 text-gray-500">{s.moduleName || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminCourseSkills;
