import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  colorSchemes,
  type AspectRatio,
  type IThumbnail,
  type ThumbnailStyle,
} from "../assets/assets";
import SoftBackdrop from "../components/SoftBackdrop";
import AspectRationSelector from "../components/AspectRationSelector";
import StyleSelector from "../components/StyleSelector";
import ColorSchemeSelector from "../components/ColorSchemeSelector";
import PreviewPanel from "../components/previewPanel";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import api from "../configs/api";

const Generate = () => {
  const { id } = useParams<{ id?: string }>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // Form States
  const [title, setTitle] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [colorSchemeId, setColorSchemeId] = useState<string>(
    colorSchemes[0].id
  );
  const [style, setStyle] = useState<ThumbnailStyle>("Bold and Graphic");

  // UI & Data States
  const [thumbnail, setThumbnail] = useState<IThumbnail | null>(null);
  const [loading, setLoading] = useState(false);
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);

  /**
   * Fetches thumbnail details from the API.
   * If the image_url is missing, it keeps the loading state active for polling.
   */
  const fetchThumbnail = async () => {
    try {
      const { data } = await api.get(`/api/user/thumbnail/${id}`);
      const thumb = data?.thumbnail as IThumbnail;

      setThumbnail(thumb);
      setAdditionalDetails(thumb?.user_prompt || "");
      setColorSchemeId(thumb?.color_scheme || colorSchemes[0].id);
      setAspectRatio(thumb?.aspect_ratio || "16:9");
      setStyle(thumb?.style || "Bold and Graphic");
      setTitle(thumb?.title || "");

      // If there is no image URL yet, the backend is still processing
      if (!thumb?.image_url) {
        setLoading(true);
      } else {
        setLoading(false);
      }
    } catch (error: any) {
      console.error(error);
      setLoading(false);
      toast.error(
        error?.response?.data?.message || "Failed to fetch thumbnail"
      );
    }
  };

  /**
   * Handles the initial generation request
   */
  const handleGenerate = async () => {
    if (!isLoggedIn) {
      return toast.error("Please login to generate thumbnails");
    }
    if (!title.trim()) {
      return toast.error("Title is required");
    }

    setLoading(true);

    try {
      const api_payload = {
        title,
        prompt: additionalDetails,
        style,
        aspect_ratio: aspectRatio,
        color_scheme: colorSchemeId,
        text_overlay: true,
      };

      const { data } = await api.post("/api/thumbnail/generate", api_payload);

      if (data.thumbnail) {
        toast.success(data.message || "Generation started!");
        navigate("/generate/" + data.thumbnail._id);
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  /**
   * EFFECT: Polling & Initial Fetch
   * Runs when the ID changes or during the loading/polling phase.
   */
  useEffect(() => {
    if (isLoggedIn && id) {
      fetchThumbnail();
    }

    let interval: ReturnType<typeof setInterval> | undefined;

    // If we have an ID but no image yet, poll every 2 seconds
    if (id && loading && isLoggedIn) {
      interval = setInterval(() => {
        fetchThumbnail();
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, loading, isLoggedIn]);

  /**
   * EFFECT: Cleanup/Reset
   * Resets form when user navigates away from a specific ID back to /generate
   */
  useEffect(() => {
    if (!id) {
      setThumbnail(null);
      setTitle("");
      setAdditionalDetails("");
      setLoading(false);
    }
  }, [id, pathname]);

  return (
    <>
      <SoftBackdrop />
      <div className="pt-24 min-h-screen">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8">
          <div className="grid lg:grid-cols-[400px_1fr] gap-8">
            {/* Left Panel - Form */}
            <div
              className={`space-y-6 ${
                id ? "pointer-events-none opacity-80" : ""
              }`}
            >
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-zinc-100 mb-1">
                    Create your Thumbnail
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Describe your vision and let AI bring it to life
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Title Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-200">
                      Title or Topic
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={100}
                      placeholder="e.g., 10 tips for better sleep"
                      className="w-full px-4 py-3 rounded-lg border border-white/10 bg-black/20 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <div className="flex justify-end">
                      <span className="text-xs text-zinc-500">
                        {title.length}/100
                      </span>
                    </div>
                  </div>

                  <AspectRationSelector
                    value={aspectRatio}
                    onChange={setAspectRatio}
                  />

                  <StyleSelector
                    value={style}
                    onChange={setStyle}
                    isOpen={styleDropdownOpen}
                    setIsOpen={setStyleDropdownOpen}
                  />

                  <ColorSchemeSelector
                    value={colorSchemeId}
                    onChange={setColorSchemeId}
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-200">
                      Additional Prompts{" "}
                      <span className="text-zinc-500 text-xs">(Optional)</span>
                    </label>
                    <textarea
                      value={additionalDetails}
                      onChange={(e) => setAdditionalDetails(e.target.value)}
                      rows={3}
                      placeholder="Add specific elements, mood, or style preferences..."
                      className="w-full px-4 py-3 rounded-lg border border-white/10 bg-black/20 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                    />
                  </div>
                </div>

                {!id && (
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl font-medium bg-gradient-to-b from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-pink-500/20"
                  >
                    {loading ? "Generating..." : "Generate Thumbnail"}
                  </button>
                )}
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="h-full">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl min-h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-zinc-100">
                    Preview
                  </h2>
                  {id && (
                    <button
                      onClick={() => navigate("/generate")}
                      className="text-xs text-pink-400 hover:text-pink-300 transition-colors"
                    >
                      + Create New
                    </button>
                  )}
                </div>
                <PreviewPanel
                  thumbnail={thumbnail}
                  isLoading={loading}
                  aspectRatio={aspectRatio}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Generate;
