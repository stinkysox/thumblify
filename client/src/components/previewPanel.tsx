import React from "react";
import { Download, Image, Loader2 } from "lucide-react";

// Mock types since they're imported from external file
type AspectRatio = "16:9" | "1:1" | "9:16";
interface IThumbnail {
  image_url?: string;
  title?: string;
}

interface PreviewPanelProps {
  thumbnail: IThumbnail | null;
  isLoading: boolean;
  aspectRatio: AspectRatio;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  thumbnail,
  isLoading,
  aspectRatio,
}) => {
  const aspectClasses = {
    "16:9": "aspect-video",
    "1:1": "aspect-square",
    "9:16": "aspect-[9/16]",
  } as Record<AspectRatio, string>;

  const onDownload = () => {
    if (!thumbnail?.image_url) return;

    // 1. Create the link
    const link = document.createElement("a");

    // 2. Improve Cloudinary attachment logic
    // This ensures "fl_attachment" is added right after "/upload/"
    const downloadUrl = thumbnail.image_url.replace(
      "/upload/",
      "/upload/fl_attachment/"
    );

    link.href = downloadUrl;

    // 3. Set download attribute (suggests a filename to the browser)
    link.setAttribute(
      "download",
      `thumbnail-${thumbnail._id || "download"}.png`
    );

    // 4. Ensure it works cross-origin by opening in a new context if needed
    link.target = "_self";

    // 5. Append, click, and cleanup
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative w-full mx-auto max-w-2xl">
      <div className={`relative overflow-hidden ${aspectClasses[aspectRatio]}`}>
        {/* loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/25">
            <Loader2 className="animate-spin size-8" />
            <p className="text-white">AI is generating your thumbnail...</p>
            <p className="text-white/70 text-sm">
              This may take 10-20 seconds...
            </p>
          </div>
        )}

        {/* image preview */}
        {!isLoading && thumbnail?.image_url && (
          <div className="group relative h-full w-full">
            <img
              src={thumbnail.image_url}
              alt={thumbnail.title || "Thumbnail preview"}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-end justify-center bg-black/10 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={onDownload}
                className="mb-6 flex items-center gap-2 rounded-md px-5 py-2.5 text-xs font-medium transition bg-white/30 ring-2 ring-white/40 backdrop-blur hover:scale-105 active:scale-95"
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        )}

        {/* empty state */}
        {!isLoading && !thumbnail?.image_url && (
          <div className="absolute inset-0 m-2 flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-white/20 bg-black/25">
            <Image className="size-10 text-white opacity-50" />
            <div className="px-4 text-center">
              <p className="text-sm text-white font-medium">
                Generate your first thumbnail
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Fill out the form and click on generate
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;
