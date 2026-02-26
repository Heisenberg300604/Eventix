// ==========================================
// AttendeeProfile.jsx — Attendee Profile Page
// ==========================================
// This is the profile page shown to ATTENDEES only.
// It uses the MainLayout (public Navbar + Footer),
// so it feels like a regular page — NOT a dashboard.
//
// Route: /profile  (only accessible to attendees)
//
// Features:
//  - Beautiful hero card with avatar, name, email, role badge
//  - Editable display name
//  - Member since date
//  - Quick links to My Bookings
// ==========================================

import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    User,
    Mail,
    Shield,
    Calendar,
    Edit3,
    Save,
    X,
    CheckCircle,
    AlertCircle,
    Loader2,
    Ticket,
    ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "../../utils/supabase.js";

const AttendeeProfile = () => {
    const { user, profile } = useAuth();

    // ---- Local State ----
    const [isEditing, setIsEditing] = useState(false);
    const [fullName, setFullName] = useState(
        profile?.full_name || user?.user_metadata?.full_name || ""
    );
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    // ---- Computed Values ----
    const displayName =
        profile?.full_name || user?.user_metadata?.full_name || "User";

    const initials = displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const memberSince = user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "Unknown";

    // ---- Save Handler ----
    const handleSave = async () => {
        if (!fullName.trim()) {
            setMessage({ type: "error", text: "Name cannot be empty." });
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            const { error: profileError } = await supabase
                .from("profiles")
                .update({ full_name: fullName.trim() })
                .eq("id", user.id);
            if (profileError) throw profileError;

            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: fullName.trim() },
            });
            if (authError) throw authError;

            setMessage({ type: "success", text: "Profile updated successfully!" });
            setIsEditing(false);
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: "error", text: error.message || "Failed to update profile." });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFullName(displayName);
        setIsEditing(false);
        setMessage(null);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* ---- Hero Banner ---- */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-transparent pb-32 pt-16">
                {/* Decorative blobs */}
                <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

                <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
                    {/* Avatar */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                        className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-primary text-3xl font-bold text-primary-foreground shadow-2xl shadow-primary/30"
                    >
                        {initials}
                    </motion.div>

                    {/* Name + Email */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-4"
                    >
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {displayName}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>

                        {/* Role badge */}
                        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/15 px-4 py-1.5 text-xs font-semibold text-success">
                            <Ticket className="h-3.5 w-3.5" />
                            Attendee
                        </span>
                    </motion.div>
                </div>
            </div>

            {/* ---- Main Content (pulled up to overlap hero) ---- */}
            <div className="relative mx-auto -mt-16 max-w-3xl px-4 sm:px-6 lg:px-8 pb-16">

                {/* Feedback Banner */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-4 flex items-center gap-2 rounded-xl border p-4 text-sm ${message.type === "success"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-red-200 bg-red-50 text-red-700"
                            }`}
                    >
                        {message.type === "success" ? (
                            <CheckCircle className="h-4 w-4 shrink-0" />
                        ) : (
                            <AlertCircle className="h-4 w-4 shrink-0" />
                        )}
                        {message.text}
                    </motion.div>
                )}

                <div className="grid gap-6 md:grid-cols-5">
                    {/* ---- Profile Details Card (3/5 width) ---- */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="md:col-span-3 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                    >
                        <div className="border-b border-border px-6 py-4">
                            <h2 className="text-base font-semibold text-foreground">
                                Personal Information
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Manage your display name and account details
                            </p>
                        </div>
                        <div className="p-6 space-y-5">
                            {/* Full Name */}
                            <div>
                                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Full Name
                                </Label>
                                {isEditing ? (
                                    <div className="mt-1.5 flex gap-2">
                                        <Input
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Enter your name"
                                            className="rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                                        />
                                        <Button
                                            onClick={handleSave}
                                            disabled={saving}
                                            size="sm"
                                            className="gap-1.5 rounded-xl"
                                        >
                                            {saving ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Save className="h-3.5 w-3.5" />
                                            )}
                                            Save
                                        </Button>
                                        <Button
                                            onClick={handleCancel}
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1.5 rounded-xl"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="mt-1.5 flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium text-foreground">
                                                {displayName}
                                            </span>
                                        </div>
                                        <Button
                                            onClick={() => setIsEditing(true)}
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1.5 text-xs text-muted-foreground hover:text-primary"
                                        >
                                            <Edit3 className="h-3.5 w-3.5" />
                                            Edit
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Email Address
                                </Label>
                                <div className="mt-1.5 flex items-center gap-2.5 rounded-xl bg-muted/30 px-4 py-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                        {user?.email}
                                    </span>
                                </div>
                            </div>

                            {/* Account Type */}
                            <div>
                                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Account Type
                                </Label>
                                <div className="mt-1.5 flex items-center gap-2.5 rounded-xl bg-muted/30 px-4 py-3">
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                        Attendee
                                    </span>
                                </div>
                            </div>

                            {/* Member Since */}
                            <div>
                                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Member Since
                                </Label>
                                <div className="mt-1.5 flex items-center gap-2.5 rounded-xl bg-muted/30 px-4 py-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                        {memberSince}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ---- Quick Links Card (2/5 width) ---- */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="md:col-span-2 flex flex-col gap-4"
                    >
                        {/* My Bookings shortcut */}
                        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className="p-6">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-4">
                                    <Ticket className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="text-sm font-semibold text-foreground">
                                    My Bookings
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    View all your event registrations and tickets.
                                </p>
                                <Link to="/my-bookings" className="mt-4 block">
                                    <Button size="sm" className="w-full gap-2 rounded-xl">
                                        View Bookings
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Account Actions */}
                        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className="p-6">
                                <h3 className="text-sm font-semibold text-foreground">
                                    Account Actions
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Manage your security settings.
                                </p>
                                <div className="mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full gap-2 rounded-xl"
                                        onClick={() =>
                                            alert("Password change feature coming soon!")
                                        }
                                    >
                                        Change Password
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AttendeeProfile;
