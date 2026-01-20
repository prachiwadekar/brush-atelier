#!/usr/bin/env node

/**
 * Script to regenerate pre-generated lessons for reference images
 * Usage: node scripts/regenerate-reference-lessons.js
 */

const fs = require('fs');
const path = require('path');

// Reference images to regenerate lessons for
const referenceImages = [
  { file: 'jenston.jpeg', medium: 'Acrylic', description: 'Portrait Study' },
  { file: 'study10-1.jpg', medium: 'Acrylic', description: 'Still Life Study' },
  { file: '3.jpg', medium: 'Acrylic', description: 'Landscape Study' }
];

async function regenerateLesson(imageFile, medium, description) {
  console.log(`\n🎨 Regenerating lesson for ${imageFile}...`);

  const imagePath = path.join(process.cwd(), 'public', imageFile);

  // Check if image exists
  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Image not found: ${imagePath}`);
    return null;
  }

  // Read image file
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');

  // Determine mime type
  const ext = path.extname(imageFile).toLowerCase();
  const mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';

  // Call the coaching session API
  const response = await fetch('http://localhost:3000/api/coaching-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: `data:${mimeType};base64,${base64Image}`,
      medium: medium,
      skillLevel: 'beginner'
    })
  });

  if (!response.ok) {
    console.error(`❌ API call failed: ${response.status} ${response.statusText}`);
    const errorText = await response.text();
    console.error(errorText);
    return null;
  }

  const result = await response.json();
  console.log(`✅ Lesson generated successfully for ${imageFile}`);

  return {
    imageFile,
    description,
    result
  };
}

async function main() {
  console.log('🚀 Starting reference lesson regeneration...');
  console.log('⚠️  Make sure the dev server is running on http://localhost:3000\n');

  const results = [];

  for (const ref of referenceImages) {
    const result = await regenerateLesson(ref.file, ref.medium, ref.description);
    if (result) {
      results.push(result);
    }

    // Wait a bit between requests to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Save results to a file
  const outputPath = path.join(process.cwd(), 'scripts', 'generated-lessons.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log(`\n✅ Done! Generated ${results.length} lessons`);
  console.log(`📁 Results saved to: ${outputPath}`);
  console.log('\n📝 Next steps:');
  console.log('1. Review the generated lessons in generated-lessons.json');
  console.log('2. Update lib/reference-lessons.ts with the new format');
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
