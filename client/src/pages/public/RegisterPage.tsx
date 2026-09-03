import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, BookOpen, Layers, Lock, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    course: 'B.Tech CSE',
    semester: '5th',
    enrollmentNumber: '',
    department: 'Computer Science & Engineering',
    college: 'University Institute of Engineering',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const courses = [
    'B.Tech CSE',
    'B.Tech AI & Data Science',
    'B.Tech ECE',
    'B.Tech Mechanical',
    'B.Tech Civil',
    'B.Tech Electrical',
    'BCA',
    'MCA',
    'M.Tech',
    'Polytechnic / Diploma',
  ];

  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Frontend validation
    if (formData.fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }

    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError('Mobile number must be a valid 10-digit Indian number.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, and numeric digits.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await register({ ...formData, mobile: cleanMobile });
    setLoading(false);

    if (result.success) {
      navigate('/student/dashboard');
    } else {
      setError(result.message || 'Registration failed. Please check your information.');
    }
  };

  return (
    <div className="py-16 bg-[#010914] min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8">
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 text-[#00D9FF] font-tech text-xs tracking-widest uppercase">
            <ShieldCheck className="w-4 h-4 text-[#FFC800]" />
            <span>STUDENT PORTAL ENROLLMENT</span>
          </div>
          <h1 className="font-anton text-4xl text-white tracking-wide">
            CREATE STUDENT <span className="text-[#FFC800]">ACCOUNT</span>
          </h1>
          <p className="font-oswald text-xs sm:text-sm text-[#8594A6] tracking-wider uppercase">
            ENGINEERING DAY 2026 • 14TH & 15TH SEPTEMBER
          </p>
        </div>

        {/* Form Card */}
        <div className="hud-card p-8 rounded-lg border border-[#00D9FF]/30 shadow-neon-cyan">
          {error && (
            <div className="mb-6 p-4 rounded bg-[#FF4444]/10 border border-[#FF4444]/40 text-[#FF4444] text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                FULL NAME <span className="text-[#FF4444]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8594A6] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Aryan Sharma"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#000510] border border-[#00D9FF]/20 rounded text-xs sm:text-sm text-white focus:outline-none focus:border-[#00D9FF]"
                />
              </div>
            </div>

            {/* Email & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                  EMAIL ADDRESS <span className="text-[#FF4444]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8594A6] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="student@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#000510] border border-[#00D9FF]/20 rounded text-xs sm:text-sm text-white focus:outline-none focus:border-[#00D9FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                  MOBILE NUMBER <span className="text-[#FF4444]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8594A6] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="mobile"
                    required
                    maxLength={10}
                    placeholder="10-digit number"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#000510] border border-[#00D9FF]/20 rounded text-xs sm:text-sm text-white focus:outline-none focus:border-[#00D9FF]"
                  />
                </div>
              </div>
            </div>

            {/* Course & Semester */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                  COURSE / BRANCH <span className="text-[#FF4444]">*</span>
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-[#8594A6] absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#000510] border border-[#00D9FF]/20 rounded text-xs sm:text-sm text-white focus:outline-none focus:border-[#00D9FF]"
                  >
                    {courses.map((c) => (
                      <option key={c} value={c} className="bg-[#000510]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                  SEMESTER <span className="text-[#FF4444]">*</span>
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 text-[#8594A6] absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#000510] border border-[#00D9FF]/20 rounded text-xs sm:text-sm text-white focus:outline-none focus:border-[#00D9FF]"
                  >
                    {semesters.map((s) => (
                      <option key={s} value={s} className="bg-[#000510]">
                        {s} Semester
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Enrollment / Roll Number (Optional) */}
            <div>
              <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                UNIVERSITY ENROLLMENT / ROLL NO (OPTIONAL)
              </label>
              <input
                type="text"
                name="enrollmentNumber"
                placeholder="e.g. 2026BTCS098"
                value={formData.enrollmentNumber}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#000510] border border-[#00D9FF]/20 rounded text-xs sm:text-sm text-white focus:outline-none focus:border-[#00D9FF]"
              />
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                  PASSWORD <span className="text-[#FF4444]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8594A6] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#000510] border border-[#00D9FF]/20 rounded text-xs sm:text-sm text-white focus:outline-none focus:border-[#00D9FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                  CONFIRM PASSWORD <span className="text-[#FF4444]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8594A6] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#000510] border border-[#00D9FF]/20 rounded text-xs sm:text-sm text-white focus:outline-none focus:border-[#00D9FF]"
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#8594A6] font-tech pt-1">
              * Password must be at least 8 characters with uppercase, lowercase, and numbers.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-base tracking-wider rounded shadow-neon-yellow transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-6"
            >
              {loading ? (
                <span>CREATING ACCOUNT...</span>
              ) : (
                <>
                  <span>COMPLETE REGISTRATION</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-[#8594A6]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00D9FF] font-tech font-bold hover:underline">
              Log In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
