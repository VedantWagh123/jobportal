import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ title, description, type = 'website' }) => {
    return (
        <Helmet>
            <title>{title ? `${title} | Skill India Job Portal` : 'Skill India Job Portal'}</title>
            <meta name="description" content={description || "Find your dream job based on your skills. A platform connecting candidates, employers, and government training institutes."} />
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title ? `${title} | Skill India Job Portal` : 'Skill India Job Portal'} />
            <meta property="og:description" content={description || "Find your dream job based on your skills."} />
            <meta name="twitter:card" content="summary_large_image" />
        </Helmet>
    );
};

export default SEO;
