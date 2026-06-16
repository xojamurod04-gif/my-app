const fs = require('fs');
const path = require('path');

function writeWav(filePath, isChord, durationSec) {
  const sampleRate = 44100;
  const numChannels = 1;
  const bitsPerSample = 16;
  const numSamples = sampleRate * durationSec;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = numSamples * blockAlign;
  const chunkSize = 36 + dataSize;
  
  const buffer = Buffer.alloc(44 + dataSize);
  
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(chunkSize, 4);
  buffer.write('WAVE', 8);
  
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); 
  buffer.writeUInt16LE(1, 20); 
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.max(0, 1 - t / durationSec);
    let sample = 0;
    
    if (isChord) {
      // Milestone: C major chord
      sample = (
        Math.sin(2 * Math.PI * 523.25 * t) +
        Math.sin(2 * Math.PI * 659.25 * t) +
        Math.sin(2 * Math.PI * 783.99 * t)
      ) / 3;
    } else {
      // Check: simple high beep
      sample = Math.sin(2 * Math.PI * 1000 * t);
    }
    
    const intSample = sample * 32767 * 0.5 * envelope;
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }
  
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
}

const dir = path.join(__dirname, 'assets', 'sounds');
fs.mkdirSync(dir, { recursive: true });
writeWav(path.join(dir, 'check.wav'), false, 0.15);
writeWav(path.join(dir, 'milestone.wav'), true, 0.8);
console.log('Audio files generated successfully.');
