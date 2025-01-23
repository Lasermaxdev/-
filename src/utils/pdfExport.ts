import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// تهيئة الخط العربي
const arabicFont = new URL('../assets/fonts/NotoNaskhArabic-Regular.ttf', import.meta.url).href;

export async function exportToPDF(
  elementId: string,
  fileName: string = 'تقرير',
  orientation: 'portrait' | 'landscape' = 'portrait'
) {
  try {
    // إنشاء لقطة من العنصر المحدد
    const element = document.getElementById(elementId);
    if (!element) throw new Error('لم يتم العثور على العنصر المحدد');

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
    });

    // إنشاء ملف PDF
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4',
    });

    // إضافة الخط العربي
    pdf.addFont(arabicFont, 'NotoNaskhArabic', 'normal');
    pdf.setFont('NotoNaskhArabic');
    pdf.setR2L(true);

    // حساب الأبعاد
    const imgWidth = orientation === 'portrait' ? 210 : 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // إضافة الصورة إلى PDF
    pdf.addImage(
      canvas.toDataURL('image/jpeg', 1.0),
      'JPEG',
      0,
      0,
      imgWidth,
      imgHeight
    );

    // حفظ الملف
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('خطأ في تصدير PDF:', error);
    throw error;
  }
}