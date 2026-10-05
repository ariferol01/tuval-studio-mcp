import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateRetroMoviePoster() {
  console.log('🎬 Starting Retro Movie Poster Design via Tuval MCP Bridge...');

  const transport = new StdioClientTransport({
    command: 'node',
    args: [path.join(__dirname, 'index.js')]
  });

  const client = new Client(
    { name: 'tuval-retro-movie-poster-designer', version: '1.0.0' },
    { capabilities: {} }
  );

  await client.connect(transport);
  console.log('✅ Connected to Tuval MCP Bridge! Sending design commands to browser canvas...');

  const designActions = [
    // 1. Clear & Set Canvas to 1080x1620 (Authentic 2:3 Movie Poster Ratio)
    { action: 'canvas_clear' },
    {
      action: 'canvas_set_dimensions',
      params: { width: 1080, height: 1620, backgroundColor: '#07080E', isTransparent: false }
    },
    {
      action: 'project_set_title',
      params: { title: 'CHRONO DRIFT: 1984 — Retro Movie Poster' }
    },

    // 2. Vintage Outer Film Border
    {
      action: 'shape_add',
      params: {
        id: 'poster_frame_outer',
        shapeType: 'rect',
        x: 540,
        y: 810,
        width: 1000,
        height: 1540,
        fillColor: 'transparent',
        strokeColor: '#D4AF37',
        strokeWidth: 2
      }
    },
    {
      action: 'shape_add',
      params: {
        id: 'poster_frame_inner',
        shapeType: 'rect',
        x: 540,
        y: 810,
        width: 980,
        height: 1520,
        fillColor: 'transparent',
        strokeColor: 'rgba(212, 175, 55, 0.35)',
        strokeWidth: 1
      }
    },

    // 3. Studio / Production Header
    {
      action: 'text_add',
      params: {
        id: 'studio_pres',
        text: 'ASTRAL PICTURES PRESENTS  ·  AN ARTIFACT 70MM PRESENTATION',
        fontSize: 16,
        fontWeight: '700',
        color: '#D4AF37',
        x: 540,
        y: 110,
        fontFamily: 'Inter',
        charSpacing: 180
      }
    },

    // 4. Laurel / Award Badge (Official Selection)
    {
      action: 'shape_add',
      params: {
        id: 'award_pill',
        shapeType: 'rrect',
        x: 540,
        y: 180,
        width: 480,
        height: 44,
        cornerRadius: 22,
        fillColor: '#121422',
        strokeColor: '#D4AF37',
        strokeWidth: 1.5
      }
    },
    {
      action: 'text_add',
      params: {
        id: 'award_text',
        text: '✦ WINNER — BEST SCI-FI CINEMATOGRAPHY · TRIBECA 1984 ✦',
        fontSize: 13,
        fontWeight: '800',
        color: '#FFD700',
        x: 540,
        y: 180,
        fontFamily: 'Sora',
        charSpacing: 60
      }
    },

    // 5. Star Rating
    {
      action: 'text_add',
      params: {
        id: 'star_critics',
        text: '★★★★★  "A VISUAL REVOLUTION OF HYPNOTIC POWER"  — FILM DISPATCH',
        fontSize: 14,
        fontWeight: '600',
        color: '#A0AEC0',
        x: 540,
        y: 245,
        fontFamily: 'Inter',
        charSpacing: 80
      }
    },

    // 6. Retro Cyber Sun Graphic (Multi-layered Geometric Sphere)
    {
      action: 'shape_add',
      params: {
        id: 'retro_sun_glow',
        shapeType: 'circle',
        x: 540,
        y: 560,
        width: 420,
        height: 420,
        fillColor: '#FF2E63'
      }
    },
    {
      action: 'shape_add',
      params: {
        id: 'retro_sun_inner',
        shapeType: 'circle',
        x: 540,
        y: 560,
        width: 350,
        height: 350,
        fillColor: '#FF9900'
      }
    },
    {
      action: 'shape_add',
      params: {
        id: 'retro_sun_core',
        shapeType: 'circle',
        x: 540,
        y: 560,
        width: 270,
        height: 270,
        fillColor: '#FFD700'
      }
    },

    // 7. Horizontal Retro Grid / Sun Slits
    {
      action: 'shape_add',
      params: {
        id: 'sun_slit_1',
        shapeType: 'rect',
        x: 540,
        y: 580,
        width: 440,
        height: 8,
        fillColor: '#07080E'
      }
    },
    {
      action: 'shape_add',
      params: {
        id: 'sun_slit_2',
        shapeType: 'rect',
        x: 540,
        y: 610,
        width: 420,
        height: 12,
        fillColor: '#07080E'
      }
    },
    {
      action: 'shape_add',
      params: {
        id: 'sun_slit_3',
        shapeType: 'rect',
        x: 540,
        y: 645,
        width: 390,
        height: 16,
        fillColor: '#07080E'
      }
    },
    {
      action: 'shape_add',
      params: {
        id: 'sun_slit_4',
        shapeType: 'rect',
        x: 540,
        y: 685,
        width: 340,
        height: 20,
        fillColor: '#07080E'
      }
    },

    // 8. Lead Actor Headings
    {
      action: 'text_add',
      params: {
        id: 'cast_names',
        text: 'VALERIE VANCE   ·   LEO MERCER   ·   KAIREN VOX',
        fontSize: 22,
        fontWeight: '800',
        color: '#E2E8F0',
        x: 540,
        y: 770,
        fontFamily: 'Sora',
        charSpacing: 140
      }
    },

    // 9. Provocative Film Tagline
    {
      action: 'text_add',
      params: {
        id: 'tagline_text',
        text: 'TIME IS NOT A LINE. IT IS A MAZE.',
        fontSize: 20,
        fontWeight: '700',
        color: '#00F5D4',
        x: 540,
        y: 830,
        fontFamily: 'Inter',
        charSpacing: 220
      }
    },

    // 10. Main Movie Title (Classic Heavy Retro Display Typography)
    {
      action: 'text_add',
      params: {
        id: 'movie_title_shadow',
        text: 'CHRONO DRIFT',
        fontSize: 104,
        fontWeight: '900',
        color: '#800020',
        x: 544,
        y: 934,
        fontFamily: 'Sora',
        charSpacing: 60
      }
    },
    {
      action: 'text_add',
      params: {
        id: 'movie_title_main',
        text: 'CHRONO DRIFT',
        fontSize: 104,
        fontWeight: '900',
        color: '#FFFFFF',
        x: 540,
        y: 930,
        fontFamily: 'Sora',
        charSpacing: 60
      }
    },

    // 11. Subtitle & Genre Year
    {
      action: 'text_add',
      params: {
        id: 'sub_year',
        text: 'THE 1984 ODYSSEY INTO SYNTHETIC REALITY',
        fontSize: 21,
        fontWeight: '800',
        color: '#FF6B6B',
        x: 540,
        y: 1015,
        fontFamily: 'Inter',
        charSpacing: 160
      }
    },

    // 12. Decorative Neon Dividers
    {
      action: 'shape_add',
      params: {
        id: 'divider_left',
        shapeType: 'rect',
        x: 280,
        y: 1070,
        width: 320,
        height: 3,
        fillColor: '#00F5D4'
      }
    },
    {
      action: 'shape_add',
      params: {
        id: 'divider_center_gem',
        shapeType: 'diamond',
        x: 540,
        y: 1070,
        width: 22,
        height: 22,
        fillColor: '#FFD700'
      }
    },
    {
      action: 'shape_add',
      params: {
        id: 'divider_right',
        shapeType: 'rect',
        x: 800,
        y: 1070,
        width: 320,
        height: 3,
        fillColor: '#00F5D4'
      }
    },

    // 13. Authentic Cinema Credits / Billing Block
    {
      action: 'text_add',
      params: {
        id: 'credits_block_1',
        text: 'DIRECTED BY ELENA VORONA   PRODUCED BY KAIROS ENTERTAINMENT & NEXUS FILMS\nORIGINAL SYNTHESIZER SOUNDTRACK BY VOX SEQUENCER   DIRECTOR OF PHOTOGRAPHY MAX STERLING\nEDITED BY JULIAN REED   PRODUCTION DESIGNER TARA HAWTHORNE   COSTUME DESIGN CLAUDIA RICCI',
        fontSize: 13,
        fontWeight: '600',
        color: '#8A94A6',
        x: 540,
        y: 1160,
        fontFamily: 'Inter',
        lineHeight: 1.5,
        charSpacing: 70
      }
    },
    {
      action: 'text_add',
      params: {
        id: 'credits_block_2',
        text: 'EXECUTIVE PRODUCERS MARCUS THORNE & ARTHUR PENNINGTON   BASED ON THE NOVEL BY SILAS VANCE\nDISTRIBUTED WORLDWIDE BY METROPOLIS CINEMATICS   DOLBY STEREO IN SELECTED THEATRES',
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        x: 540,
        y: 1250,
        fontFamily: 'Inter',
        lineHeight: 1.5,
        charSpacing: 60
      }
    },

    // 14. Age Rating & Sound Badges
    {
      action: 'shape_add',
      params: {
        id: 'rating_box',
        shapeType: 'rrect',
        x: 360,
        y: 1340,
        width: 140,
        height: 48,
        cornerRadius: 8,
        fillColor: '#121422',
        strokeColor: '#D4AF37',
        strokeWidth: 1.5
      }
    },
    {
      action: 'text_add',
      params: {
        id: 'rating_text',
        text: 'PG-13',
        fontSize: 20,
        fontWeight: '900',
        color: '#FFD700',
        x: 360,
        y: 1340,
        fontFamily: 'Sora'
      }
    },

    {
      action: 'shape_add',
      params: {
        id: 'sound_box',
        shapeType: 'rrect',
        x: 540,
        y: 1340,
        width: 170,
        height: 48,
        cornerRadius: 8,
        fillColor: '#121422',
        strokeColor: '#00F5D4',
        strokeWidth: 1.5
      }
    },
    {
      action: 'text_add',
      params: {
        id: 'sound_text',
        text: 'DOLBY STEREO',
        fontSize: 14,
        fontWeight: '800',
        color: '#00F5D4',
        x: 540,
        y: 1340,
        fontFamily: 'Sora',
        charSpacing: 30
      }
    },

    {
      action: 'shape_add',
      params: {
        id: 'format_box',
        shapeType: 'rrect',
        x: 720,
        y: 1340,
        width: 140,
        height: 48,
        cornerRadius: 8,
        fillColor: '#121422',
        strokeColor: '#FF2E63',
        strokeWidth: 1.5
      }
    },
    {
      action: 'text_add',
      params: {
        id: 'format_text',
        text: '70MM IMAX',
        fontSize: 14,
        fontWeight: '800',
        color: '#FF2E63',
        x: 720,
        y: 1340,
        fontFamily: 'Sora',
        charSpacing: 30
      }
    },

    // 15. Grand Release Date Banner at the Bottom
    {
      action: 'shape_add',
      params: {
        id: 'release_bar',
        shapeType: 'rrect',
        x: 540,
        y: 1450,
        width: 860,
        height: 70,
        cornerRadius: 16,
        fillColor: '#FF2E63',
        strokeColor: '#FFD700',
        strokeWidth: 2
      }
    },
    {
      action: 'text_add',
      params: {
        id: 'release_text',
        text: 'IN THEATRES & SELECT 70MM CINEMAS WORLDWIDE · THIS OCTOBER',
        fontSize: 18,
        fontWeight: '900',
        color: '#FFFFFF',
        x: 540,
        y: 1450,
        fontFamily: 'Sora',
        charSpacing: 80
      }
    }
  ];

  console.log(`Sending batch of ${designActions.length} design actions to browser...`);

  const response = await client.callTool({
    name: 'studio_batch_actions',
    arguments: { actions: designActions }
  });

  console.log('\n🎉 Retro Movie Poster Design Completed!');
  console.log('Server response summary:');
  console.log(response.content.find(c => c.type === 'text')?.text || 'Design applied successfully');

  // Save preview snapshot if returned
  const imageItem = response.content.find(c => c.type === 'image');
  if (imageItem && imageItem.data) {
    const outPath = path.join(__dirname, 'retro-movie-poster-preview.png');
    fs.writeFileSync(outPath, Buffer.from(imageItem.data, 'base64'));
    console.log(`📸 High-Res Design Screenshot Saved: ${outPath}`);
  }

  await client.close();
  process.exit(0);
}

generateRetroMoviePoster().catch((err) => {
  console.error('❌ Poster design execution error:', err);
  process.exit(1);
});
