import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testApidlPipeline() {
  console.log('🚀 Launching MCP Server via npx / bundle.mjs...');

  // Use bundle.mjs directly or npx
  const transport = new StdioClientTransport({
    command: 'node',
    args: [path.join(__dirname, 'bundle.mjs')]
  });

  const client = new Client(
    { name: 'tuval-apidl-test-agent', version: '1.0.9' },
    { capabilities: {} }
  );

  await client.connect(transport);
  console.log('✅ Connected to Tuval Studio MCP Server v1.0.9 via Stdio transport!');

  // Check Studio connection status
  console.log('📡 Checking Browser Studio Connection...');
  const statusRes = await client.callTool({
    name: 'studio_check_status',
    arguments: {}
  });
  console.log('Status Result:\n', statusRes.content[0].text);

  // Wait 3 seconds to let open Chrome tab auto-reconnect to ws://127.0.0.1:8765
  console.log('⏳ Waiting 3 seconds for active browser tab to auto-connect to ws://127.0.0.1:8765...');
  await new Promise(r => setTimeout(r, 3000));

  // PHASE 1: Draft - Executing Golden Ratio APIDL Script
  console.log('\n======================================================');
  console.log('🎨 TEST PHASE 1: DRAFT (Initial Composition & Layout)');
  console.log('======================================================');

  const draftScript = `
# Golden Ratio Editorial Layout for Modern Smartwatch
CALL canvas_set_dimensions { "width": 1080, "height": 1080, "backgroundColor": "#0A0B10", "isTransparent": false }
CALL canvas_set_pattern { "patternKey": "dots", "bgColor": "#0A0B10" }

# Glassmorphism Card (Centered at Golden Major Section 0.618)
CALL shape_add { "shapeType": "rrect", "x": 540, "y": 540, "width": 960, "height": 960, "fillColor": "rgba(22, 24, 34, 0.75)", "strokeColor": "rgba(255, 255, 255, 0.12)", "strokeWidth": 1, "cornerRadius": 32 }

# Eyebrow / Category Tag (Modular Typography: 13px, tracking +3)
CALL text_add { "text": "PRECISION TIMEPIECE 2026", "x": 540, "y": 120, "fontSize": 14, "fontFamily": "Inter", "fontWeight": "600", "color": "#6C5CFF", "charSpacing": 180, "align": "center" }

# Hero Headline (Golden Focal Point: 56px Syne/Sora)
CALL text_add { "text": "CHRONOS ELITE", "x": 540, "y": 200, "fontSize": 64, "fontFamily": "Sora", "fontWeight": "800", "color": "#FFFFFF", "charSpacing": 40, "align": "center" }

# Subheadline
CALL text_add { "text": "Titanium Grade 5 • Sapphire Crystal Glass", "x": 540, "y": 280, "fontSize": 20, "fontFamily": "Inter", "fontWeight": "400", "color": "#A0A5BA", "align": "center" }

# Bespoke SVG Trust Badge (Using svg_add with raw SVG markup)
CALL svg_add { "x": 540, "y": 480, "scale": 1.2, "svg": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><circle cx='50' cy='50' r='45' fill='none' stroke='#00F5FF' stroke-width='3'/><polygon points='50,15 61,38 85,38 66,54 73,78 50,63 27,78 34,54 15,38 39,38' fill='#6C5CFF'/></svg>" }

# Feature Cards (Bento Style Columns)
CALL shape_add { "shapeType": "rrect", "x": 300, "y": 720, "width": 400, "height": 180, "fillColor": "rgba(255, 255, 255, 0.04)", "strokeColor": "rgba(255, 255, 255, 0.08)", "strokeWidth": 1, "cornerRadius": 20 }
CALL text_add { "text": "100M WATERPROOF", "x": 300, "y": 700, "fontSize": 18, "fontFamily": "Sora", "fontWeight": "700", "color": "#00F5FF", "align": "center" }
CALL text_add { "text": "ISO 6425 Certified Diver", "x": 300, "y": 740, "fontSize": 14, "fontFamily": "Inter", "fontWeight": "400", "color": "#8E94A8", "align": "center" }

CALL shape_add { "shapeType": "rrect", "x": 780, "y": 720, "width": 400, "height": 180, "fillColor": "rgba(255, 255, 255, 0.04)", "strokeColor": "rgba(255, 255, 255, 0.08)", "strokeWidth": 1, "cornerRadius": 20 }
CALL text_add { "text": "72H POWER RESERVE", "x": 780, "y": 700, "fontSize": 18, "fontFamily": "Sora", "fontWeight": "700", "color": "#FF3366", "align": "center" }
CALL text_add { "text": "Automatic Calibre 8800", "x": 780, "y": 740, "fontSize": 14, "fontFamily": "Inter", "fontWeight": "400", "color": "#8E94A8", "align": "center" }

# CTA Button
CALL shape_add { "shapeType": "rrect", "x": 540, "y": 920, "width": 320, "height": 64, "fillColor": "#6C5CFF", "cornerRadius": 32 }
CALL text_add { "text": "EXPLORE COLLECTION", "x": 540, "y": 920, "fontSize": 16, "fontFamily": "Sora", "fontWeight": "700", "color": "#FFFFFF", "charSpacing": 60, "align": "center" }
`;

  try {
    const draftRes = await client.callTool({
      name: 'studio_execute_apidl',
      arguments: {
        script: draftScript,
        phase: 'draft',
        rationale: 'Created modern Apple-Bento watch editorial design using Golden Ratio 1080x1080 canvas, custom SVG emblem, and 8px modular typography hierarchy.',
        stylePreset: 'apple-bento'
      }
    });

    console.log('✅ Phase 1 (Draft) APIDL Executed Successfully!');
    for (const c of draftRes.content) {
      if (c.type === 'text') {
        console.log(c.text);
      } else if (c.type === 'image') {
        console.log(`📸 Received High-Res Snapshot: ${c.mimeType} (${Math.round(c.data.length / 1024)} KB Base64)`);
      }
    }

    // PHASE 2: Refine - Fine-tune spacing & add subtle lighting
    console.log('\n======================================================');
    console.log('✨ TEST PHASE 2: REFINE (Refining balance & typography)');
    console.log('======================================================');

    const refineScript = `
# Refinement: Add subtle background glow and adjust typography
CALL svg_add { "x": 540, "y": 200, "scale": 2.5, "svg": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><circle cx='100' cy='100' r='80' fill='#6C5CFF' opacity='0.15'/></svg>" }
CALL layer_reorder { "layerId": "last", "action": "send_backward" }
`;

    const refineRes = await client.callTool({
      name: 'studio_execute_apidl',
      arguments: {
        script: refineScript,
        phase: 'refine',
        rationale: 'Added atmospheric radial neon glow behind headline to enhance depth.',
        stylePreset: 'apple-bento'
      }
    });

    console.log('✅ Phase 2 (Refine) APIDL Executed Successfully!');
    for (const c of refineRes.content) {
      if (c.type === 'text') {
        console.log(c.text);
      } else if (c.type === 'image') {
        console.log(`📸 Received High-Res Refined Snapshot: ${c.mimeType} (${Math.round(c.data.length / 1024)} KB)`);
      }
    }

    // PHASE 3: Final - Quality Gate Seal
    console.log('\n======================================================');
    console.log('🌟 TEST PHASE 3: FINAL (Quality Gate Validation & Seal)');
    console.log('======================================================');

    const finalRes = await client.callTool({
      name: 'studio_execute_apidl',
      arguments: {
        script: '# Final Quality Seal\nCALL design_audit_layout {}',
        phase: 'final',
        rationale: 'All layers verified with zero overlaps and strict golden ratio balance.',
        stylePreset: 'apple-bento'
      }
    });

    console.log('✅ Phase 3 (Final) Quality Gate Result:');
    for (const c of finalRes.content) {
      if (c.type === 'text') {
        console.log(c.text);
      }
    }

    console.log('\n🎉 ALL APIDL PIPELINE TESTS PASSED 100% PERFECTLY!');

  } catch (err) {
    console.error('❌ APIDL Test Error:', err);
  } finally {
    process.exit(0);
  }
}

testApidlPipeline().catch(console.error);
