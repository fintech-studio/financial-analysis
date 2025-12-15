import React from "react";

export default function ShareExportButtons({
  exportRefId,
  title,
  description,
}: {
  exportRefId: string;
  title: string;
  description?: string;
}) {
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: description, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert("連結已複製到剪貼簿，您可以將連結貼給朋友或分享到社群平台");
      } else {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            `${title} ${url}`
          )}`
        );
      }
    } catch (e) {
      console.error(e);
      alert("分享失敗，請稍後再試或手動複製連結。");
    }
  };

  const handleExportPDF = async () => {
    const el = document.getElementById(exportRefId);
    if (!el) return alert("找不到要匯出的內容");

    try {
      // 動態載入 html2canvas 與 jspdf
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      // 補償：為了預防 SSR 等問題，確保 el 在 client side
      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("psychology_report.pdf");
    } catch (e) {
      // fallback: 使用 print
      console.warn(e);
      if (
        typeof window !== "undefined" &&
        typeof (window as unknown as { print?: () => void }).print ===
          "function"
      ) {
        (window as unknown as { print?: () => void }).print?.();
      } else
        alert(
          "匯出 PDF 失敗，請檢查您的環境或安裝相依套件（html2canvas, jspdf）"
        );
    }
  };

  return (
    <div className="flex items-center justify-center space-x-3">
      <button
        onClick={handleShare}
        className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-md hover:opacity-90"
      >
        分享
      </button>
      <button
        onClick={handleExportPDF}
        className="bg-linear-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-md hover:opacity-90"
      >
        匯出 PDF
      </button>
    </div>
  );
}
