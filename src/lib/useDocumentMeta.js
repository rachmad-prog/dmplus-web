import { useEffect } from "react";

/**
 * Set title & meta description halaman secara dinamis (client-side).
 * Otomatis mengembalikan title default pas komponen di-unmount (pindah halaman),
 * supaya nggak "nyangkut" ke halaman lain.
 *
 * Catatan: karena ini SPA (client-side rendered), perubahan ini tidak
 * terlihat oleh Googlebot untuk halaman yang di-block robots.txt
 * (/checkout, /status). Ini murni untuk UX tab browser & link preview
 * (WhatsApp/social share), bukan untuk ranking SEO halaman tsb.
 */
export function useDocumentMeta(title, description) {
  useEffect(() => {
    const prevTitle = document.title;
    const metaTag = document.querySelector('meta[name="description"]');
    const prevDescription = metaTag?.getAttribute("content");

    if (title) document.title = title;
    if (description && metaTag) metaTag.setAttribute("content", description);

    return () => {
      document.title = prevTitle;
      if (metaTag && prevDescription != null) metaTag.setAttribute("content", prevDescription);
    };
  }, [title, description]);
}
