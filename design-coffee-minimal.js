import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateCoffeeMinimalAd() {
  console.log('☕ SÂDE Minimalist Kahve Afişi başlıyor via Tuval MCP...');

  const transport = new StdioClientTransport({
    command: 'node',
    args: [path.join(__dirname, 'index.js')]
  });

  const client = new Client(
    { name: 'tuval-coffee-minimal-designer', version: '1.0.0' },
    { capabilities: {} }
  );

  await client.connect(transport);
  console.log('✅ MCP bağlantısı tamam, tasarım gönderiliyor...');

  const actions = [
    { action: 'canvas_clear' },
    {
      action: 'canvas_set_dimensions',
      params: { width: 1080, height: 1350, backgroundColor: '#FAF7F2', isTransparent: false }
    },
    {
      action: 'project_set_title',
      params: { title: 'SÂDE — Minimalist Kahve Kampanyası' }
    },

    // Üst bar etiketleri
    {
      action: 'text_add',
      params: { text: 'N° 04 / SINGLE ORIGIN', fontSize: 13, fontWeight: '700', color: '#1A1512', x: 220, y: 95, fontFamily: 'Inter', charSpacing: 120, align: 'center' }
    },
    {
      action: 'text_add',
      params: { text: 'İSTANBUL · 2026', fontSize: 13, fontWeight: '600', color: '#8A7F75', x: 860, y: 95, fontFamily: 'Inter', charSpacing: 100, align: 'center' }
    },
    // İnce divider
    {
      action: 'shape_add',
      params: { shapeType: 'rect', x: 540, y: 132, width: 920, height: 2, fillColor: '#E8E0D5', opacity: 1 }
    },

    // Marka monogram
    {
      action: 'shape_add',
      params: { shapeType: 'circle', x: 540, y: 212, width: 64, height: 64, fillColor: '#1A1512' }
    },
    {
      action: 'text_add',
      params: { text: 'S', fontSize: 30, fontWeight: '800', color: '#FAF7F2', x: 540, y: 212, fontFamily: 'Sora', align: 'center' }
    },
    {
      action: 'text_add',
      params: { text: 'S Â D E', fontSize: 22, fontWeight: '800', color: '#1A1512', x: 540, y: 268, fontFamily: 'Sora', charSpacing: 300, align: 'center' }
    },
    {
      action: 'text_add',
      params: { text: 'SPECIALTY COFFEE', fontSize: 11, fontWeight: '600', color: '#8A7F75', x: 540, y: 296, fontFamily: 'Inter', charSpacing: 220, align: 'center' }
    },

    // Hero başlık - minimalist manifesto
    {
      action: 'text_add',
      params: { text: 'SADECE', fontSize: 96, fontWeight: '900', color: '#1A1512', x: 540, y: 420, fontFamily: 'Sora', charSpacing: 20, align: 'center' }
    },
    {
      action: 'text_add',
      params: { text: 'KAHVE.', fontSize: 96, fontWeight: '900', color: '#B47A3B', x: 540, y: 520, fontFamily: 'Sora', charSpacing: 20, align: 'center' }
    },
    {
      action: 'text_add',
      params: { text: 'Tek köken. Taze kavrum. Başka hiçbir şey.', fontSize: 17, fontWeight: '500', color: '#8A7F75', x: 540, y: 605, fontFamily: 'Inter', charSpacing: 30, align: 'center' }
    },

    // Orta görsel - bej daire zemin
    {
      action: 'shape_add',
      params: { shapeType: 'circle', x: 540, y: 810, width: 500, height: 500, fillColor: '#EDE6D9' }
    },
    // Kahve fincanı fotoğrafı
    {
      action: 'image_add',
      params: {
        src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80',
        x: 540, y: 810, scaleToWidth: 560, opacity: 1
      }
    },
    // Küçük vurgu noktası
    {
      action: 'shape_add',
      params: { shapeType: 'circle', x: 815, y: 600, width: 18, height: 18, fillColor: '#B47A3B' }
    },

    // Alt bilgi kartı - koyu minimalist
    {
      action: 'shape_add',
      params: { shapeType: 'rrect', x: 540, y: 1130, width: 920, height: 340, cornerRadius: 28, fillColor: '#1A1512' }
    },
    {
      action: 'text_add',
      params: { text: 'YENİ HASAT — ETHIOPIA GUJI', fontSize: 12, fontWeight: '800', color: '#E8C48A', x: 540, y: 1025, fontFamily: 'Sora', charSpacing: 140, align: 'center' }
    },
    {
      action: 'text_add',
      params: { text: 'FİLTRE / ESPRESSO · 250G', fontSize: 30, fontWeight: '900', color: '#FFFFFF', x: 540, y: 1070, fontFamily: 'Sora', charSpacing: 20, align: 'center' }
    },
    {
      action: 'text_add',
      params: { text: 'Yaban mersini • Yasemin • Bal', fontSize: 16, fontWeight: '500', color: '#B8AEA2', x: 540, y: 1110, fontFamily: 'Inter', charSpacing: 40, align: 'center' }
    },
    // CTA buton
    {
      action: 'shape_add',
      params: { shapeType: 'rrect', x: 430, y: 1180, width: 280, height: 62, cornerRadius: 31, fillColor: '#FAF7F2' }
    },
    {
      action: 'text_add',
      params: { text: 'SATIN AL →', fontSize: 15, fontWeight: '800', color: '#1A1512', x: 430, y: 1180, fontFamily: 'Sora', charSpacing: 60, align: 'center' }
    },
    // Fiyat hapı
    {
      action: 'shape_add',
      params: { shapeType: 'rrect', x: 660, y: 1180, width: 160, height: 62, cornerRadius: 31, fillColor: '#1A1512', strokeColor: '#3A332D', strokeWidth: 1.5 }
    },
    {
      action: 'text_add',
      params: { text: '₺485', fontSize: 18, fontWeight: '800', color: '#E8C48A', x: 660, y: 1180, fontFamily: 'Sora', align: 'center' }
    },
    // Footer
    {
      action: 'text_add',
      params: { text: 'WWW.SADE.COFFEE', fontSize: 12, fontWeight: '700', color: '#8A7F75', x: 270, y: 1255, fontFamily: 'Inter', charSpacing: 100, align: 'center' }
    },
    {
      action: 'text_add',
      params: { text: 'AZ ÇOKTUR.', fontSize: 12, fontWeight: '700', color: '#8A7F75', x: 810, y: 1255, fontFamily: 'Inter', charSpacing: 100, align: 'center' }
    }
  ];

  console.log(`Toplam ${actions.length} aksiyon gönderiliyor...`);

  const response = await client.callTool({
    name: 'studio_batch_actions',
    arguments: { actions }
  });

  const textPart = response.content?.find(c => c.type === 'text')?.text || '';
  console.log('\n--- MCP Yanıtı ---');
  console.log(textPart);

  if (textPart.includes('not connected') || textPart.includes('Error')) {
    console.error('\n❌ Tarayıcı bağlı değil. Lütfen http://localhost/graph-tool/editor adresini açın ve tekrar deneyin.');
    await client.close();
    process.exit(2);
  }

  const imageItem = response.content?.find(c => c.type === 'image');
  if (imageItem?.data) {
    const outPath = path.join(__dirname, '../workspace-assets/sade-kahve-minimal-afis.png');
    fs.writeFileSync(outPath, Buffer.from(imageItem.data, 'base64'));
    console.log(`📸 Önizleme kaydedildi: ${outPath}`);
  }

  // Ayrıca export dene
  try {
    const exp = await client.callTool({
      name: 'studio_export_file',
      arguments: { outputPath: 'G:/xampp/htdocs/graph-tool/workspace-assets/sade-kahve-minimal-afis-export.png', format: 'png', scale: 2 }
    });
    console.log(exp.content?.[0]?.text || 'Export tamam');
  } catch (e) {
    console.log('Export atlandı:', e.message);
  }

  await client.close();
  process.exit(0);
}

generateCoffeeMinimalAd().catch((err) => {
  console.error('❌ Hata:', err);
  process.exit(1);
});
