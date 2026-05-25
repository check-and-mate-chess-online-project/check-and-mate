export function skinImageSrc(image: string | null | undefined): string {
  if (!image) return ''
  if (image.startsWith('/') || image.startsWith('http')) return image
  if (image.startsWith('PHN2') || image.startsWith('PD94')) {
    return `data:image/svg+xml;base64,${image}`
  }
  return `data:image/webp;base64,${image}`
}
