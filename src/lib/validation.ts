export const LIMITS = {
  caption: 500,
  comment: 300,
  bio: 200,
  username: 50,
  imageSize: 5 * 1024 * 1024, // 5MB
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

export function validateCaption(caption: string): string | null {
  if (caption.length > LIMITS.caption) {
    return `Caption tối đa ${LIMITS.caption} ký tự`
  }
  return null
}

export function validateComment(content: string): string | null {
  const trimmed = content.trim()
  if (!trimmed) return 'Nội dung không được trống'
  if (trimmed.length > LIMITS.comment) {
    return `Bình luận tối đa ${LIMITS.comment} ký tự`
  }
  return null
}

export function validateBio(bio: string): string | null {
  if (bio.length > LIMITS.bio) {
    return `Bio tối đa ${LIMITS.bio} ký tự`
  }
  return null
}

export function validateUsername(username: string): string | null {
  const trimmed = username.trim()
  if (trimmed && trimmed.length > LIMITS.username) {
    return `Username tối đa ${LIMITS.username} ký tự`
  }
  if (trimmed && !/^[a-zA-Z0-9_.-]*$/.test(trimmed)) {
    return 'Username chỉ được chứa chữ, số, dấu gạch dưới và dấu chấm'
  }
  return null
}

export function validateImageSize(size: number): string | null {
  if (size > LIMITS.imageSize) {
    return `Ảnh không được quá ${LIMITS.imageSize / 1024 / 1024}MB`
  }
  return null
}

export function validateImageType(type: string): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(type)) {
    return 'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)'
  }
  return null
}

export function validateImage(file: File): string | null {
  const typeError = validateImageType(file.type)
  if (typeError) return typeError
  
  const sizeError = validateImageSize(file.size)
  if (sizeError) return sizeError
  
  return null
}
