/**
 * Direct script to regenerate reference lessons
 * Run with: npx ts-node scripts/regenerate-lessons-direct.ts
 */

import fs from 'fs';
import path from 'path';

const referenceImages = [
  { file: 'jenston.jpeg', name: 'Portrait Study' },
  { file: 'study10-1.jpg', name: 'Still Life Study' },
  { file: '3.jpg', name: 'Landscape Study' }
];

async function main() {
  console.log('📋 Instructions to regenerate reference lessons:\n');
  console.log('Since the lessons require AI generation with proper auth, please follow these steps:\n');

  console.log('1. Log into the dashboard at http://localhost:3000');
  console.log('2. For each reference image, upload it and generate a lesson');
  console.log('3. Copy the generated lesson data from the network tab (coaching-session response)');
  console.log('4. Update lib/reference-lessons.ts with the new format\n');

  console.log('Reference images to regenerate:');
  referenceImages.forEach((img, i) => {
    const imagePath = path.join(process.cwd(), 'public', img.file);
    const exists = fs.existsSync(imagePath);
    console.log(`  ${i + 1}. ${img.file} (${img.name}) ${exists ? '✅' : '❌ NOT FOUND'}`);
  });

  console.log('\n---OR---\n');
  console.log('Use the browser console to call the API directly:');
  console.log(`
const regenerateLesson = async (imageFile) => {
  const response = await fetch(\`/\${imageFile}\`);
  const blob = await response.blob();
  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64 = reader.result;
    const apiResponse = await fetch('/api/coaching-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: base64,
        medium: 'Acrylic',
        skillLevel: 'beginner'
      })
    });
    const result = await apiResponse.json();
    console.log('Result for', imageFile, ':', result);
  };
  reader.readAsDataURL(blob);
};

// Run for each image:
await regenerateLesson('jenston.jpeg');
await regenerateLesson('study10-1.jpg');
await regenerateLesson('3.jpg');
  `);
}

main();
