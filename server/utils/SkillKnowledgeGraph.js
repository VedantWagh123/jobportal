const skillRelations = {
    "javascript": ["react", "node.js", "express", "angular", "vue", "next.js", "typescript"],
    "python": ["django", "flask", "fastapi", "pandas", "numpy", "machine learning", "data science"],
    "java": ["spring", "spring boot", "hibernate"],
    "c#": [".net", "asp.net"],
    "php": ["laravel", "codeigniter"],
    "frontend": ["html", "css", "javascript", "react", "angular", "vue", "tailwind", "bootstrap", "frontend development"],
    "backend": ["node.js", "python", "java", "ruby", "c#", "go", "sql", "mongodb", "backend development"],
    "database": ["sql", "mysql", "postgresql", "mongodb", "redis", "oracle", "nosql", "databases", "dbms"],
    "devops": ["docker", "kubernetes", "aws", "azure", "gcp", "ci/cd", "jenkins", "terraform"],
    "mobile": ["react native", "flutter", "swift", "kotlin", "android", "ios", "mobile development"]
};

// Map children to parents for faster reverse lookup
const childToParents = {};
for (const [parent, children] of Object.entries(skillRelations)) {
    for (const child of children) {
        if (!childToParents[child]) childToParents[child] = [];
        childToParents[child].push(parent);
    }
}

class SkillKnowledgeGraph {
    static getRelatedSkills(skillName) {
        if (!skillName) return [];
        const normalized = skillName.toLowerCase().trim();
        const related = new Set();
        
        // 1. Add children if it's a parent category
        if (skillRelations[normalized]) {
            skillRelations[normalized].forEach(s => related.add(s));
        }
        
        // 2. Add parents if it's a child
        if (childToParents[normalized]) {
            childToParents[normalized].forEach(s => related.add(s));
        }
        
        // 3. Add siblings (skills sharing the same parent)
        if (childToParents[normalized]) {
            childToParents[normalized].forEach(parent => {
                if (skillRelations[parent]) {
                    skillRelations[parent].forEach(sibling => {
                        if (sibling !== normalized) related.add(sibling);
                    });
                }
            });
        }

        return Array.from(related);
    }

    static isSemanticMatch(requiredSkill, candidateSkill) {
        if (!requiredSkill || !candidateSkill) return false;
        const req = requiredSkill.toLowerCase().trim();
        const cand = candidateSkill.toLowerCase().trim();
        
        const relatedToRequired = this.getRelatedSkills(req);
        return relatedToRequired.includes(cand);
    }
}

export default SkillKnowledgeGraph;
