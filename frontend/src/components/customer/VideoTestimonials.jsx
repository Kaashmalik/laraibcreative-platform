'use client';


import { useState } from 'react';
import { Play, X, Star, MapPin, Calendar, CheckCircle } from 'lucide-react';

/**
 * VideoTestimonials Component
 * Displays video testimonials from customers with modal playback
 */
export default function VideoTestimonials() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const testimonials = [
    {
      id: 1,
      name: 'Hira Saleem',
      location: 'Lahore, Pakistan',
      date: 'October 2024',
      thumbnail: '/images/video-testimonials/thumb-1.jpg',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video
      rating: 5,
      category: 'Bridal Wear',
      orderType: 'Custom Bridal Lehenga',
      verified: true,
      preview: 'Amazing experience! My bridal outfit was perfect...',
    },
    {
      id: 2,
      name: 'Zainab Ali',
      location: 'Karachi, Pakistan',
      date: 'September 2024',
      thumbnail: '/images/video-testimonials/thumb-2.jpg',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video
      rating: 5,
      category: 'Party Wear',
      orderType: 'Designer Replica',
      verified: true,
      preview: 'The quality exceeded my expectations completely...',
    },
    {
      id: 3,
      name: 'Mariam Khan',
      location: 'Islamabad, Pakistan',
      date: 'October 2024',
      thumbnail: '/images/video-testimonials/thumb-3.jpg',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video
      rating: 5,
      category: 'Formal Wear',
      orderType: 'Custom Stitching',
      verified: true,
      preview: 'Professional service and beautiful work...',
    },
  ];

  const openVideo = (testimonial) => {
    setSelectedVideo(testimonial);
    document.body.style.overflow = 'hidden';
  };

  const closeVideo = () => {
    setSelectedVideo(null);
    document.body.style.overflow = 'unset';
  };

  return (
    <>
      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <VideoCard
            key={testimonial.id}
            testimonial={testimonial}
            onClick={() => openVideo(testimonial)}
          />
        ))}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal testimonial={selectedVideo} onClose={closeVideo} />
      )}
    </>
  );
}

/**
 * Video Card Component
 */
function VideoCard({ testimonial, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Thumbnail with gradient overlay */}
      <div className="relative aspect-[9/16] bg-gradient-to-br from-pink-100 to-purple-100">
        {/* Placeholder background - Replace with actual thumbnail image */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-rose-200" />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl transform transition-all duration-300 ${
              isHovered ? 'scale-110 bg-pink-600' : 'scale-100'
            }`}
          >
            <Play
              className={`w-8 h-8 ml-1 transition-colors ${
                isHovered ? 'text-white' : 'text-pink-600'
              }`}
              fill="currentColor"
            />
          </div>
        </div>

        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-pink-600">
            {testimonial.category}
          </span>
        </div>

        {/* Verified badge */}
        {testimonial.verified && (
          <div className="absolute top-4 right-4">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 text-yellow-400 fill-yellow-400"
              />
            ))}
          </div>

          {/* Name and location */}
          <h3 className="font-bold text-lg mb-1">{testimonial.name}</h3>
          
          <div className="flex items-center gap-2 text-sm text-white/90 mb-2">
            <MapPin className="w-3 h-3" />
            <span>{testimonial.location}</span>
          </div>

          {/* Order type */}
          <p className="text-sm text-white/80 line-clamp-1">
            {testimonial.orderType}
          </p>

          {/* Preview text */}
          <p className="text-sm text-white/70 mt-2 line-clamp-2">
            {testimonial.preview}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Video Modal Component
 */
function VideoModal({ testimonial, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Modal content */}
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Video container */}
        <div className="relative aspect-video bg-black">
          {/* Replace with actual video embed or video element */}
          <iframe
            src={testimonial.videoUrl}
            title={`Video testimonial from ${testimonial.name}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Testimonial details */}
        <div className="p-6 bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-gray-900">
                  {testimonial.name}
                </h3>
                {testimonial.verified && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-700">
                      Verified Customer
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{testimonial.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{testimonial.date}</span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {testimonial.rating}.0
                </span>
              </div>

              {/* Order details */}
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-pink-100 rounded-full text-sm font-medium text-pink-700">
                  {testimonial.category}
                </span>
                <span className="text-sm text-gray-600">
                  Order: {testimonial.orderType}
                </span>
              </div>
            </div>
          </div>

          {/* Preview text */}
          <p className="text-gray-700 leading-relaxed">
            {testimonial.preview}
          </p>
        </div>
      </div>
    </div>
  );
}