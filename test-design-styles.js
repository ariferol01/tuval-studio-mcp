import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testDesignStyles() {
  console.log('Testing Design Styles, Patterns, and Bento Grid Templates...');
  
  const transport = new StdioClientTransport({
    command: 'node',
    args: [path.join(__dirname, 'index.js')]
  });

  const client = new Client({
    name: 'test-styles-client',
    version: '1.0.0'
  }, { capabilities: {} });

  await client.connect(transport);
  console.log('Connected to MCP!');

  // 1. List Templates
  const tplResp = await client.callTool({
    name: 'templates_list',
    arguments: {}
  });
  console.log('\n--- TEMPLATES CATALOG ---');
  console.log(tplResp.content[0].text);

  // 2. List Patterns
  const patResp = await client.callTool({
    name: 'assets_list_patterns',
    arguments: {}
  });
  console.log('\n--- PATTERNS CATALOG ---');
  console.log(patResp.content[0].text);

  // 3. Load Bento Grid Template
  console.log('\nLoading Bento Grid Template...');
  const loadResp = await client.callTool({
    name: 'canvas_load_template',
    arguments: { templateId: 'bento-product-showcase' }
  });
  console.log('Bento Template Loaded successfully!');

  // 4. Test Pattern Background Application
  console.log('\nApplying Circuit Board Pattern Background...');
  await client.callTool({
    name: 'canvas_set_pattern',
    arguments: { patternKey: 'circuit', bgColor: '#090B10' }
  });
  console.log('Pattern applied successfully!');

  await client.close();
  console.log('\nAll Design Styles & Patterns tested successfully!');
  process.exit(0);
}

testDesignStyles().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
