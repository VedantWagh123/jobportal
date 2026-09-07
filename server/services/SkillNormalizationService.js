import SkillKnowledgeGraph from '../utils/SkillKnowledgeGraph.js';

class SkillNormalizationService {
    static ALIASES = {
        "reactjs": "react",
        "react.js": "react",
        "react js": "react",
        "nodejs": "node.js",
        "node js": "node.js",
        "node": "node.js",
        "mongodb": "mongodb",
        "mongo db": "mongodb",
        "mongo": "mongodb",
        "js": "javascript",
        "ecmascript": "javascript",
        "ts": "typescript",
        "vuejs": "vue",
        "vue.js": "vue",
        "postgres": "postgresql",
        "aws": "amazon web services",
        "gcp": "google cloud platform",
        "dotnet": ".net",
        "csharp": "c#"
    };

    static cleanSkillString(text) {
        if (!text) return '';
        return text.toLowerCase()
            .trim()
            .replace(/[^a-z0-9+#.]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    static levenshtein(a, b) {
        if(a.length === 0) return b.length; 
        if(b.length === 0) return a.length; 
        const matrix = [];
        for(let i = 0; i <= b.length; i++) matrix[i] = [i];
        for(let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for(let i = 1; i <= b.length; i++){
            for(let j = 1; j <= a.length; j++){
                if(b.charAt(i-1) == a.charAt(j-1)){
                    matrix[i][j] = matrix[i-1][j-1];
                } else {
                    matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, Math.min(matrix[i][j-1] + 1, matrix[i-1][j] + 1));
                }
            }
        }
        return matrix[b.length][a.length];
    }

    static getSimilarity(a, b) {
        const distance = this.levenshtein(a, b);
        const longestLength = Math.max(a.length, b.length);
        if (longestLength === 0) return 1.0;
        return (longestLength - distance) / longestLength;
    }

    static cache = new Map();

    /**
     * Determines the match type and confidence between a required skill and a candidate skill.
     * @returns { matchType: 'EXACT'|'ALIAS'|'FUZZY'|'SEMANTIC'|'MISSING', confidence: Number, matchedSkillName: String }
     */
    static compareSkills(requiredSkill, candidateSkill) {
        const reqClean = this.cleanSkillString(requiredSkill);
        const candClean = this.cleanSkillString(candidateSkill);

        if (!reqClean || !candClean) {
            return { matchType: 'MISSING', confidence: 0, matchedSkillName: null };
        }

        const cacheKey = `${reqClean}|${candClean}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        let result = { matchType: 'MISSING', confidence: 0, matchedSkillName: null };

        // 1. Layer 1 - Exact Match
        if (reqClean === candClean) {
            result = { matchType: 'EXACT', confidence: 1.0, matchedSkillName: candidateSkill };
        } 
        else {
            // 2. Layer 2 - Alias Match
            const reqCanonical = this.ALIASES[reqClean] || reqClean;
            const candCanonical = this.ALIASES[candClean] || candClean;
            if (reqCanonical === candCanonical) {
                result = { matchType: 'ALIAS', confidence: 0.95, matchedSkillName: candidateSkill };
            }
            else {
                // 3. Layer 3 - Fuzzy Match
                const fuzzyScore = this.getSimilarity(reqCanonical, candCanonical);
                if (fuzzyScore >= 0.85) { 
                    result = { matchType: 'FUZZY', confidence: fuzzyScore, matchedSkillName: candidateSkill };
                }
                else {
                    // 4. Layer 4 - Semantic Match
                    const isSemantic = SkillKnowledgeGraph.isSemanticMatch(reqCanonical, candCanonical);
                    if (isSemantic) {
                        result = { matchType: 'SEMANTIC', confidence: 0.50, matchedSkillName: candidateSkill };
                    }
                }
            }
        }

        this.cache.set(cacheKey, result);
        // Prevent unbounded cache growth
        if (this.cache.size > 5000) this.cache.clear();

        return result;
    }
}

export default SkillNormalizationService;
