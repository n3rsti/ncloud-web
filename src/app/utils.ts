export function decodeJWT(token: string) {
  let base64Url = token.split('.')[1];
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  let jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

export class FileFormats {
  public static FILES_TO_DISPLAY = [
    'image/jpeg',
    'image/png',
    'image/bmp'
  ];

  public static REGEX_TO_ICON: Record<string, string> = {
    "^audio/*": "file-audio",
    "^text/*": "file-lines",
    "application/pdf": "file-pdf",
    "^video/*": "file-video",
    "application/msword": "file-word",
    "vnd.openxmlformats-officedocument.wordprocessingml": "file-word",
    "vnd.ms-word": "file-word",
    "vnd.ms-excel": "file-excel",
    "vnd.openxmlformats-officedocument.spreadsheetml": "file-excel",
    "application/vnd.ms-powerpoint": "file-powerpoint",
    "json": "file-json",
    "application/zip": "file-zipper",
    "application/x-7z-compressed": "file-zipper",
    "application/x-tar": "file-zipper"
  }

  public static ICON_TO_COLOR: Record<string, string> = {
    "file-pdf": "red-500"
  }
}
