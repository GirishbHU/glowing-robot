const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../answerKeys.csv');
const jsonPath = path.join(__dirname, '../resources/js/lib/answer-keys.json');

try {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split(/\r?\n/);

    // Headers: Level,LevelName,Focus,QuestionID,Type,Gleams,Alicorns,Stakeholder,Question,Grade1,Grade2,Grade3,Grade4,Grade5

    const result = {};

    let processedCount = 0;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV split by comma, respecting quotes if present (though observed layout suggests simple commas)
        // Since we saw some ambiguity, let's use a regex that handles quoted fields just in case
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        // Actually, a robust split is better.
        // Let's stick to a simple split because the file viewing showed no quotes for text fields but text didn't have commas.
        // If there ARE commas in text, this simple split will break.
        // Let's write a smarter splitter or try to detect quotes.

        // Custom CSV parser line
        const parts = [];
        let current = '';
        let inQuotes = false;
        for (let char of line) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                parts.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        parts.push(current.trim());

        // We expect at least 14 columns
        if (parts.length < 14) continue;

        const level = parts[0];       // L0
        const levelName = parts[1];   // Conception (Spark)
        const focus = parts[2];       // Resilience
        const qId = parts[3];         // D1
        const type = parts[4];        // Dimension
        const gleams = parseFloat(parts[5]); // 10
        const alicorns = parseFloat(parts[6]); // 0.1
        const stakeholder = parts[7]; // Startup (Founder)
        const questionText = parts[8]; // Question
        const grade1 = parts[9];
        const grade2 = parts[10];
        const grade3 = parts[11];
        const grade4 = parts[12];
        const grade5 = parts[13];

        // normalize quotes removal if present
        const clean = (s) => s ? s.replace(/^"|"$/g, '') : '';

        const sHolder = clean(stakeholder);

        if (!result[level]) {
            result[level] = {
                levelName: clean(levelName),
                focus: clean(focus),
                questions: {}
            };
        }

        if (!result[level].questions[qId]) {
            result[level].questions[qId] = {
                type: clean(type),
                gleams: gleams,
                alicorns: alicorns,
                stakeholders: {}
            };
        }

        result[level].questions[qId].stakeholders[sHolder] = {
            question: clean(questionText),
            grades: {
                "1": clean(grade1),
                "2": clean(grade2),
                "3": clean(grade3),
                "4": clean(grade4),
                "5": clean(grade5)
            }
        };

        processedCount++;
    }

    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
    console.log(`Successfully converted ${processedCount} rows to JSON.`);
    console.log(`Saved to ${jsonPath}`);

} catch (err) {
    console.error('Error processing CSV:', err);
    process.exit(1);
}
