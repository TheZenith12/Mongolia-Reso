"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Star,
  Eye,
  Heart,
  Phone,
  Mail,
  Globe,
  ArrowLeft,
  Tent,
  Leaf,
  Share2,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  formatPrice,
  getPlaceTypeLabel,
  getRelativeTime,
  getInitials,
  cn,
} from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import BookingPanel from "@/components/places/BookingPanel";
import ReviewsSection from "@/components/places/ReviewsSection";

export default function PlaceDetailClient({
  place,
  initialLiked,
  profile,
}: any) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(place.like_count ?? 0);
  const [imageIndex, setImageIndex] = useState(0);
  const isResort = place.type === "resort";

  const allImages = [
    ...(place.cover_image ? [place.cover_image] : []),
    ...(place.images ?? []),
  ];

  async function handleLike() {
    if (!profile) {
      toast.error("Нэвтрэх шаардлагатай");
      router.push("/auth/login");
      return;
    }
    const supabase = createClient();
    const { data: existing } = await supabase
      .from("likes")
      .select("user_id")
      .eq("user_id", profile.id)
      .eq("place_id", place.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("likes")
        .delete()
        .eq("user_id", profile.id)
        .eq("place_id", place.id);
      setLiked(false);
      setLikeCount((c: number) => c - 1);
    } else {
      await (supabase
        .from("likes") as any)
        .insert({ user_id: profile.id, place_id: place.id });
      setLiked(true);
      setLikeCount((c: number) => c + 1);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="page-container pt-8 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-forest-500 text-sm hover:text-forest-700 transition-colors"
        >
          <ArrowLeft size={16} /> Буцах
        </Link>
      </div>

      {/* Image gallery */}
      <div className="page-container mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 h-96 lg:h-[28rem]">
          <div className="relative lg:col-span-3 rounded-2xl overflow-hidden bg-forest-100">
            {allImages[imageIndex] ? (
              <Image
                src={allImages[imageIndex]}
                alt={place.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                {isResort ? (
                  <Tent size={64} className="text-forest-300" />
                ) : (
                  <Leaf size={64} className="text-forest-300" />
                )}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/40 via-transparent to-transparent" />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setImageIndex((i) => Math.max(0, i - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                  disabled={imageIndex === 0}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() =>
                    setImageIndex((i) => Math.min(allImages.length - 1, i + 1))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                  disabled={imageIndex === allImages.length - 1}
                >
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImageIndex(i)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        i === imageIndex ? "bg-white w-5" : "bg-white/50",
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="hidden lg:grid lg:col-span-2 grid-rows-2 gap-3">
            {allImages.slice(1, 3).map((img, i) => (
              <div
                key={i}
                className="relative rounded-2xl overflow-hidden bg-forest-100 cursor-pointer"
                onClick={() => setImageIndex(i + 1)}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="page-container pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div
                  className={cn(
                    "badge mb-3",
                    isResort
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-forest-50 text-forest-700 border-forest-200",
                  )}
                >
                  {isResort ? "🏕" : "🌿"} {getPlaceTypeLabel(place.type)}
                </div>
                <h1 className="font-display text-4xl lg:text-5xl font-semibold text-forest-950 leading-tight">
                  {place.name}
                </h1>
                {place.address && (
                  <div className="flex items-center gap-2 mt-3 text-forest-500">
                    <MapPin size={15} />
                    <span className="text-sm">{place.address}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleLike}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
                    liked
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "bg-white border-forest-200 text-forest-500 hover:border-red-200 hover:text-red-500",
                  )}
                >
                  <Heart size={15} fill={liked ? "currentColor" : "none"} />
                  {likeCount}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-forest-100">
              {place.rating_avg > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        className={cn(
                          s <= Math.round(place.rating_avg)
                            ? "text-amber-400 fill-amber-400"
                            : "text-forest-200 fill-forest-200",
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-forest-800">
                    {Number(place.rating_avg).toFixed(1)}
                  </span>
                  <span className="text-forest-500 text-sm">
                    ({place.rating_count} үнэлгээ)
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-forest-500 text-sm">
                <Eye size={15} /> {place.view_count?.toLocaleString() ?? 0}{" "}
                үзэлт
              </div>
              {isResort && place.price_per_night && (
                <div className="flex items-center gap-1.5 text-forest-700 font-semibold">
                  <Calendar size={15} />
                  {formatPrice(place.price_per_night)} / шөнө
                </div>
              )}
            </div>

            {/* Description */}
            {place.description && (
              <div className="mb-10">
                <h2 className="font-display text-2xl font-semibold text-forest-900 mb-4">
                  Тайлбар
                </h2>
                <div className="text-forest-600 leading-relaxed space-y-3">
                  {place.description
                    .split("\n")
                    .map((para: string, i: number) => (
                      <p key={i}>{para}</p>
                    ))}
                </div>
              </div>
            )}

            {/* Contact */}
            {(place.phone || place.email || place.website) && (
              <div className="mb-10">
                <h2 className="font-display text-2xl font-semibold text-forest-900 mb-4">
                  Холбоо барих
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {place.phone && (
                    <a
                      href={`tel:${place.phone}`}
                      className="flex items-center gap-3 p-4 bg-white rounded-xl border border-forest-100 hover:border-forest-300 transition-colors"
                    >
                      <div className="w-10 h-10 bg-forest-50 rounded-lg flex items-center justify-center">
                        <Phone size={18} className="text-forest-600" />
                      </div>
                      <div>
                        <div className="text-xs text-forest-400">Утас</div>
                        <div className="text-sm font-medium text-forest-800">
                          {place.phone}
                        </div>
                      </div>
                    </a>
                  )}
                  {place.email && (
                    <a
                      href={`mailto:${place.email}`}
                      className="flex items-center gap-3 p-4 bg-white rounded-xl border border-forest-100 hover:border-forest-300 transition-colors"
                    >
                      <div className="w-10 h-10 bg-forest-50 rounded-lg flex items-center justify-center">
                        <Mail size={18} className="text-forest-600" />
                      </div>
                      <div>
                        <div className="text-xs text-forest-400">И-мэйл</div>
                        <div className="text-sm font-medium text-forest-800 truncate">
                          {place.email}
                        </div>
                      </div>
                    </a>
                  )}
                  {place.website && (
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-white rounded-xl border border-forest-100 hover:border-forest-300 transition-colors"
                    >
                      <div className="w-10 h-10 bg-forest-50 rounded-lg flex items-center justify-center">
                        <Globe size={18} className="text-forest-600" />
                      </div>
                      <div>
                        <div className="text-xs text-forest-400">Вэбсайт</div>
                        <div className="text-sm font-medium text-forest-800">
                          Нээх
                        </div>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Map */}
            {place.latitude && place.longitude && (
              <div className="mb-10">
                <h2 className="font-display text-2xl font-semibold text-forest-900 mb-4">
                  Байршил
                </h2>
                <div className="h-72 rounded-2xl overflow-hidden border border-forest-100">
                  <iframe
                    title={`${place.name} байршил`}
                    src={`https://maps.google.com/maps?q=${place.latitude},${place.longitude}&z=13&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                  />
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary mt-3 text-sm inline-flex items-center gap-2"
                >
                  <MapPin size={15} /> Google Maps-ээр заалт авах
                </a>
              </div>
            )}

            {/* Video */}
            {place.video_url && (
              <div className="mb-10">
                <h2 className="font-display text-2xl font-semibold text-forest-900 mb-4">
                  Бичлэг
                </h2>
                <div className="rounded-2xl overflow-hidden border border-forest-100 bg-forest-950">
                  <video
                    src={place.video_url}
                    controls
                    className="w-full max-h-96 object-contain"
                    poster={place.cover_image ?? undefined}
                  >
                    Таны браузер видео дэмждэггүй байна.
                  </video>
                </div>
              </div>
            )}

            {/* Reviews */}
            <ReviewsSection
              placeId={place.id}
              reviews={place.reviews ?? []}
              profile={profile}
            />
          </div>

          {/* Booking panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingPanel place={place} profile={profile} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
