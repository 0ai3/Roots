"use client";

import { useEffect, useState } from "react";
import DashboardPageLayout from "@/app/components/DashboardPageLayout";
import { MapPin, Utensils, Star, Trash2, Plus, Globe2, Upload, X, Image as ImageIcon, AlertCircle, CheckCircle, FileText } from "lucide-react";
import Image from "next/image";

type LogEntry = {
  _id: string;
  type: "attraction" | "recipe";
  title: string;
  description: string;
  country: string;
  city: string;
  rating: number | null;
  imageUrl: string;
  notes: string;
  visitedAt: string;
};

type LogStats = {
  totalAttractions: number;
  totalRecipes: number;
  countriesVisited: number;
  worldPercentage: number;
};

type ValidationState = {
  country: "idle" | "validating" | "valid" | "invalid";
  city: "idle" | "validating" | "valid" | "invalid";
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats>({
    totalAttractions: 0,
    totalRecipes: 0,
    countriesVisited: 0,
    worldPercentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "attraction" | "recipe">("all");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [validation, setValidation] = useState<ValidationState>({
    country: "idle",
    city: "idle",
  });
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [formData, setFormData] = useState({
    type: "attraction" as "attraction" | "recipe",
    title: "",
    description: "",
    country: "",
    city: "",
    rating: 5,
    notes: "",
    imageUrl: "",
  });

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/logs");
      const data = await response.json();
      if (response.ok) {
        setLogs(data.logs || []);
        setStats(data.stats || {
          totalAttractions: 0,
          totalRecipes: 0,
          countriesVisited: 0,
          worldPercentage: 0,
        });
      }
    } catch (error) {
      console.error("Failed to load logs", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Debounced validation for location
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.city && formData.country) {
        validateLocation(formData.city, formData.country);
      } else if (formData.country && !formData.city) {
        validateCountry(formData.country);
      }
    }, 800); // Wait 800ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [formData.city, formData.country]);

  const validateCountry = async (country: string) => {
    if (!country.trim()) {
      setValidation(prev => ({ ...prev, country: "idle" }));
      return;
    }

    setValidation(prev => ({ ...prev, country: "validating" }));
    
    try {
      // Using REST Countries API to validate country
      const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=false`);
      
      if (response.ok) {
        const data = await response.json();
        const exactMatch = data.some((c: any) => 
          c.name.common.toLowerCase() === country.toLowerCase() ||
          c.name.official.toLowerCase() === country.toLowerCase()
        );
        
        if (exactMatch || data.length > 0) {
          setValidation(prev => ({ ...prev, country: "valid" }));
          setValidationMessage(`✓ ${data[0].name.common} found`);
        } else {
          setValidation(prev => ({ ...prev, country: "invalid" }));
          setValidationMessage("Country not found. Please check spelling.");
        }
      } else {
        setValidation(prev => ({ ...prev, country: "invalid" }));
        setValidationMessage("Country not found. Please check spelling.");
      }
    } catch (error) {
      console.error("Country validation error", error);
      setValidation(prev => ({ ...prev, country: "idle" }));
    }
  };

  const validateLocation = async (city: string, country: string) => {
    if (!city.trim() || !country.trim()) {
      setValidation({ country: "idle", city: "idle" });
      return;
    }

    setValidation({ country: "validating", city: "validating" });
    
    try {
      // Using OpenStreetMap Nominatim API for location validation
      const query = `${city}, ${country}`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'RootsApp/1.0'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.length > 0) {
          const result = data[0];
          setValidation({ country: "valid", city: "valid" });
          setValidationMessage(`✓ Location verified: ${result.display_name}`);
        } else {
          setValidation({ country: "invalid", city: "invalid" });
          setValidationMessage("Location not found. Please check city and country spelling.");
        }
      } else {
        setValidation({ country: "idle", city: "idle" });
        setValidationMessage("");
      }
    } catch (error) {
      console.error("Location validation error", error);
      setValidation({ country: "idle", city: "idle" });
      setValidationMessage("");
    }
  };

  const toggleNotes = (logId: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData({ ...formData, imageUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, imageUrl: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if location is validated when provided
    if (formData.country && validation.country === "invalid") {
      alert("Please enter a valid country name.");
      return;
    }

    if (formData.city && validation.city === "invalid") {
      alert("Please enter a valid city name.");
      return;
    }

    try {
      const response = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setFormData({
          type: "attraction",
          title: "",
          description: "",
          country: "",
          city: "",
          rating: 5,
          notes: "",
          imageUrl: "",
        });
        setImagePreview(null);
        setValidation({ country: "idle", city: "idle" });
        setValidationMessage("");
        setShowAddForm(false);
        loadLogs();
      }
    } catch (error) {
      console.error("Failed to add log", error);
    }
  };

  const handleDelete = async (logId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      const response = await fetch(`/api/logs?id=${logId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        loadLogs();
      }
    } catch (error) {
      console.error("Failed to delete log", error);
    }
  };

  const filteredLogs = filterType === "all" 
    ? logs 
    : logs.filter(log => log.type === filterType);

  const getValidationIcon = (field: "country" | "city") => {
    switch (validation[field]) {
      case "validating":
        return <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-emerald-400" />;
      case "valid":
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case "invalid":
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <DashboardPageLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Travel Logs</h1>
            <p className="mt-2 text-white/70">Track your global adventures and culinary experiences</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            <Plus className="h-5 w-5" />
            Add Entry
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-linear-to-br from-emerald-500/20 to-teal-500/20 p-6 backdrop-blur">
            <div className="flex items-center gap-3">
              <Globe2 className="h-8 w-8 text-emerald-400" />
              <div>
                <p className="text-xs uppercase tracking-wide text-white/60">World Explored</p>
                <p className="text-3xl font-bold text-white">{stats.worldPercentage}%</p>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-linear-to-r from-emerald-400 to-teal-400 transition-all duration-500"
                style={{ width: `${stats.worldPercentage}%` }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-xs uppercase tracking-wide text-white/60">Attractions</p>
                <p className="text-3xl font-bold text-white">{stats.totalAttractions}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center gap-3">
              <Utensils className="h-8 w-8 text-orange-400" />
              <div>
                <p className="text-xs uppercase tracking-wide text-white/60">Recipes Cooked</p>
                <p className="text-3xl font-bold text-white">{stats.totalRecipes}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center gap-3">
              <Globe2 className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-xs uppercase tracking-wide text-white/60">Countries</p>
                <p className="text-3xl font-bold text-white">{stats.countriesVisited}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
          >
            <h3 className="text-xl font-semibold text-white">Add New Entry</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-white/80">
                <span>Type</span>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "attraction" | "recipe" })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white"
                >
                  <option value="attraction">Attraction</option>
                  <option value="recipe">Recipe</option>
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-white/80">
                <span>Title *</span>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white placeholder:text-white/40"
                  placeholder="Name of place or recipe"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-white/80">
                <span>Country</span>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className={`w-full rounded-2xl border px-4 py-3 text-white placeholder:text-white/40 pr-12 ${
                      validation.country === "invalid"
                        ? "border-red-400/50 bg-red-950/20"
                        : validation.country === "valid"
                        ? "border-emerald-400/50 bg-emerald-950/20"
                        : "border-white/10 bg-slate-950/40"
                    }`}
                    placeholder="Country name"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getValidationIcon("country")}
                  </div>
                </div>
              </label>

              <label className="space-y-2 text-sm font-medium text-white/80">
                <span>City</span>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full rounded-2xl border px-4 py-3 text-white placeholder:text-white/40 pr-12 ${
                      validation.city === "invalid"
                        ? "border-red-400/50 bg-red-950/20"
                        : validation.city === "valid"
                        ? "border-emerald-400/50 bg-emerald-950/20"
                        : "border-white/10 bg-slate-950/40"
                    }`}
                    placeholder="City name"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getValidationIcon("city")}
                  </div>
                </div>
              </label>
            </div>

            {/* Validation Message */}
            {validationMessage && (
              <div className={`rounded-2xl border px-4 py-3 text-sm ${
                validation.country === "valid" && validation.city === "valid"
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                  : "border-yellow-400/40 bg-yellow-400/10 text-yellow-200"
              }`}>
                {validationMessage}
              </div>
            )}

            {/* Photo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">
                Photo (Optional)
              </label>
              {imagePreview ? (
                <div className="relative">
                  <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-white/10">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white transition hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-slate-950/40 transition hover:border-emerald-400/50 hover:bg-slate-950/60">
                  <Upload className="h-8 w-8 text-white/40" />
                  <span className="mt-2 text-sm text-white/60">Click to upload a photo</span>
                  <span className="mt-1 text-xs text-white/40">PNG, JPG up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <label className="space-y-2 text-sm font-medium text-white/80">
              <span>Description</span>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white placeholder:text-white/40"
                placeholder="Tell us about your experience..."
                rows={3}
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-white/80">
              <span>Rating: {formData.rating}/5</span>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="w-full"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-white/80">
              <span>Personal Notes</span>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white placeholder:text-white/40"
                placeholder="Private notes, tips, things to remember..."
                rows={2}
              />
              <p className="text-xs text-white/40">These are your personal notes that will be shown below each log entry.</p>
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-full bg-emerald-500 px-6 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Save Entry
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setImagePreview(null);
                  setValidation({ country: "idle", city: "idle" });
                  setValidationMessage("");
                }}
                className="rounded-full border border-white/20 px-6 py-2 font-semibold text-white transition hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(["all", "attraction", "recipe"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                filterType === type
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {type === "all" ? "All" : type === "attraction" ? "Attractions" : "Recipes"}
            </button>
          ))}
        </div>

        {/* Logs List */}
        {isLoading ? (
          <p className="text-center text-white/60">Loading your travel logs...</p>
        ) : filteredLogs.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur">
            <p className="text-white/60">No entries yet. Start logging your adventures!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLogs.map((log) => (
              <div
                key={log._id}
                className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur transition hover:bg-white/10 overflow-hidden"
              >
                {/* Image */}
                {log.imageUrl ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={log.imageUrl}
                      alt={log.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-linear-to-br from-slate-800/50 to-slate-900/50">
                    <ImageIcon className="h-16 w-16 text-white/20" />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {log.type === "attraction" ? (
                        <MapPin className="h-5 w-5 text-blue-400" />
                      ) : (
                        <Utensils className="h-5 w-5 text-orange-400" />
                      )}
                      <span className="text-xs uppercase tracking-wide text-white/50">
                        {log.type}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(log._id)}
                      className="opacity-0 transition group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4 text-red-400 hover:text-red-300" />
                    </button>
                  </div>

                  <h3 className="mt-3 text-xl font-semibold text-white">{log.title}</h3>
                  
                  {(log.city || log.country) && (
                    <p className="mt-1 text-sm text-emerald-400">
                      {[log.city, log.country].filter(Boolean).join(", ")}
                    </p>
                  )}

                  {log.description && (
                    <p className="mt-3 text-sm text-white/70 line-clamp-2">{log.description}</p>
                  )}

                  {log.rating && (
                    <div className="mt-3 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < log.rating! ? "fill-yellow-400 text-yellow-400" : "text-white/20"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Notes Section */}
                  {log.notes && (
                    <div className="mt-4">
                      <button
                        onClick={() => toggleNotes(log._id)}
                        className="flex items-center gap-2 text-xs text-white/60 hover:text-white/80 transition"
                      >
                        <FileText className="h-4 w-4" />
                        <span>{expandedNotes.has(log._id) ? "Hide" : "Show"} Personal Notes</span>
                      </button>
                      {expandedNotes.has(log._id) && (
                        <div className="mt-2 rounded-xl border border-white/10 bg-slate-950/40 p-3">
                          <p className="text-sm text-white/80 whitespace-pre-wrap">{log.notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="mt-4 text-xs text-white/40">
                    {new Date(log.visitedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardPageLayout>
  );
}