import React from 'react';
import AILearningRecommendations from '../components/AILearningRecommendations';

const Upskilling = () => {
    return (
        <div className="container px-4 2xl:px-20 mx-auto my-10">
            <h1 className="text-3xl font-bold mb-4">Upskilling Hub</h1>
            <p className="text-gray-600 mb-8 max-w-2xl">
                Stay ahead of the curve. Our AI constantly analyzes the job market to identify skill shortages. Take these highly-demanded courses to boost your career prospects.
            </p>
            <AILearningRecommendations />
        </div>
    );
};

export default Upskilling;
