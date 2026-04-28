export function formatOrderRef(publicId: string) {
  return publicId.replace(/-/g, '').slice(0, 8).toUpperCase();
}
