import SkillNormalizationService from './server/services/SkillNormalizationService.js';

const tests = [
    { req: "React", cand: "React.js", expected: "ALIAS" },
    { req: "NodeJS", cand: "Node.js", expected: "ALIAS" },
    { req: "Mongo DB", cand: "MongoDB", expected: "ALIAS" },
    { req: "React", cand: "Redux", expected: "MISSING" },
    { req: "Python", cand: "Django", expected: "SEMANTIC" },
    { req: "Javascript", cand: "JS", expected: "ALIAS" },
    { req: "AWS", cand: "Amazon Web Services", expected: "ALIAS" }
];

console.log("--- Testing SkillNormalizationService ---");
for (const t of tests) {
    const res = SkillNormalizationService.compareSkills(t.req, t.cand);
    console.log(`Req: ${t.req.padEnd(15)} | Cand: ${t.cand.padEnd(20)} => Got: ${res.matchType.padEnd(10)} | Expected: ${t.expected} | Pass: ${res.matchType === t.expected ? 'YES' : 'NO'} (Conf: ${res.confidence.toFixed(2)})`);
}
