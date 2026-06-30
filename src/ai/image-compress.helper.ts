// src/ai/image-compress.helper.ts

import sharp from 'sharp';

/**
 * Rasmni AI'ga yuborishdan oldin siqadi:
 * - Eng katta tomoni 1200px dan oshmaydi (kattaroq rasm tokenni oshiradi, aniqlikka deyarli ta'sir qilmaydi)
 * - JPEG formatga o'tkazadi, sifat 80% (matn o'qish uchun yetarli, hajm kichik)
 *
 * Bu Gemini API xarajatini sezilarli kamaytiradi, chunki rasm tokenlari
 * piksel o'lchamiga proporsional hisoblanadi.
 */
export async function compressImageForAi(
    buffer: Buffer,
): Promise<{ buffer: Buffer; mimeType: string }> {
    const compressed = await sharp(buffer)
        .resize(1200, 1200, {
            fit: 'inside', // nisbatni saqlab, faqat katta bo'lsa kichraytiradi
            withoutEnlargement: true, // kichik rasmni kattalashtirmaydi
        })
        .jpeg({ quality: 80 })
        .toBuffer();

    return { buffer: compressed, mimeType: 'image/jpeg' };
}