import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import bgImage from "@/assets/womens-day-bg.jpg";
import logo from "@/assets/maceyrunners-logo.png";
import { toast } from "@/hooks/use-toast";

const WomensDay = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  const drawPoster = (): Promise<HTMLCanvasElement> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const size = 1080;
      canvas.width = size;
      canvas.height = size;

      const bg = new Image();
      bg.crossOrigin = "anonymous";
      bg.onload = () => {
        // Draw background
        ctx.drawImage(bg, 0, 0, size, size);

        // Semi-transparent overlay for text readability at bottom
        const grad = ctx.createLinearGradient(0, size * 0.55, 0, size);
        grad.addColorStop(0, "rgba(48, 0, 60, 0)");
        grad.addColorStop(0.4, "rgba(48, 0, 60, 0.75)");
        grad.addColorStop(1, "rgba(48, 0, 60, 0.92)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, size * 0.55, size, size * 0.45);

        // Message text
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 36px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText("Happy International Women's Day!", size / 2, size * 0.72);

        // Draw logo with soft glow blend
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.onload = () => {
          const logoSize = 100;
          const logoX = size / 2 - logoSize / 2;
          const logoY = size * 0.78;

          // Soft radial glow behind logo
          ctx.save();
          const glow = ctx.createRadialGradient(size / 2, logoY + logoSize / 2, logoSize * 0.3, size / 2, logoY + logoSize / 2, logoSize * 1.2);
          glow.addColorStop(0, "rgba(255, 215, 0, 0.25)");
          glow.addColorStop(0.5, "rgba(128, 0, 128, 0.15)");
          glow.addColorStop(1, "rgba(48, 0, 60, 0)");
          ctx.fillStyle = glow;
          ctx.fillRect(logoX - logoSize, logoY - logoSize * 0.5, logoSize * 4, logoSize * 3);
          ctx.restore();

          // Draw logo with slight transparency to blend
          ctx.globalAlpha = 0.92;
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
          ctx.globalAlpha = 1.0;

          ctx.fillStyle = "#ffd700";
          ctx.font = "bold 18px 'Plus Jakarta Sans', sans-serif";
          ctx.fillText("MaceyRunners Delivery Service", size / 2, logoY + logoSize + 28);

          resolve(canvas);
        };
        logoImg.src = logo;
      };
      bg.src = bgImage;
    });
  };

  const handleDownload = async () => {
    const canvas = await drawPoster();
    const link = document.createElement("a");
    link.download = "MaceyRunners-Womens-Day-2026.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast({ title: "Downloaded!", description: "Poster saved to your device." });
  };

  const handleShare = async () => {
    const canvas = await drawPoster();
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "MaceyRunners-Womens-Day-2026.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "Happy International Women's Day from MaceyRunners!" });
        } catch {
          // user cancelled
        }
      } else {
        // Fallback: download
        handleDownload();
        toast({ title: "Share not supported", description: "The poster has been downloaded instead." });
      }
    }, "image/png");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950 flex flex-col items-center">
      {/* Top bar */}
      <div className="w-full sticky top-0 z-50 bg-purple-950/90 backdrop-blur border-b border-purple-800 px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 text-white hover:bg-purple-800">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleDownload} className="gap-2 bg-yellow-600 hover:bg-yellow-700 text-white">
            <Download className="h-4 w-4" /> Save
          </Button>
          <Button onClick={handleShare} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </div>

      {/* Poster preview */}
      <div className="flex-1 flex items-center justify-center p-4 w-full max-w-lg">
        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/60">
          <img src={bgImage} alt="International Women's Day background" className="w-full" />
          {/* Text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-end"
            style={{ background: "linear-gradient(to bottom, transparent 55%, rgba(48,0,60,0.75) 70%, rgba(48,0,60,0.92) 100%)" }}>
            <div className="text-center px-6 pb-6 space-y-3">
              <p className="text-yellow-400 font-bold text-xl sm:text-2xl drop-shadow-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Happy International Women's Day!
              </p>
              <div className="relative flex flex-col items-center">
                <div className="absolute inset-0 bg-gradient-radial from-yellow-400/20 via-purple-600/10 to-transparent blur-xl rounded-full scale-150" />
                <img src={logo} alt="MaceyRunners Logo" className="h-14 w-auto relative z-10 drop-shadow-lg opacity-90" />
                <p className="text-yellow-400 font-bold text-xs tracking-widest mt-2 relative z-10">MaceyRunners Delivery Service</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvas for export */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default WomensDay;
