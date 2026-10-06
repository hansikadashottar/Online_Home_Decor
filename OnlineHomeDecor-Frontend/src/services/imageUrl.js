const BACKEND_URL = "http://localhost:8080";

export function getProductImage(imageUrl) {
  if (!imageUrl) {
    return "";
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  // Actual image stored in database
  if (imageUrl.startsWith("/products/")) {
    return `${BACKEND_URL}${imageUrl}`;
  }

  // Old/static product image support
  if (imageUrl.startsWith("/images/products/")) {
    return `${BACKEND_URL}${imageUrl}`;
  }

  return `${BACKEND_URL}/images/products/${imageUrl}`;
}

export function getCategoryImage(imageUrl) {
  if (!imageUrl) {
    return "";
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  // Actual category image stored in database
  if (imageUrl.startsWith("/categories/")) {
    return `${BACKEND_URL}${imageUrl}`;
  }

  // Old/static category image support
  if (imageUrl.startsWith("/images/categories/")) {
    return `${BACKEND_URL}${imageUrl}`;
  }

  return `${BACKEND_URL}/images/categories/${imageUrl}`;
}