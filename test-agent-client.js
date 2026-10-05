import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ws = new WebSocket('ws://127.0.0.1:8765');

ws.on('open', () => {
  console.log('🤖 Connected to PixelForge MCP Bridge. Dispatching autonomous AI graphic design commands...');

  const batchDesignPayload = {
    id: 'agent_design_task_' + Date.now(),
    method: 'studio_batch_actions',
    params: {
      actions: [
        // 1. Reset Canvas & Setup 1080x1080 Dark Canvas
        { action: 'canvas_clear' },
        { action: 'canvas_set_dimensions', params: { width: 1080, height: 1080, backgroundColor: '#0B0D14', isTransparent: false } },

        // 2. Base Container Card with subtle border
        {
          action: 'shape_add',
          params: {
            id: 'bg_card',
            shapeType: 'rrect',
            x: 540,
            y: 540,
            width: 960,
            height: 960,
            cornerRadius: 32,
            fillColor: '#121520',
            strokeColor: '#23293D',
            strokeWidth: 2
          }
        },

        // 3. Top Gradient Badge Pill
        {
          action: 'shape_add',
          params: {
            id: 'badge_pill',
            shapeType: 'rrect',
            x: 540,
            y: 190,
            width: 360,
            height: 44,
            cornerRadius: 22,
            fillColor: '#6C5CFF'
          }
        },
        {
          action: 'text_add',
          params: {
            id: 'badge_text',
            text: '✦ AI-POWERED STUDIO ENGINE',
            fontSize: 16,
            fontWeight: '800',
            color: '#FFFFFF',
            x: 540,
            y: 190,
            fontFamily: 'Sora'
          }
        },

        // 4. Headline Typography
        {
          action: 'text_add',
          params: {
            id: 'headline_1',
            text: 'DESIGN AT THE SPEED',
            fontSize: 62,
            fontWeight: '900',
            color: '#F2F4F8',
            x: 540,
            y: 310,
            fontFamily: 'Sora',
            charSpacing: 20
          }
        },
        {
          action: 'text_add',
          params: {
            id: 'headline_2',
            text: 'OF THOUGHT',
            fontSize: 66,
            fontWeight: '900',
            color: '#00C2A8',
            x: 540,
            y: 385,
            fontFamily: 'Sora',
            charSpacing: 30
          }
        },

        // 5. Center Feature Glass Card
        {
          action: 'shape_add',
          params: {
            id: 'feature_card',
            shapeType: 'rrect',
            x: 540,
            y: 575,
            width: 820,
            height: 220,
            cornerRadius: 24,
            fillColor: '#171B2A',
            strokeColor: '#2B344F',
            strokeWidth: 1.5
          }
        },
        {
          action: 'text_add',
          params: {
            id: 'feat_1',
            text: '⚡ 100% Zero-Cloud Local Processing',
            fontSize: 22,
            fontWeight: '700',
            color: '#FFFFFF',
            x: 540,
            y: 520,
            fontFamily: 'Sora'
          }
        },
        {
          action: 'text_add',
          params: {
            id: 'feat_2',
            text: '🤖 Direct Model Context Protocol (MCP) AI Control',
            fontSize: 20,
            fontWeight: '500',
            color: '#A6ADBB',
            x: 540,
            y: 575,
            fontFamily: 'Sora'
          }
        },
        {
          action: 'text_add',
          params: {
            id: 'feat_3',
            text: '🎨 Lossless 4K High-DPI Vector & Raster Export',
            fontSize: 20,
            fontWeight: '500',
            color: '#A6ADBB',
            x: 540,
            y: 630,
            fontFamily: 'Sora'
          }
        },

        // 6. Action Button (CTA)
        {
          action: 'shape_add',
          params: {
            id: 'cta_btn',
            shapeType: 'rrect',
            x: 540,
            y: 770,
            width: 400,
            height: 68,
            cornerRadius: 20,
            fillColor: '#00C2A8'
          }
        },
        {
          action: 'text_add',
          params: {
            id: 'cta_text',
            text: 'START CREATING NOW →',
            fontSize: 22,
            fontWeight: '800',
            color: '#0B0D14',
            x: 540,
            y: 770,
            fontFamily: 'Sora'
          }
        },

        // 7. Decorative Stars & Footer Tag
        {
          action: 'shape_add',
          params: {
            id: 'star_left',
            shapeType: 'star',
            x: 180,
            y: 200,
            spikes: 5,
            outerRadius: 26,
            innerRadius: 13,
            fillColor: '#FFC531'
          }
        },
        {
          action: 'shape_add',
          params: {
            id: 'star_right',
            shapeType: 'star',
            x: 900,
            y: 200,
            spikes: 5,
            outerRadius: 26,
            innerRadius: 13,
            fillColor: '#FFC531'
          }
        },
        {
          action: 'text_add',
          params: {
            id: 'footer_label',
            text: 'Crafted Autonomously via PixelForge MCP Agent Bridge',
            fontSize: 16,
            fontWeight: '600',
            color: '#60687E',
            x: 540,
            y: 915,
            fontFamily: 'Sora'
          }
        }
      ]
    }
  };

  ws.send(JSON.stringify(batchDesignPayload));
});

ws.on('message', (data) => {
  try {
    const res = JSON.parse(data.toString());
    console.log('✅ AI Design executed successfully on canvas!');
    if (res.layerTree) {
      console.log(`📊 Created ${res.layerTree.length} canvas layers.`);
    }

    if (res.snapshot?.base64) {
      const outDir = path.resolve(__dirname, '../workspace-assets');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const imgPath = path.join(outDir, 'mcp-autonomous-design.png');
      fs.writeFileSync(imgPath, Buffer.from(res.snapshot.base64, 'base64'));
      console.log(`🖼️ Visual feedback captured and saved to: ${imgPath}`);
    }

    ws.close();
    process.exit(0);
  } catch (e) {
    console.error('Error parsing response:', e);
    process.exit(1);
  }
});

ws.on('error', (err) => {
  console.error('WebSocket Error:', err.message);
  process.exit(1);
});
