import pptxgen from 'pptxgenjs';
import type { Presentation, BrandColors } from '../types/presentation';

export async function exportToPptx(presentation: Presentation, brandColors: BrandColors) {
  const pptx = new pptxgen();

  // Set presentation properties
  pptx.title = presentation.title;
  pptx.layout = 'LAYOUT_16x9';

  presentation.slides.forEach((slide) => {
    const pptSlide = pptx.addSlide();
    
    // Background color
    pptSlide.background = { fill: brandColors.background.replace('#', '') };

    switch (slide.layout) {
      case 'title':
        pptSlide.addText(slide.title, {
          x: '10%', y: '35%', w: '80%', h: '20%',
          fontSize: 44,
          bold: true,
          color: brandColors.primary.replace('#', ''),
          align: 'center',
          fontFace: 'Arial'
        });
        if (slide.subtitle) {
          pptSlide.addText(slide.subtitle, {
            x: '10%', y: '55%', w: '80%', h: '10%',
            fontSize: 24,
            color: '888888',
            align: 'center'
          });
        }
        break;

      case 'titleAndContent':
        pptSlide.addText(slide.title, {
          x: '5%', y: '5%', w: '90%', h: '15%',
          fontSize: 32,
          bold: true,
          color: brandColors.primary.replace('#', '')
        });
        if (slide.bullets) {
          pptSlide.addText(
            slide.bullets.map(b => ({ text: b, options: { bullet: true, margin: 5 } })),
            {
              x: '5%', y: '25%', w: '90%', h: '60%',
              fontSize: 18,
              color: brandColors.text.replace('#', ''),
              valign: 'top'
            }
          );
        }
        break;

      case 'twoColumn':
        pptSlide.addText(slide.title, {
          x: '5%', y: '5%', w: '90%', h: '15%',
          fontSize: 32,
          bold: true,
          color: brandColors.primary.replace('#', '')
        });
        // Left Column
        if (slide.leftColumn) {
          pptSlide.addText(slide.leftColumn.title, {
            x: '5%', y: '25%', w: '42%', h: '10%',
            fontSize: 20,
            bold: true,
            color: brandColors.accent.replace('#', '')
          });
          pptSlide.addText(
            slide.leftColumn.bullets.map(b => ({ text: b, options: { bullet: true } })),
            { x: '5%', y: '35%', w: '42%', h: '50%', fontSize: 16, color: brandColors.text.replace('#', '') }
          );
        }
        // Right Column
        if (slide.rightColumn) {
          pptSlide.addText(slide.rightColumn.title, {
            x: '53%', y: '25%', w: '42%', h: '10%',
            fontSize: 20,
            bold: true,
            color: brandColors.accent.replace('#', '')
          });
          pptSlide.addText(
            slide.rightColumn.bullets.map(b => ({ text: b, options: { bullet: true } })),
            { x: '53%', y: '35%', w: '42%', h: '50%', fontSize: 16, color: brandColors.text.replace('#', '') }
          );
        }
        break;

      case 'chart':
        pptSlide.addText(slide.title, {
          x: '5%', y: '5%', w: '90%', h: '15%',
          fontSize: 32,
          bold: true,
          color: brandColors.primary.replace('#', '')
        });
        if (slide.chart) {
          const labels = slide.chart.data.map(d => d[0]);
          const values = slide.chart.data.map(d => d[1]);
          
          const chartType = slide.chart.type === 'pie' ? pptx.ChartType.pie : 
                           slide.chart.type === 'line' ? pptx.ChartType.line : 
                           pptx.ChartType.bar;

          pptSlide.addChart(chartType, [{ name: slide.chart.title, labels, values }], {
            x: '10%', y: '25%', w: '80%', h: '60%',
            showLegend: true,
            legendPos: 'b'
          });
        }
        break;

      case 'sectionHeader':
        pptSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: brandColors.primary.replace('#', ''), alpha: 10 } });
        pptSlide.addText(slide.title, {
          x: '10%', y: '40%', w: '80%', h: '20%',
          fontSize: 48,
          bold: true,
          color: brandColors.primary.replace('#', ''),
          align: 'left'
        });
        if (slide.subtitle) {
          pptSlide.addText(slide.subtitle, {
            x: '10%', y: '60%', w: '80%', h: '10%',
            fontSize: 24,
            color: '888888',
            align: 'left'
          });
        }
        break;
        
      case 'imageOnly':
        pptSlide.addText(slide.title, {
          x: '5%', y: '80%', w: '90%', h: '15%',
          fontSize: 36,
          bold: true,
          color: 'FFFFFF',
          align: 'center'
        });
        pptSlide.addText("(AI Generated Image Placeholder)", {
          x: '25%', y: '40%', w: '50%', h: '10%',
          fontSize: 20,
          color: '888888',
          align: 'center'
        });
        break;
    }

    // Speaker Notes
    if (slide.notes) {
      pptSlide.notes = slide.notes;
    }
  });

  // Save the presentation
  await pptx.writeFile({ fileName: `${presentation.title.replace(/\s+/g, '_')}.pptx` });
}
