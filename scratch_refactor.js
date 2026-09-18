const fs = require('fs');
let content = fs.readFileSync('client/src/components/ResumeCanvas.jsx', 'utf8');
let scratch = fs.readFileSync('client/src/components/scratch_refactor.jsx', 'utf8');

const startMarker = "    // Styling logic similar to PDF generator";
const endMarker = "    // Fallback simple view\n    return (\n        <div className=\"p-8 bg-white h-full overflow-auto\">\n             <h3>Template not fully supported in interactive mode yet. Use sidebar to edit.</h3>\n        </div>\n    );\n};";

let startIdx = content.indexOf(startMarker);
let endIdx = content.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
    endIdx += endMarker.length;
    
    const newContent = content.substring(0, startIdx) + scratch + "\n" + content.substring(endIdx);
    fs.writeFileSync('client/src/components/ResumeCanvas.jsx', newContent);
    console.log("Success");
} else {
    console.log("Failed to find markers", startIdx, endIdx);
}
