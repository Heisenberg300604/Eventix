// ==========================================
// Profile.jsx — Organizer Dashboard Profile Page
// ==========================================
// This profile page is for ORGANIZERS only.
// It lives inside the DashboardLayout (sidebar visible).
//
// Route: /dashboard/profile  (organizer only)
//
// Features:
//  - Avatar, display name, email, role badge
//  - Editable display name
//  - Member since date
//  - Quick links to Create Event and My Events
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
    PlusCircle,
    CalendarCheck,
    ArrowRight,
    BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "../../utils/supabase.js";

const Profile = () => {
    // ---- Get user data from AuthContext ----
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
            // Update our "profiles" table
            const { error: profileError } = await supabase
                .from("profiles")
                .update({ full_name: fullName.trim() })
                .eq("id", user.id);
            if (profileError) throw profileError;

            // Update Supabase Auth metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: fullName.trim() },
            });
            if (authError) throw authError;

            setMessage({ type: "success", text: "Profile updated successfully!" });
            setIsEditing(false);
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error("Profile update error:", error);
            setMessage({
                type: "error",
                text: error.message || "Failed to update profile.",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFullName(displayName);
        setIsEditing(false);
        setMessage(null);
    };

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <div className="mx-auto max-w-3xl">
            {/* ---- Page Header ---- */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Organizer Profile
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                    Manage your personal information and organizer account settings
                </p>
            </motion.div>

            {/* ---- Feedback Banner ---- */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 flex items-center gap-2 rounded-xl border p-4 text-sm ${message.type === "success"
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
                {/* ========== PROFILE CARD (3/5) ========== */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="md:col-span-3 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                >
                    {/* ---- Profile Header ---- */}
                    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-7">
                        <div className="flex items-center gap-5">
                            {/* Avatar */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/25"
                            >
                                {initials}
                            </motion.div>

                            {/* Name + Email + Badge */}
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-bold text-foreground truncate">
                                    {displayName}
                                </h2>
                                <p className="mt-0.5 text-sm text-muted-foreground truncate">
                                    {user?.email}
                                </p>
                                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                    <Shield className="h-3 w-3" />
                                    Organizer
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ---- Profile Details ---- */}
                    <div className="p-6">
                        <div className="space-y-5">
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
                                        Organizer
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
                    </div>
                </motion.div>

                {/* ========== RIGHT COLUMN (2/5) ========== */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="md:col-span-2 flex flex-col gap-4"
                >
                    {/* Create Event shortcut */}
                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="p-6">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-4">
                                <PlusCircle className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground">
                                Create Event
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Launch your next event and start selling tickets.
                            </p>
                            <Link to="/dashboard/create" className="mt-4 block">
                                <Button size="sm" className="w-full gap-2 rounded-xl">
                                    Create New Event
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* My Events shortcut */}
                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="p-6">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-4">
                                <CalendarCheck className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground">
                                My Events
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Manage and track all your published events.
                            </p>
                            <Link to="/dashboard" className="mt-4 block">
                                <Button variant="outline" size="sm" className="w-full gap-2 rounded-xl">
                                    View Dashboard
                                    <BarChart3 className="h-3.5 w-3.5" />
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
                                Manage your account security settings.
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
    );
};

export default Profile;
