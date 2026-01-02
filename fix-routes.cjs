#!/usr/bin/env node

/**
 * Fix duplicate exports in Wayfinder-generated routes
 * This script runs after wayfinder:generate to remove ONLY known duplicate exports
 */

const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'resources/js/routes');

// Known duplicates to remove (keep first occurrence only)
const KNOWN_DUPLICATES = {
    'password/index.ts': ['confirm'],
    'verification/index.ts': ['notice', 'verify']
};

function fixDuplicateExport(filePath, exportName) {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const exportPattern = new RegExp(`^\\s*export const ${exportName}\\s*=`);
    const occurrences = [];
    
    // Find all occurrences
    lines.forEach((line, index) => {
        if (exportPattern.test(line)) {
            occurrences.push(index);
        }
    });
    
    if (occurrences.length <= 1) {
        return 0; // No duplicates
    }
    
    console.log(`  Found duplicate: ${exportName} at lines ${occurrences.map(l => l + 1).join(', ')}`);
    
    // Remove all but the first occurrence
    const linesToRemove = new Set();
    let removedCount = 0;
    
    for (let i = 1; i < occurrences.length; i++) {
        const startLine = occurrences[i];
        let endLine = startLine;
        let braceDepth = 0;
        let inExport = false;
        
        // Find where this export ends
        for (let j = startLine; j < lines.length; j++) {
            const line = lines[j];
            
            if (j === startLine) {
                inExport = true;
            }
            
            if (inExport) {
                linesToRemove.add(j);
                
                // Count braces to find end
                for (const char of line) {
                    if (char === '(' || char === '{') braceDepth++;
                    if (char === ')' || char === '}') braceDepth--;
                }
                
                // Export ends when we close all braces and hit semicolon or closing paren
                if (braceDepth <= 0 && (line.includes(');') || line.includes('});'))) {
                    endLine = j;
                    removedCount += (endLine - startLine + 1);
                    break;
                }
            }
        }
    }
    
    // Remove the duplicate lines
    if (linesToRemove.size > 0) {
        const cleanedLines = lines.filter((_, index) => !linesToRemove.has(index));
        fs.writeFileSync(filePath, cleanedLines.join('\n'));
        console.log(`  ✓ Removed ${removedCount} lines`);
        return removedCount;
    }
    
    return 0;
}

function processRoutes() {
    if (!fs.existsSync(routesDir)) {
        console.log('Routes directory not found, skipping...');
        return;
    }
    
    console.log('Fixing Wayfinder route duplicates...\n');
    
    let totalFixed = 0;
    let totalLinesRemoved = 0;
    
    for (const [relativePath, duplicateExports] of Object.entries(KNOWN_DUPLICATES)) {
        const filePath = path.join(routesDir, relativePath);
        
        if (!fs.existsSync(filePath)) {
            console.log(`Skipping ${relativePath} (not found)`);
            continue;
        }
        
        console.log(`Checking ${relativePath}...`);
        
        for (const exportName of duplicateExports) {
            const removed = fixDuplicateExport(filePath, exportName);
            if (removed > 0) {
                totalFixed++;
                totalLinesRemoved += removed;
            }
        }
    }
    
    if (totalFixed > 0) {
        console.log(`\n✓ Fixed ${totalFixed} duplicate exports (removed ${totalLinesRemoved} lines total)`);
    } else {
        console.log('\n✓ No duplicate exports found');
    }
}

processRoutes();
