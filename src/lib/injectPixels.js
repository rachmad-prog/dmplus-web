// Menyuntikkan script tracking (Meta Pixel, Google Ads/GTM, TikTok Pixel)
// ke <head> berdasarkan ID yang disimpan admin lewat dashboard.
// Dipanggil sekali di App.jsx setelah fetch /api/pixels.
//
// PENTING: script dibuat lewat document.createElement("script"), BUKAN lewat
// innerHTML. Tag <script> yang dibuat dari innerHTML tidak pernah dieksekusi
// browser (ditandai "already started"), jadi kalau kita pakai innerHTML,
// tag-nya akan muncul di DOM tapi kodenya tidak pernah jalan sama sekali —
// itulah yang membuat pixel "tidak ditemukan" walau ID sudah benar.

function injectInlineScript(id, code) {
  if (document.getElementById(id)) return; // hindari duplikasi
  const script = document.createElement("script");
  script.id = id;
  script.text = code;
  document.head.appendChild(script);
}

function injectExternalScript(id, src, attrs = {}) {
  if (document.getElementById(id)) return; // hindari duplikasi
  const script = document.createElement("script");
  script.id = id;
  script.src = src;
  script.async = true;
  Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v));
  document.head.appendChild(script);
}

export function injectPixels(settings) {
  if (!settings) return;

  // ---- Meta (Facebook) Pixel ----
  if (settings.metaPixelId) {
    injectInlineScript(
      "meta-pixel",
      `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
        document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${settings.metaPixelId}');
        fbq('track', 'PageView');`
    );
  }

  // ---- Google Tag Manager (opsional, kalau diisi) ----
  if (settings.gtmContainerId) {
    injectInlineScript(
      "gtm-script",
      `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${settings.gtmContainerId}');`
    );
  }

  // ---- Google Ads / GA4 (gtag.js) ----
  if (settings.googleAdsId) {
    injectExternalScript(
      "gtag-loader",
      `https://www.googletagmanager.com/gtag/js?id=${settings.googleAdsId}`
    );
    injectInlineScript(
      "gtag-init",
      `window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${settings.googleAdsId}');`
    );
  }

  // ---- TikTok Pixel ----
  if (settings.tiktokPixelId) {
    injectInlineScript(
      "tiktok-pixel",
      `!function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${settings.tiktokPixelId}');
          ttq.page();
        }(window, document, 'ttq');`
    );
  }
}

// Helper untuk fire event konversi (dipanggil saat order berhasil dibuat / dibayar)
export function trackEvent(eventName, params = {}) {
  if (window.fbq) window.fbq("track", eventName, params);
  if (window.ttq) window.ttq.track(eventName, params);
  if (window.gtag) window.gtag("event", eventName, params);
}
