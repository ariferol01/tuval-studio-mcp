import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateMinimalistAdPoster() {
  console.log('🏛️ Starting Minimalist Modern Art Advertisement Poster Design via Tuval MCP Bridge...');

  const transport = new StdioClientTransport({
    command: 'node',
    args: [path.join(__dirname, 'index.js')]
  });

  const client = new Client(
    { name: 'tuval-minimalist-ad-designer', version: '1.0.0' },
    { capabilities: {} }
  );

  await client.connect(transport);
  console.log('✅ Connected to Tuval MCP! Sending minimalist modern art advertisement actions...');

  const designActions = [
    // 1. Reset Canvas & Set Dimensions to 1080x1350 (4:5 Modern Art / Social Portrait format)
    { action: 'canvas_clear' },
    {
      action: 'canvas_set_dimensions',
      params: { width: 1080, height: 1350, backgroundColor: '#0B0C10', isTransparent: false }
    },
    {
      action: 'project_set_title',
      params: { title: 'KROMA — Minimalist Modern Art Biennale Poster' }
    },

    // 2. High-Resolution Modern Minimalist Architecture Background Image
    {
      action: 'image_add',
      params: {
        id: 'bg_architecture_art',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
        name: 'Modern Art Spatial Architecture',
        x: 540,
        y: 675,
        width: 1080,
        height: 1350,
        opacity: 0.85
      }
    },

    // 3. Elegant Dark Gradient Vignette Overlay for Crisp Contrast
    {
      action: 'shape_add',
      params: {
        id: 'vignette_overlay',
        shapeType: 'rect',
        x: 540,
        y: 675,
        width: 1080,
        height: 1350,
        fillColor: '#07080A',
        opacity: 0.45
      }
    },

    // 4. Fine Minimalist Outer Passepartout Border (Swiss Gallery Framing)
    {
      action: 'shape_add',
      params: {
        id: 'gallery_border',
        shapeType: 'rect',
        x: 540,
        y: 675,
        width: 980,
        height: 1250,
        fillColor: 'transparent',
        strokeColor: 'rgba(255, 255, 255, 0.4)',
        strokeWidth: 1.5
      }
    },

    // 5. Top Left Series Tag & Issue Number
    {
      action: 'text_add',
      params: {
        id: 'top_issue_tag',
        text: 'N° 08  /  CONTEMPORARY SPACES',
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
        x: 230,
        y: 110,
        fontFamily: 'Inter',
        charSpacing: 120
      }
    },

    // 6. Top Right Gallery Coordinates
    {
      action: 'text_add',
      params: {
        id: 'top_coordinates',
        text: '47°33\'N · BASEL  ·  ZÜRICH',
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.75)',
        x: 850,
        y: 110,
        fontFamily: 'Inter',
        charSpacing: 80
      }
    },

    // 7. Minimalist Brand Monogram Badge
    {
      action: 'shape_add',
      params: {
        id: 'brand_monogram_bg',
        shapeType: 'circle',
        x: 540,
        y: 190,
        width: 58,
        height: 58,
        fillColor: 'rgba(255, 255, 255, 0.12)',
        strokeColor: 'rgba(255, 255, 255, 0.35)',
        strokeWidth: 1
      }
    },
    {
      action: 'text_add',
      params: {
        id: 'brand_monogram_text',
        text: 'K',
        fontSize: 26,
        fontWeight: '800',
        color: '#FFFFFF',
        x: 540,
        y: 190,
        fontFamily: 'Sora'
      }
    },

    // 8. Brand Name with Ultra-Wide Letter Spacing
    {
      action: 'text_add',
      params: {
        id: 'brand_name',
        text: 'K R O M A',
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
        x: 540,
        y: 245,
        fontFamily: 'Sora',
        charSpacing: 320
      }
    },
    {
      action: 'text_add',
      params: {
        id: 'brand_sub',
        text: 'ATELIER DE DESIGN & ARCHITECTURE',
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.65)',
        x: 540,
        y: 275,
        fontFamily: 'Inter',
        charSpacing: 200
      }
    },

    // 9. Modernist Art Headline Block (Centered High-Contrast Display)
    {
      action: 'text_add',
      params: {
        id: 'hero_line_1',
        text: 'SILENCE',
        fontSize: 84,
        fontWeight: '900',
        color: '#FFFFFF',
        x: 540,
        y: 400,
        fontFamily: 'Sora',
        charSpacing: 60
      }
    },
    {
      action: 'text_add',
      params: {
        id: 'hero_line_2',
        text: 'IN FORM',
        fontSize: 84,
        fontWeight: '900',
        color: '#00C2A8',
        x: 540,
        y: 495,
        fontFamily: 'Sora',
        charSpacing: 60
      }
    },
    {
      action: 'text_add',
      params: {
        id: 'hero_line_3',
        text: '& LIGHT.',
        fontSize: 84,
        fontWeight: '900',
        color: '#FFC531',
        x: 540,
        y: 590,
        fontFamily: 'Sora',
        charSpacing: 60
      }
    },

    // 10. Curatorial Manifesto Description (Centered, Balanced)
    {
      action: 'text_add',
      params: {
        id: 'manifesto_text',
        text: 'An exclusive international curation of sculptural minimalism,\nmonolithic forms, and organic geometry for visionary spaces.',
        fontSize: 15,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.88)',
        x: 540,
        y: 690,
        fontFamily: 'Inter',
        lineHeight: 1.6,
        charSpacing: 20
      }
    },

    // 11. Glassmorphism Information & CTA Container Card
    {
      action: 'shape_add',
      params: {
        id: 'frosted_cta_card',
        shapeType: 'rrect',
        x: 540,
        y: 990,
        width: 860,
        height: 380,
        cornerRadius: 24,
        fillColor: 'rgba(15, 17, 24, 0.90)',
        strokeColor: 'rgba(255, 255, 255, 0.20)',
        strokeWidth: 1.5
      }
    },

    // 12. Exhibition Dates & Details in Card
    {
      action: 'text_add',
      params: {
        id: 'card_season_tag',
        text: 'ANNUAL BIENNALE 2026',
        fontSize: 12,
        fontWeight: '800',
        color: '#00C2A8',
        x: 540,
        y: 860,
        fontFamily: 'Sora',
        charSpacing: 140
      }
    },
    {
      action: 'text_add',
      params: {
        id: 'card_dates_title',
        text: 'OCTOBER 18 — DECEMBER 05',
        fontSize: 24,
        fontWeight: '900',
        color: '#FFFFFF',
        x: 540,
        y: 905,
        fontFamily: 'Sora',
        charSpacing: 40
      }
    },
    {
      action: 'text_add',
      params: {
        id: 'card_venue',
        text: 'KUNSTHALLE MODERNE · PAVILION IV · BASEL',
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
        x: 540,
        y: 950,
        fontFamily: 'Inter',
        charSpacing: 60
      }
    },

    // 13. Action CTA Button
    {
      action: 'shape_add',
      params: {
        id: 'btn_reserve_bg',
        shapeType: 'rrect',
        x: 390,
        y: 1040,
        width: 280,
        height: 54,
        cornerRadius: 27,
        fillColor: '#6C5CFF'
      }
    },
    {
      action: 'text_add',
      params: {
        id: 'btn_reserve_text',
        text: 'BOOK VIEWING →',
        fontSize: 13,
        fontWeight: '800',
        color: '#FFFFFF',
        x: 390,
        y: 1040,
        fontFamily: 'Sora',
        charSpacing: 60
      }
    },

    // 14. VIP Pass / Limited Entry Badge
    {
      action: 'shape_add',
      params: {
        id: 'limited_pill_bg',
        shapeType: 'rrect',
        x: 680,
        y: 1040,
        width: 240,
        height: 54,
        cornerRadius: 27,
        fillColor: 'rgba(255, 255, 255, 0.08)',
        strokeColor: 'rgba(255, 255, 255, 0.25)',
        strokeWidth: 1
      }
    },
    {
      action: 'text_add',
      params: {
        id: 'limited_pill_text',
        text: 'LIMITED TO 250 PASSES',
        fontSize: 11.5,
        fontWeight: '700',
        color: '#00C2A8',
        x: 680,
        y: 1040,
        fontFamily: 'Sora',
        charSpacing: 80
      }
    },

    // 15. Minimalist Bottom Footer Bar
    {
      action: 'text_add',
      params: {
        id: 'web_domain',
        text: 'WWW.KROMA-BIENNALE.CH',
        fontSize: 11.5,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.75)',
        x: 260,
        y: 1130,
        fontFamily: 'Inter',
        charSpacing: 100
      }
    },
    {
      action: 'text_add',
      params: {
        id: 'barcode_num',
        text: 'REF #KM-2026-ARCH-IX',
        fontSize: 11.5,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.65)',
        x: 820,
        y: 1130,
        fontFamily: 'JetBrains Mono',
        charSpacing: 80
      }
    }
  ];

  console.log(`Sending batch of ${designActions.length} minimalist modern art actions to browser...`);

  const response = await client.callTool({
    name: 'studio_batch_actions',
    arguments: { actions: designActions }
  });

  console.log('\n🎉 Minimalist Modern Art Advertisement Poster Completed!');
  console.log('Server response summary:');
  console.log(response.content.find(c => c.type === 'text')?.text || 'Design applied successfully');

  // Save preview snapshot if returned
  const imageItem = response.content.find(c => c.type === 'image');
  if (imageItem && imageItem.data) {
    const outPath = path.join(__dirname, 'minimalist-ad-poster-preview.png');
    fs.writeFileSync(outPath, Buffer.from(imageItem.data, 'base64'));
    console.log(`📸 High-Res Design Screenshot Saved: ${outPath}`);
  }

  await client.close();
  process.exit(0);
}

generateMinimalistAdPoster().catch((err) => {
  console.error('❌ Minimalist Ad Poster execution error:', err);
  process.exit(1);
});
