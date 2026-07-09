"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const carouselImages = [
  { url: "https://www.harveyprince.com/wp-content/uploads/2024/08/banner-bag.jpg", caption: "Premium Harvey Prince Products" },
  { url: "https://www.harveyprince.com/wp-content/uploads/2024/12/followme2.jpg", caption: "Cruelty-Free & Vegan" },
  { url: "https://www.harveyprince.com/wp-content/uploads/2024/08/24K-Gold-Pure-Luxury-Lift-Firm-Hydra-Gel-Eye-Patches-Peter-Thomas-Roth-Harvey-Prince-Organics-NY-USA-2.jpg", caption: "Luxury Skincare Solutions" },
];

export default function LoginPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showTruckToast, setShowTruckToast] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % carouselImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerMessage("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Enter a valid email";

    if (!formData.password)
      newErrors.password = "Password is required";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setServerMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setShowTruckToast(true);
        localStorage.setItem("token", data.token);

        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setServerMessage(data.message || "Invalid email or password.");
        setLoading(false);
      }
    } catch (err) {
      setServerMessage("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-3 sm:p-5 font-sans">
      <div className="flex w-full max-w-4xl min-h-[550px] rounded-2xl overflow-hidden shadow-2xl bg-white">

        {/* LEFT: Carousel - Hidden on Mobile */}
        <div className="relative hidden md:block w-1/2 min-h-[550px] overflow-hidden shrink-0">
          {carouselImages.map((img, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"
                }`}
            >
              <img
                src={img.url}
                alt={img.caption}
                className="w-full h-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
              <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          ))}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {carouselImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2.5 rounded-full border-none cursor-pointer transition-all duration-300 ${i === current ? "w-7 bg-white" : "w-2.5 bg-white/50"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT: Form */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-10 sm:py-12 bg-white">
          <div className="flex flex-col items-center mb-6">
            <img
              src="/logo.svg"
              alt="OrderPilot Logo"
              className="w-40 object-contain mb-2"
            />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1 text-center">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-400 mb-7 text-center">
            Please login to your account
          </p>

          <div className="w-full max-w-xs sm:max-w-sm">
            {/* Email */}
            <div className="mb-3">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl text-sm text-slate-700 bg-slate-50 outline-none border transition-all duration-200 focus:border-amber-500 focus:bg-white ${errors.email ? "border-red-400" : "border-slate-200"
                  }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-6 relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit(e);
                }}
                className={`w-full px-4 py-3 pr-11 rounded-xl text-sm text-slate-700 bg-slate-50 outline-none border transition-all duration-200 focus:border-amber-500 focus:bg-white ${errors.password ? "border-red-400" : "border-slate-200"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer p-1"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.428-1.581c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m-5.858-.908a3 3 0 00-4.243-4.243" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.password}
                </p>
              )}
            </div>

            {serverMessage && (
              <div
                className={`mb-4 text-sm px-4 py-2.5 rounded-lg border ${serverMessage.includes("successful")
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-600 border-red-200"
                  }`}
              >
                {serverMessage}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 flex items-center justify-center gap-2 bg-slate-800 disabled:bg-slate-500 disabled:cursor-not-allowed text-white text-base font-bold rounded-xl transition-all duration-200 hover:bg-slate-900 tracking-wide"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div
        className={`fixed top-5 right-5 bg-white px-6 py-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 z-50 flex items-center gap-5 overflow-hidden min-w-70 transition-all duration-500 ease-out ${showTruckToast
          ? "translate-x-0 opacity-100"
          : "translate-x-[120%] opacity-0"
          }`}
      >
        <div className="relative w-16 h-10 overflow-hidden bg-slate-50 rounded-lg">
          <div className="absolute bottom-1 left-0 w-full h-1 bg-slate-200 rounded-full z-0"></div>
          <div
            className="absolute left-0 flex items-center h-full z-10"
            style={{ animation: "drive 2s linear infinite" }}
          >
            <span
              className="text-3xl inline-block"
              style={{ transform: "scaleX(-1)" }}
            >
              🐎
            </span>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">
            Login Successful!
          </h3>
          <p className="text-xs text-slate-500">Redirecting to dashboard...</p>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes drive {
          0% { transform: translateX(-35px); }
          100% { transform: translateX(65px); }
        }
      `,
        }}
      />
    </div>
  );
}
