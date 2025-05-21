const fs = require('fs');
const path = require('path');

// Ensure server data directory exists
const dataDir = path.join(__dirname, 'server', 'data');
if (!fs.existsSync(dataDir)) {
  console.log(`Creating data directory: ${dataDir}`);
  fs.mkdirSync(dataDir, { recursive: true });
}

// Copy mortgage data files from public to server/data
const sourceDir = path.join(__dirname, 'public');
const files = [
  'mortgage_data_10.csv',
  'mortgage_data_15.csv',
  'mortgage_data_20.csv',
  'mortgage_data_25.csv',
  'mortgage_data_30.csv'
];

console.log(`Source directory: ${sourceDir}`);
console.log(`Destination directory: ${dataDir}`);

let successCount = 0;
let errorCount = 0;

files.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const destPath = path.join(dataDir, file);
  
  if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✓ Copied ${file} to server/data`);
      successCount++;
    } catch (error) {
      console.error(`✗ Error copying ${file}: ${error.message}`);
      errorCount++;
    }
  } else {
    console.error(`✗ Source file not found: ${sourcePath}`);
    errorCount++;
  }
});

console.log(`\nMortgage data files copy complete! ${successCount} files copied, ${errorCount} errors.`); 