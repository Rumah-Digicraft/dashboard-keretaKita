import { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, User } from 'lucide-react';
import Swal from 'sweetalert2';

// Mock data while backend is being set up
const MOCK_REVIEWS = [
  {
    reviewId: 'gp1',
    authorName: 'Budi Santoso',
    starRating: 5,
    text: 'Aplikasi sangat membantu untuk cek jadwal kereta real-time. UI nya juga bersih.',
    createTime: '2024-05-10T08:30:00Z',
    reply: null
  },
  {
    reviewId: 'gp2',
    authorName: 'Siti Aminah',
    starRating: 4,
    text: 'Lumayan bagus, tapi terkadang loading sedikit lama saat buka menu stasiun. Tolong diperbaiki.',
    createTime: '2024-05-09T14:15:00Z',
    reply: {
      text: 'Terima kasih feedbacknya Bu Siti. Kami akan optimalkan di update berikutnya.',
      lastModifiedTime: '2024-05-09T15:00:00Z'
    }
  },
  {
    reviewId: 'gp3',
    authorName: 'Rudi Hartono',
    starRating: 5,
    text: 'Mantap jiwa! Sukses terus buat developernya.',
    createTime: '2024-05-08T09:00:00Z',
    reply: null
  }
];

export default function PlayStoreReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [submitting, setSubmitting] = useState(null);

  // Set this to true once Cloud Functions are deployed
  const USE_REAL_API = false;
  // Replace with your actual project ID after deployment
  const PROJECT_ID = "kereta-kita-dashboard"; 
  const API_URL = `https://us-central1-${PROJECT_ID}.cloudfunctions.net`;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        if (USE_REAL_API) {
          const res = await fetch(`${API_URL}/getReviews`);
          const data = await res.json();
          if (data.success) {
            setReviews(data.reviews);
          } else {
            console.error("API Error:", data.error);
            setReviews(MOCK_REVIEWS); // Fallback
          }
        } else {
          // Simulate API fetch delay
          setTimeout(() => {
            setReviews(MOCK_REVIEWS);
          }, 1000);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setReviews(MOCK_REVIEWS);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleReplyChange = (reviewId, text) => {
    setReplyText(prev => ({ ...prev, [reviewId]: text }));
  };

  const submitReply = async (reviewId) => {
    const text = replyText[reviewId];
    if (!text?.trim()) return;

    setSubmitting(reviewId);
    
    // Simulate API call
    setTimeout(() => {
      setReviews(prev => prev.map(r => {
        if (r.reviewId === reviewId) {
          return {
            ...r,
            reply: {
              text: text,
              lastModifiedTime: new Date().toISOString()
            }
          };
        }
        return r;
      }));
      setReplyText(prev => ({ ...prev, [reviewId]: '' }));
      setSubmitting(null);
      Swal.fire({
        icon: 'success',
        title: 'Balasan Terkirim',
        text: 'Balasan Anda telah berhasil dikirim ke Play Store.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }, 1500);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} 
      />
    ));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Play Store" className="h-8" />
            Ulasan Pengguna
          </h2>
          <p className="text-sm text-slate-500 mt-1">Pantau dan balas ulasan langsung.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-500">Memuat ulasan...</div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.reviewId} className="border-b border-slate-50 last:border-0 pb-6 last:pb-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{review.authorName}</h4>
                    <div className="flex gap-1 mt-0.5">
                      {renderStars(review.starRating)}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(review.createTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                {review.text}
              </p>

              {review.reply ? (
                <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100 ml-8">
                  <div className="flex items-center gap-2 mb-1 text-xs font-bold text-blue-700 uppercase">
                    <MessageSquare className="w-3 h-3" />
                    Balasan Developer
                  </div>
                  <p className="text-slate-700 text-sm">
                    {review.reply.text}
                  </p>
                </div>
              ) : (
                <div className="mt-4 ml-8 flex gap-2">
                   <input
                    type="text"
                    value={replyText[review.reviewId] || ''}
                    onChange={(e) => handleReplyChange(review.reviewId, e.target.value)}
                    placeholder="Tulis balasan..."
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-kai-blue focus:border-kai-blue"
                  />
                  <button
                    onClick={() => submitReply(review.reviewId)}
                    disabled={!replyText[review.reviewId] || submitting === review.reviewId}
                    className="bg-kai-blue text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting === review.reviewId ? (
                      <span className="text-xs">Mengirim...</span>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
