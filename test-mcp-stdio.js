import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runVerticalBannerDesign() {
  console.log('🚀 Connecting to PixelForge Studio via MCP Stdio Transport...');

  const transport = new StdioClientTransport({
    command: 'node',
    args: [path.join(__dirname, 'index.js')]
  });

  const client = new Client(
    { name: 'pixelforge-vertical-banner-agent', version: '1.0.0' },
    { capabilities: {} }
  );

  await client.connect(transport);
  console.log('✅ Connected to MCP Server! Transforming Canvas to Vertical Story Banner (1080x1920) with Neon Sunset Theme...');

  const designResult = await client.callTool({
    name: 'studio_batch_actions',
    arguments: {
      actions: [
        // 1. Clear previous objects & resize canvas to 1080x1920 vertical banner format
        { action: 'canvas_clear' },
        {
          action: 'canvas_set_dimensions',
          params: { width: 1080, height: 1920, backgroundColor: '#0D0B18', isTransparent: false }
        },

        // 2. Large Outer Card with Deep Purple Glass Styling
        {
          action: 'shape_add',
          params: {
            id: 'vertical_card',
            shapeType: 'rrect',
            x: 540,
            y: 960,
            width: 960,
            height: 1800,
            cornerRadius: 44,
            fillColor: '#161329',
            strokeColor: '#342958',
            strokeWidth: 2
          }
        },

        // 3. Neon Crimson Top Badge
        {
          action: 'shape_add',
          params: {
            id: 'top_pill',
            shapeType: 'rrect',
            x: 540,
            y: 240,
            width: 440,
            height: 54,
            cornerRadius: 27,
            fillColor: '#FF2E63'
          }
        },
        {
          action: 'text_add',
          params: {
            id: 'top_pill_text',
            text: '⚡ LIMITED TIME FLASH DEAL',
            fontSize: 18,
            fontWeight: '900',
            color: '#FFFFFF',
            x: 540,
            y: 240,
            fontFamily: 'Sora'
          }
        },

        // 4. Hero Headlines (Gold & Pure White)
        {
          action: 'text_add',
          params: {
            id: 'h_line1',
            text: 'CREATOR',
            fontSize: 110,
            fontWeight: '900',
            color: '#FFC531',
            x: 540,
            y: 420,
            fontFamily: 'Sora',
            charSpacing: 30
          }
        },
        {
          action: 'text_add',
          params: {
            id: 'h_line2',
            text: 'STUDIO PRO',
            fontSize: 96,
            fontWeight: '900',
            color: '#FFFFFF',
            x: 540,
            y: 530,
            fontFamily: 'Sora',
            charSpacing: 25
          }
        },
        {
          action: 'text_add',
          params: {
            id: 'sub_hero',
            text: 'UP TO 70% OFF ALL GRAPHIC TOOLS',
            fontSize: 26,
            fontWeight: '800',
            color: '#00E5FF',
            x: 540,
            y: 630,
            fontFamily: 'Sora',
            charSpacing: 15
          }
        },

        // 5. Center Feature Card
        {
          action: 'shape_add',
          params: {
            id: 'feat_box',
            shapeType: 'rrect',
            x: 540,
            y: 930,
            width: 840,
            height: 420,
            cornerRadius: 32,
            fillColor: '#201A3B',
            strokeColor: '#4A3B7A',
            strokeWidth: 2
          }
        },
        {
          action: 'text_add',
          params: {
            id: 'feat_heading',
            text: 'WHAT YOU GET INSIDE',
            fontSize: 28,
            fontWeight: '900',
            color: '#FF2E63',
            x: 540,
            y: 790,
            fontFamily: 'Sora'
          }
        },
        {
          action: 'text_add',
          params: {
            id: 'feat_item1',
            text: '✦ 500+ Vector Shapes & Typography Presets',
            fontSize: 23,
            fontWeight: '600',
            color: '#EDE8F5',
            x: 540,
            y: 865,
            fontFamily: 'Sora'
          }
        },
        {
          action: 'text_add',
          params: {
            id: 'feat_item2',
            text: '✦ Instant AI Magic Wand Background Eraser',
            fontSize: 23,
            fontWeight: '600',
            color: '#EDE8F5',
            x: 540,
            y: 935,
            fontFamily: 'Sora'
          }
        },
        {
          action: 'text_add',
          params: {
            id: 'feat_item3',
            text: '✦ Autonomous MCP Zero-Cloud Coding Control',
            fontSize: 23,
            fontWeight: '600',
            color: '#EDE8F5',
            x: 540,
            y: 1005,
            fontFamily: 'Sora'
          }
        },
        {
          action: 'text_add',
          params: {
            id: 'feat_item4',
            text: '✦ Lossless 4K PNG / SVG / WebP High-DPI Export',
            fontSize: 23,
            fontWeight: '600',
            color: '#EDE8F5',
            x: 540,
            y: 1075,
            fontFamily: 'Sora'
          }
        },

        // 6. Price Badge Pill
        {
          action: 'shape_add',
          params: {
            id: 'price_pill',
            shapeType: 'rrect',
            x: 540,
            y: 1240,
            width: 360,
            height: 64,
            cornerRadius: 32,
            fillColor: '#6C5CFF'
          }
        },
        {
          action: 'text_add',
          params: {
            id: 'price_text',
            text: 'ONLY $29 • LIFETIME ACCESS',
            fontSize: 20,
            fontWeight: '900',
            color: '#FFFFFF',
            x: 540,
            y: 1240,
            fontFamily: 'Sora'
          }
        },

        // 7. Large Neon CTA Button
        {
          action: 'shape_add',
          params: {
            id: 'cta_box',
            shapeType: 'rrect',
            x: 540,
            y: 1420,
            width: 540,
            height: 92,
            cornerRadius: 30,
            fillColor: '#FF2E63'
          }
        },
        {
          action: 'text_add',
          params: {
            id: 'cta_btn_text',
            text: 'SWIPE UP / GET STARTED →',
            fontSize: 24,
            fontWeight: '900',
            color: '#FFFFFF',
            x: 540,
            y: 1420,
            fontFamily: 'Sora'
          }
        },

        // 8. Decorative Neon Cyan Stars & Accents
        {
          action: 'shape_add',
          params: {
            id: 'star_top_l',
            shapeType: 'star',
            x: 150,
            y: 420,
            spikes: 5,
            outerRadius: 36,
            innerRadius: 18,
            fillColor: '#00E5FF'
          }
        },
        {
          action: 'shape_add',
          params: {
            id: 'star_top_r',
            shapeType: 'star',
            x: 930,
            y: 420,
            spikes: 5,
            outerRadius: 36,
            innerRadius: 18,
            fillColor: '#00E5FF'
          }
        },
        {
          action: 'shape_add',
          params: {
            id: 'star_bot',
            shapeType: 'star',
            x: 540,
            y: 1590,
            spikes: 5,
            outerRadius: 28,
            innerRadius: 14,
            fillColor: '#FFC531'
          }
        },
        {
          action: 'text_add',
          params: {
            id: 'footer_guarantee',
            text: '100% Free Forever • No Account Required • Local Privacy First',
            fontSize: 16,
            fontWeight: '600',
            color: '#76689A',
            x: 540,
            y: 1730,
            fontFamily: 'Sora'
          }
        }
      ]
    }
  });

  console.log('🎉 MCP Vertical Banner Transformation Finished!');

  const imageContent = designResult.content?.find(c => c.type === 'image');
  if (imageContent?.data) {
    const assetsDir = path.resolve(__dirname, '../workspace-assets');
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
    const previewFile = path.join(assetsDir, 'live-vertical-banner-preview.png');
    fs.writeFileSync(previewFile, Buffer.from(imageContent.data, 'base64'));
    console.log(`📸 High-Res Vertical Banner Snapshot saved to:\n   ${previewFile}`);
  }

  const textContent = designResult.content?.find(c => c.type === 'text');
  if (textContent?.text) {
    console.log('\n--- MCP Response Layer Summary ---');
    console.log(textContent.text);
  }

  process.exit(0);
}

runVerticalBannerDesign().catch((err) => {
  console.error('❌ MCP Vertical Banner Execution Error:', err);
  process.exit(1);
});
