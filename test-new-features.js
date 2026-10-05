import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testNewFeatures() {
  console.log('Testing new MCP features (Gradients, SVG Stickers, Project Title)...');
  
  const transport = new StdioClientTransport({
    command: 'node',
    args: [path.join(__dirname, 'index.js')]
  });

  const client = new Client({
    name: 'test-features-client',
    version: '1.0.0'
  }, { capabilities: {} });

  await client.connect(transport);
  console.log('Connected to MCP!');

  // 1. Rename Project
  await client.callTool({
    name: 'project_set_title',
    arguments: { title: 'Cyberpunk Neon Launch 2026' }
  });

  // 2. Set Canvas Gradient Background
  await client.callTool({
    name: 'canvas_set_gradient',
    arguments: { preset: 'cyber', angle: 135 }
  });

  // 3. Add Verified Badge SVG
  await client.callTool({
    name: 'svg_add',
    arguments: {
      key: 'verified-badge',
      x: 540,
      y: 180,
      scale: 1.4
    }
  });

  // 4. Add Sparkle Star Sticker
  await client.callTool({
    name: 'sticker_add',
    arguments: {
      key: 'sparkle-star',
      x: 880,
      y: 350,
      scale: 1.2
    }
  });

  // 5. List stickers
  const stickersList = await client.callTool({
    name: 'assets_list_stickers',
    arguments: {}
  });
  console.log('Stickers List output:', stickersList.content[0].text);

  console.log('All new features tested successfully!');
  await client.close();
  process.exit(0);
}

testNewFeatures().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
