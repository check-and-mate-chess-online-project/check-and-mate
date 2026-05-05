// бэк отдаёт image как base64 (byte[] → JSON), мок отдаёт URL пути
// helper маскирует разницу
export function skinImageSrc(image: string): string {
  if (image.startsWith('/') || image.startsWith('http')) return image
  return `data:image/webp;base64,${image}`
}
