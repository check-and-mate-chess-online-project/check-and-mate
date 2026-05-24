export function skinImageSrc(image: string | null | undefined): string {
  if (!image) return ''
  if (image.startsWith('/') || image.startsWith('http')) return image
  return `data:image/webp;base64,${image}`
}
