const fs = require('fs');
const path = require('path');

// Create placeholder files for testing
function createPlaceholderFiles() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const imagesDir = path.join(uploadsDir, 'images');
  const videosDir = path.join(uploadsDir, 'videos');

  // Create directories if they don't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }

  // Create placeholder image files (simple HTML files that display as images)
  const placeholderImages = [
    'placeholder-violation-1.jpg',
    'placeholder-violation-3.jpg',
    'placeholder-violation-5.jpg',
    'placeholder-violation-6.jpg'
  ];

  placeholderImages.forEach(filename => {
    const filePath = path.join(imagesDir, filename);
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${filename}</title>
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .placeholder {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
        }
        .icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        .description {
            color: #666;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="placeholder">
        <div class="icon">📸</div>
        <div class="title">Traffic Violation Photo</div>
        <div class="description">
            This is a placeholder image for ${filename.replace('.jpg', '')}.<br>
            In a real scenario, this would be an actual photo of the traffic violation.
        </div>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(filePath, htmlContent);
    console.log(`Created placeholder image: ${filename}`);
  });

  // Create placeholder video files (simple HTML files that display as videos)
  const placeholderVideos = [
    'placeholder-violation-2.mp4',
    'placeholder-violation-4.mp4',
    'placeholder-violation-7.mp4'
  ];

  placeholderVideos.forEach(filename => {
    const filePath = path.join(videosDir, filename);
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${filename}</title>
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(45deg, #000, #333);
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            color: white;
        }
        .placeholder {
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
            text-align: center;
            max-width: 400px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .description {
            opacity: 0.8;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="placeholder">
        <div class="icon">🎥</div>
        <div class="title">Traffic Violation Video</div>
        <div class="description">
            This is a placeholder video for ${filename.replace('.mp4', '')}.<br>
            In a real scenario, this would be an actual video recording of the traffic violation.
        </div>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(filePath, htmlContent);
    console.log(`Created placeholder video: ${filename}`);
  });

  console.log('\nPlaceholder files created successfully!');
  console.log('Note: These are HTML files that simulate images/videos for testing purposes.');
  console.log('In production, you would upload actual image and video files.');
}

createPlaceholderFiles();
