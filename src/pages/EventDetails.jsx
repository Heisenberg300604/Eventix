// ==========================================
// EventDetails.jsx — Public Event Detail Page
// ==========================================
// Yeh page kya karta hai (What this page does):
//  1. URL se event ID lo (:id param)
//  2. Supabase se us event ka data fetch karo
//  3. Banner, title, date, location, description dikhao
//  4. ✅ NEW: Social Share Panel — WhatsApp, Twitter, Telegram, Copy Link
//  5. 💳 NEW: Razorpay Payment Gateway — ticket booking ke liye payment
//  6. Ticket booking section:
//     a. Attendee check (isAttendee guard)
//     b. Duplicate booking check (.maybeSingle())
//     c. Razorpay checkout open karo → payment success ke baad Supabase insert
//     d. DB trigger seats_left reduce karta hai (race-condition safe)
//     e. Optimistic UI update → seats_left locally update karo
// ==========================================

import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  CalendarDays, MapPin, Users, ArrowLeft, Minus, Plus,
  Share2, Heart, Loader2, ImageIcon, CheckCircle2, AlertCircle,
  // Social Share ke liye naye icons
  Copy, Check, X, MessageCircle, Twitter, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAttendee } = useAuth(); // isAttendee = user_type === "attend"

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Ticket quantity selector
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);

  // Booking states
  const [booking, setBooking] = useState(false);       // submit in progress
  const [alreadyBooked, setAlreadyBooked] = useState(false); // duplicate check
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // ==========================================
  // ✅ NEW: Social Share States
  // ==========================================
  // "shareOpen" = true tab Share panel dikh-ta hai (dropdown)
  const [shareOpen, setShareOpen] = useState(false);
  // "copied" = true jab link copy ho jaye — checkmark icon dikhane ke liye
  const [copied, setCopied] = useState(false);
  // shareRef = panel ke bahar click hone par panel band karo
  const shareRef = useRef(null);

  // ==========================================
  // 💳 NEW: Razorpay Payment States
  // ==========================================
  // "paymentLoading" = true jab Razorpay checkout open ho rahi ho
  const [paymentLoading, setPaymentLoading] = useState(false);

  // ── Supabase se event fetch karo ──────────────────────────
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setEvent(data);
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // ── Agar user logged in hai toh check karo already booked hai kya ────
  // .maybeSingle() use karo — .single() error deta hai jab row nahi milti
  // .maybeSingle() null return karta hai without error = correct semantics
  useEffect(() => {
    const checkExistingBooking = async () => {
      if (!user || !id) return;

      const { data } = await supabase
        .from("bookings")
        .select("id")
        .eq("event_id", id)
        .eq("attendee_id", user.id)
        .maybeSingle(); // null if not found — no error thrown ✅

      if (data) setAlreadyBooked(true);
    };

    checkExistingBooking();
  }, [user, id]);

  // ==========================================
  // ✅ NEW: Share Panel — bahar click karne par band karo
  // useEffect + click listener = "outside click to close" pattern
  // Yeh ek common UX pattern hai har dropdown ke liye
  // ==========================================
  useEffect(() => {
    const handleOutsideClick = (e) => {
      // shareRef.current = share panel ka DOM node
      // Agar click panel ke bahar hua → panel band karo
      if (shareRef.current && !shareRef.current.contains(e.target)) {
        setShareOpen(false);
      }
    };

    // Event listener add karo DOM pe — "mousedown" use karo (not "click")
    // kyunki mousedown pehle fire hota hai, click baad mein
    document.addEventListener("mousedown", handleOutsideClick);

    // Cleanup: component unmount hone par listener hata do (memory leak prevent)
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // ── Helpers ───────────────────────────────────────────────

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const { data } = supabase.storage.from("event-images").getPublicUrl(imagePath);
    return data.publicUrl;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // ✅ NEW: Social Share Helper Functions
  // Concept: Social platforms ke paas predefined share URLs hain
  // In URLs mein hum apna link + text pass karte hain as query params
  // encodeURIComponent() = URL mein special chars ko encode karo (spaces → %20, etc.)
  // ==========================================
  const getShareData = () => {
    // window.location.href = current page ka full URL
    // Example: https://eventix.vercel.app/events/abc123
    const url = window.location.href;
    // Event ka title share message mein include karo
    const text = `🎉 Check out this event: ${event?.title}`;
    return { url, text };
  };

  // WhatsApp share — wa.me/send URL mein text + url pass karo
  // Mobile pe WhatsApp app open ho jaata hai, desktop pe WhatsApp Web
  const shareOnWhatsApp = () => {
    const { url, text } = getShareData();
    // encodeURIComponent = spaces aur special chars ko URL-safe format mein convert karo
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`, "_blank");
  };

  // Twitter/X share — twitter.com/intent/tweet URL use karo
  // "intent/tweet" = Twitter ka built-in share dialog hai
  const shareOnTwitter = () => {
    const { url, text } = getShareData();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
  };

  // Telegram share — t.me/share/url use karo
  const shareOnTelegram = () => {
    const { url, text } = getShareData();
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
  };

  // Copy link to clipboard — navigator.clipboard modern API hai
  // setCopied(true) karo → checkmark dikhao → 2 sec baad reset karo
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      // 2 seconds ke baad "copied" state reset karo
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Agar clipboard access deny ho (old browser) → fallback
      console.error("Clipboard copy failed");
    }
  };

  // Native Share API — sirf mobile browsers pe available hai
  // Yeh phone ka built-in share sheet open karta hai (WhatsApp, Instagram, etc.)
  const nativeShare = async () => {
    const { url, text } = getShareData();
    // "navigator.share" check karo — desktop pe available nahi hota
    if (navigator.share) {
      try {
        await navigator.share({ title: event?.title, text, url });
      } catch {
        // User ne share cancel kiya — koi problem nahi
      }
    } else {
      // Desktop pe → panel open karo
      setShareOpen(true);
    }
  };

  // ==========================================
  // 💳 NEW: Razorpay Payment Handler
  // ==========================================
  // Flow explanation (students ke liye):
  // 1. "Book Now" click karo
  // 2. handlePayment() → Razorpay checkout window open karo
  // 3. User test card se payment complete kare
  // 4. Razorpay: payment.handler() callback call karta hai with payment details
  // 5. handler mein → Supabase mein booking insert karo + UI update
  //
  // IMPORTANT for Students:
  // Production mein payment verification server-side honi chahiye!
  // Client-side verification safe nahi hai (user tamper kar sakta hai).
  // Is tutorial mein hum test mode mein frontend-only approach use kar rahe hain.
  // Real production app mein: Supabase Edge Function ya backend server se
  // Razorpay signature verify karo using razorpay.webhooks.construct()
  // ==========================================

  const handlePayment = async () => {
    // Frontend guard — attendees only
    // NOTE: RLS on the bookings table is the REAL security layer
    if (!user) {
      navigate("/login");
      return;
    }
    if (!isAttendee) {
      setBookingError("Only attendees can book events.");
      return;
    }

    setPaymentLoading(true);
    setBookingError("");

    try {
      // Safety clamp: qty should never exceed current seats_left
      const safeQty = Math.min(qty, event.seats_left);
      const amountInPaise = ((event.price ?? 99) * safeQty * 100);

      // ── 1. Create Razorpay Order ─────────────────────────
      // NOTE: In production, order creation MUST happen on the backend!
      // Here we create it in frontend using Basic Auth for tutorial/test mode.
      // We use a proxy (/api/razorpay -> api.razorpay.com) to bypass CORS blocks.
      const orderResponse = await fetch("/api/razorpay/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + btoa(`${import.meta.env.VITE_RAZORPAY_KEY_ID}:${import.meta.env.VITE_RAZORPAY_SECRET_KEY}`)
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: `receipt_${event.id}_${user.id}`.substring(0, 40), // receipt max 40 chars
        })
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order. Please check your keys or network.");
      }
      
      const orderData = await orderResponse.json();

      // ── Razorpay Checkout Options ──────────────────────────
      // Razorpay ka "options" object — yeh sab fields required/optional hain
      // Docs: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/
      const options = {
        // VITE_ prefix = Vite mein env vars aise expose hote hain frontend pe
        // .env file mein VITE_RAZORPAY_KEY_ID=rzp_test_XXXX rakho
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        // Amount PAISE mein hona chahiye (Indian currency ka smallest unit)
        // 1 rupee = 100 paise, isliye * 100
        // Agar event.price nahi hai DB mein → default ₹99 per ticket
        amount: orderData.amount,

        currency: orderData.currency,
        
        // Latest Razorpay docs require order_id for standard checkout
        order_id: orderData.id,

        // Checkout window mein dikhne wala naam
        name: "Eventix",

        // Event ka title description mein dikhega
        description: `${safeQty} ticket(s) for: ${event.title}`,

        // Prefill = user ka data already fill ho jata hai form mein
        // Supabase se user email milti hai: user.email
        prefill: {
          email: user.email,
          // Agar profile mein naam hai toh use karo, warna blank
          name: user.user_metadata?.full_name || "",
        },

        // Theme color = apni app ki primary color rakho
        theme: { color: "#6366f1" }, // Indigo/violet — Eventix ka brand color

        // ── Payment Success Handler ──────────────────────────
        // Yeh function tab chalega jab user successfully payment kare
        // Razorpay ek "response" object deta hai with payment details
        handler: async (response) => {
          // response.razorpay_payment_id = unique payment ID from Razorpay
          // Isko Supabase mein save karo for records/refunds/verification
          console.log("✅ Razorpay Payment Success:", response);

          try {
            // Ab Supabase mein booking insert karo
            // razorpay_payment_id column booking row mein save karo
            // NOTE: Apne Supabase bookings table mein razorpay_payment_id column add karna hoga
            const { error } = await supabase.from("bookings").insert({
              event_id: event.id,
              attendee_id: user.id,
              tickets: safeQty,
              status: "confirmed",
              // Payment ID save karo — future mein refund/verification ke liye kaam aayega
              razorpay_payment_id: response.razorpay_payment_id,
            });

            if (error) {
              // Booking insert fail hua (e.g., duplicate, RLS issue)
              if (error.message.includes("Not enough seats")) {
                setBookingError("Not enough seats available. Please reduce quantity.");
              } else if (error.code === "23505") {
                // PostgreSQL unique violation = already booked
                setAlreadyBooked(true);
                setBookingError("You have already booked this event.");
              } else {
                setBookingError(error.message || "Booking failed after payment. Please contact support.");
              }
              return;
            }

            // Optimistic UI update — locally reduce seats_left
            // Hum DB pe rely karte hain for truth, but UI smooth rakhne ke liye
            // yeh immediately update kar dete hain bina re-fetch ke
            setEvent((prev) => ({
              ...prev,
              seats_left: prev.seats_left - safeQty,
            }));

            setAlreadyBooked(true);
            setBookingSuccess(true);
          } catch (err) {
            setBookingError("Payment done but booking failed. Please contact support.");
          }
        },

        // ── Payment Window Close Handler ──────────────────────
        // User ne checkout window close kiya (payment cancel)
        modal: {
          ondismiss: () => {
            // Payment cancel hua — loading band karo, koi error mat dikhao
            setPaymentLoading(false);
          },
        },
      };

      // ── Razorpay Instance Create + Open ───────────────────
      // window.Razorpay = index.html mein load kiya hua Razorpay script
      // Agar script load nahi hua → user ko inform karo
      if (!window.Razorpay) {
        setBookingError("Payment gateway failed to load. Please refresh the page.");
        setPaymentLoading(false);
        return;
      }

      // Razorpay instance banao aur checkout open karo
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

      // NOTE: paymentLoading false karna handler/ondismiss mein hoga
      // kyunki open() ke baad control immediately return ho jaata hai
    } catch (err) {
      setBookingError(err.message || "Payment failed. Please try again.");
      setPaymentLoading(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading event…</p>
      </div>
    );
  }

  // ── Error / not found ─────────────────────────────────────
  if (fetchError || !event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">Event not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {fetchError || "This event may have been deleted."}
        </p>
        <Link to="/" className="mt-4 inline-block text-primary hover:underline">
          Back to events
        </Link>
      </div>
    );
  }

  const imageUrl = getImageUrl(event.image_path);
  const soldOut = (event.seats_left ?? 0) === 0;

  // ── Render ────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
    >
      {/* Back link */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to events
        </Link>
      </motion.div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        {/* Banner */}
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-muted">
          {imageUrl ? (
            <motion.img
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6 }}
              src={imageUrl}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />

          {/* Category badge + title */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            {event.category && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Badge className="mb-3 rounded-lg border-0 bg-card/90 text-card-foreground backdrop-blur-md shadow-md">
                  {event.category}
                </Badge>
              </motion.div>
            )}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-primary-foreground drop-shadow-lg sm:text-4xl"
            >
              {event.title}
            </motion.h1>
          </div>

          {/* ── Like + Share Buttons ──────────────────────────── */}
          <div className="absolute right-4 top-4 flex gap-2">
            {/* Like/Heart button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLiked(!liked)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-card/90 backdrop-blur-md text-card-foreground transition-colors shadow-md hover:bg-card ${liked ? "text-destructive" : ""}`}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            </motion.button>

            {/* ==========================================
                ✅ NEW: Share Button + Dropdown Panel
                ==========================================
                shareRef = is div ka reference hai
                Bahar click detect karne ke liye useEffect mein use hoga
            ========================================== */}
            <div className="relative" ref={shareRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                // Mobile pe nativeShare, desktop pe toggle panel
                onClick={nativeShare}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-card/90 backdrop-blur-md text-card-foreground transition-colors shadow-md hover:bg-card"
              >
                <Share2 className="h-4 w-4" />
              </motion.button>

              {/* ── Share Dropdown Panel (desktop pe dikhega) ──
                  AnimatePresence = smooth mount/unmount animation
                  shareOpen = true → panel dikhao, false → hide karo
              ── */}
              <AnimatePresence>
                {shareOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -8 }}
                    transition={{ duration: 0.15 }}
                    // right-0 = panel right-align hoga button ke saath
                    className="absolute right-0 top-12 z-50 min-w-[200px] overflow-hidden rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl"
                  >
                    {/* Panel header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Share Event
                      </span>
                      {/* Close button — X icon */}
                      <button
                        onClick={() => setShareOpen(false)}
                        className="rounded-lg p-1 hover:bg-muted transition-colors"
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>

                    {/* Share options list */}
                    <div className="p-2 flex flex-col gap-1">

                      {/* WhatsApp share option */}
                      {/* ─────────────────────────────────────────
                          WhatsApp ka share URL format:
                          https://api.whatsapp.com/send?text=<encoded text>
                          encodeURIComponent() → spaces/special chars handle karo
                      ───────────────────────────────────────── */}
                      <button
                        onClick={() => { shareOnWhatsApp(); setShareOpen(false); }}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors text-left"
                      >
                        {/* WhatsApp ka green color use karo */}
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25D366]/10">
                          <MessageCircle className="h-4 w-4 text-[#25D366]" />
                        </div>
                        WhatsApp
                      </button>

                      {/* Twitter/X share option */}
                      {/* ─────────────────────────────────────────
                          Twitter ka share URL format:
                          https://twitter.com/intent/tweet?text=...&url=...
                          "intent/tweet" = Twitter ka built-in share dialog
                      ───────────────────────────────────────── */}
                      <button
                        onClick={() => { shareOnTwitter(); setShareOpen(false); }}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors text-left"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/10 dark:bg-white/10">
                          <Twitter className="h-4 w-4" />
                        </div>
                        Twitter / X
                      </button>

                      {/* Telegram share option */}
                      {/* ─────────────────────────────────────────
                          Telegram ka share URL format:
                          https://t.me/share/url?url=...&text=...
                      ───────────────────────────────────────── */}
                      <button
                        onClick={() => { shareOnTelegram(); setShareOpen(false); }}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors text-left"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2AABEE]/10">
                          <Send className="h-4 w-4 text-[#2AABEE]" />
                        </div>
                        Telegram
                      </button>

                      {/* Copy Link option */}
                      {/* ─────────────────────────────────────────
                          navigator.clipboard.writeText() = modern Clipboard API
                          copied = true → Check icon dikhao (2 sec ke liye)
                          copied = false → Copy icon dikhao
                      ───────────────────────────────────────── */}
                      <button
                        onClick={copyLink}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors text-left"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          {/* copied ho gaya → Check ✓, nahi → Copy icon */}
                          {copied
                            ? <Check className="h-4 w-4 text-primary" />
                            : <Copy className="h-4 w-4 text-primary" />
                          }
                        </div>
                        {/* Text bhi change hota hai as feedback */}
                        {copied ? "Copied!" : "Copy Link"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Meta chips */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-3 text-sm"
          >
            <span className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-medium text-accent-foreground">
              <CalendarDays className="h-4 w-4" /> {formatDate(event.event_date)}
            </span>
            <span className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-medium text-accent-foreground">
              <MapPin className="h-4 w-4" /> {event.location}
            </span>
            <span className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-medium text-accent-foreground">
              <Users className="h-4 w-4" /> {event.capacity} capacity · {event.seats_left} left
            </span>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 border-t border-border pt-6"
          >
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">About</h3>
            <p className="leading-relaxed text-muted-foreground">
              {event.description || "No description provided."}
            </p>
          </motion.div>

          {/* ── Booking Section ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 rounded-2xl border border-border bg-gradient-to-br from-muted/50 to-muted/30 p-6 shadow-sm"
          >
            {/* Booking header + Price display */}
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-bold text-card-foreground">Book Tickets</h3>

              {/* ── Price badge ──────────────────────────────────
                  event.price DB column hai — agar nahi hai → "Free" dikhao
                  Razorpay ke liye: amount = price × qty × 100 (paise mein)
              ──────────────────────────────────────────────── */}
              {event.price ? (
                <div className="text-right">
                  <span className="text-2xl font-bold text-foreground">₹{event.price}</span>
                  <span className="ml-1 text-sm text-muted-foreground">/ ticket</span>
                </div>
              ) : (
                <span className="rounded-xl bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  Free Event
                </span>
              )}
            </div>

            {/* Success state — booking confirmed */}
            <AnimatePresence>
              {bookingSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success font-medium"
                >
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  🎉 Booking confirmed! Check "My Bookings" for details.
                </motion.div>
              )}
            </AnimatePresence>

            {/* Already booked (detected on load or after booking) */}
            {alreadyBooked && !bookingSuccess && (
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                You've already booked this event.
              </p>
            )}

            {/* Sold out */}
            {soldOut && !alreadyBooked && (
              <p className="text-sm font-medium text-destructive">This event is sold out.</p>
            )}

            {/* Booking form — attend nahi hai toh different message */}
            {!soldOut && !alreadyBooked && !bookingSuccess && (
              <>
                {/* Not logged in */}
                {!user && (
                  <div className="flex flex-wrap items-center gap-4">
                    <p className="text-sm text-muted-foreground">Login to book tickets</p>
                    <Link to="/login">
                      <Button size="lg" className="gap-2 rounded-xl px-8 shadow-lg shadow-primary/20">
                        Login to Book
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Logged in but organizer — can't book own events */}
                {user && !isAttendee && (
                  <p className="text-sm text-muted-foreground">
                    Organizers cannot book events. Switch to an attendee account.
                  </p>
                )}

                {/* Attendee — show qty selector + Book Now (with Razorpay) */}
                {user && isAttendee && (
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Qty capped at seats_left — prevents selecting more than available */}
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1 shadow-sm">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
                      >
                        <Minus className="h-4 w-4" />
                      </motion.button>
                      <span className="w-12 text-center text-base font-bold text-foreground">{qty}</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        // Max qty = seats_left — client-side clamp
                        onClick={() => setQty(Math.min(event.seats_left, qty + 1))}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
                      >
                        <Plus className="h-4 w-4" />
                      </motion.button>
                    </div>

                    {/* Total amount display — qty × price */}
                    {event.price && (
                      <span className="text-sm font-semibold text-foreground">
                        Total: ₹{event.price * qty}
                      </span>
                    )}

                    {/* ==========================================
                        💳 Book Now Button — Razorpay ke saath
                        onClick = handlePayment (Razorpay opens)
                        paymentLoading = true jab payment process ho rahi ho
                    ========================================== */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        size="lg"
                        onClick={handlePayment}
                        disabled={paymentLoading}
                        className="gap-2 rounded-xl px-8 shadow-lg shadow-primary/20"
                      >
                        {paymentLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Opening Payment…
                          </>
                        ) : (
                          // Event free hai → "Book Free" dikhao, paid → "Pay & Book"
                          event.price ? `Pay ₹${event.price * qty} & Book` : "Book Now"
                        )}
                      </Button>
                    </motion.div>
                  </div>
                )}
              </>
            )}

            {/* Booking error message */}
            <AnimatePresence>
              {bookingError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center gap-2 text-sm font-medium text-destructive"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {bookingError}
                </motion.p>
              )}
            </AnimatePresence>

            {/* ── Razorpay "Secured by" badge ────────────────────
                UX tip: "Secured by" badge user ko trust deta hai
                payment karne se pehle
            ─────────────────────────────────────────────────── */}
            {user && isAttendee && !soldOut && !alreadyBooked && !bookingSuccess && event.price && (
              <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                </svg>
                Secured by Razorpay · Test Mode
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventDetails;
