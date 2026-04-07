"use client";
import { useState, useRef, useEffect } from "react";
import { Upload, Eye, EyeOff, ChevronDown, XCircle, X, Plus, Minus } from "lucide-react";

type UserType = "patient" | "doctor" | "technician";

interface DocTech {
  id: number;
  firstName: string;
  lastName: string;
  doctorCode?: string;
  technicianCode?: string;
}

interface AddUserPageProps {
  type: UserType;
  onBack: (successMessage?: string) => void;
}

const V = {
  // Allows Arabic and Latin letters only, between 2 and 10 characters
  name: (v: string) =>
    /^[a-zA-Z\u0600-\u06FF\s'-]{2,10}$/.test(v.trim())
      ? null : "Letters only, 2–10 chars",

  // Allows letters, numbers, and common symbols between 3 and 30 chars
  username: (v: string) =>
    /^[a-zA-Z0-9_!@#$%^&*]{3,30}$/.test(v.trim())
      ? null : "3–30 chars, letters/numbers/symbols",

  // Enforces a strong password: length, lowercase, uppercase, digit, and symbol
  password: (v: string) => {
    if (v.length < 8)     return "Minimum 8 characters";
    if (!/[a-z]/.test(v)) return "Must contain at least one lowercase letter";
    if (!/[A-Z]/.test(v)) return "Must contain at least one uppercase letter";
    if (!/[0-9]/.test(v)) return "Must contain at least one number";
    if (!/[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?]/.test(v))
                          return "Must contain at least one symbol";
    return null;
  },

  email: (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : "Invalid email format",

  // Strips the +966 prefix and leading zero, then validates a 9-digit Saudi number starting with 53/54/55
  phone: (v: string) => {
    const digits = v.replace(/^\+966/, "").replace(/^0/, "").replace(/\D/g, "");
    if (digits.length === 0)     return "Required";
    if (!/^\d+$/.test(digits))   return "Numbers only";
    if (digits.length !== 9)     return "Must be exactly 9 digits";
    if (!/^5[345]/.test(digits)) return "Must start with 53, 54, or 55";
    return null;
  },

  nationalId: (v: string) =>
    /^\d{10}$/.test(v.trim()) ? null : "Must be exactly 10 digits",

  specialty: (v: string) =>
    v.trim().length >= 2 && /^[a-zA-Z\u0600-\u06FF\s'-]+$/.test(v.trim())
      ? null : "Letters only",

  licenseNumber: (v: string) =>
    v.trim().length === 0 ? "Required" :
    v.trim().length > 20  ? "Max 20 characters" :
    null,

  required: (v: string) => v.trim() !== "" ? null : "Required",

  // Validates the selected profile picture: type and max size
  image: (file: File | null) => {
    if (!file) return null;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "JPG, PNG or WEBP only";
    if (file.size > 5 * 1024 * 1024) return "Max file size is 5MB";
    return null;
  },
};

/* ── Shared UI ── */
const Star = () => <span className="text-red-400 ml-0.5">*</span>;
const Err  = ({ msg }: { msg?: string | null }) =>
  msg ? <p className="text-red-400 text-[10px] mt-0.5">{msg}</p> : null;

const Field = ({ label, required, error, children }: {
  label: string; required?: boolean; error?: string | null; children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-white text-xs lg:text-sm">{label}{required && <Star />}</span>
    {children}
    <Err msg={error} />
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3 mb-1">
    <span className="text-gray-400 text-[10px] lg:text-xs font-semibold uppercase tracking-widest whitespace-nowrap">{children}</span>
    <div className="flex-1 border-t border-white/10" />
  </div>
);

const inp = (err?: string | null) =>
  `w-full bg-[#040A16] border ${err ? "border-red-500/50" : "border-[#1e2d42]"} focus:border-[#17387C] rounded-lg px-2 py-1.5 lg:px-3 lg:py-2 text-white text-xs lg:text-sm outline-none transition-colors`;

/* ── Custom Dropdown ── */
function DD({ label, value, onChange, options, required, error, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { label: string; value: string }[];
  required?: boolean; error?: string | null; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const ref    = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) &&
          btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Calculate dropdown position relative to the viewport before opening
  const handleOpen = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX, width: r.width });
    }
    setOpen((p) => !p);
  };

  const selected = options.find((o) => o.value === value);
  return (
    <Field label={label} required={required} error={error}>
      <div className="relative">
        <button ref={btnRef} type="button" onClick={handleOpen}
          className={`w-full flex items-center justify-between bg-[#040A16] border ${
            error ? "border-red-500/50" : "border-[#1e2d42]"
          } rounded-lg px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm transition-colors cursor-pointer`}>
          <span className={selected ? "text-white" : "text-gray-600 text-xs"}>
            {selected?.label ?? placeholder ?? "Select…"}
          </span>
          <ChevronDown size={13} className={`text-gray-500 transition-transform flex-shrink-0 ml-1 ${open ? "rotate-180" : ""}`} />
        </button>
        {open && typeof window !== "undefined" && (
          <div ref={ref}
            style={{ position: "fixed", top: dropPos.top, left: dropPos.left, width: dropPos.width, zIndex: 9999 }}
            className="bg-[#0D1A2D] border border-white/15 rounded-lg shadow-2xl max-h-44 overflow-y-auto">
            {options.length === 0 && <div className="px-3 py-2 text-gray-500 text-xs">No options</div>}
            {options.map((o) => (
              <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs lg:text-sm cursor-pointer transition-colors ${
                  value === o.value ? "bg-[#17387C] text-white" : "text-gray-300 hover:bg-[#1a2a3a] hover:text-white"
                }`}>{o.label}</button>
            ))}
          </div>
        )}
      </div>
    </Field>
  );
}

/* ── Stepper for years of experience ── */
function ExperienceCounter({ value, onChange, error }: {
  value: string; onChange: (v: string) => void; error?: string | null;
}) {
  const num = parseInt(value) || 0;
  return (
    <Field label="Experience (yrs)" required error={error}>
      <div className={`flex items-center bg-[#040A16] border ${error ? "border-red-500/50" : "border-[#1e2d42]"} rounded-lg overflow-hidden transition-colors`}>
        <button type="button" onClick={() => num > 0  && onChange(String(num - 1))}
          disabled={num <= 0}
          className="px-2 lg:px-3 py-1.5 lg:py-2 text-gray-400 hover:text-white hover:bg-[#17387C]/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex-shrink-0 border-r border-[#1e2d42]">
          <Minus size={12} />
        </button>
        <span className="flex-1 text-center text-white text-xs lg:text-sm select-none">
          {num}
        </span>
        <button type="button" onClick={() => num < 40 && onChange(String(num + 1))}
          disabled={num >= 40}
          className="px-2 lg:px-3 py-1.5 lg:py-2 text-gray-400 hover:text-white hover:bg-[#17387C]/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex-shrink-0 border-l border-[#1e2d42]">
          <Plus size={12} />
        </button>
      </div>
    </Field>
  );
}

/* ============================================================ MAIN COMPONENT */
export default function AddUser({ type, onBack }: AddUserPageProps) {
  const [doctors,     setDoctors]     = useState<DocTech[]>([]);
  const [technicians, setTechnicians] = useState<DocTech[]>([]);

  // Load doctor and technician lists only when adding a patient (needed for assignment dropdowns)
  useEffect(() => {
    if (type !== "patient") return;
    fetch("/api/admin/users?role=doctor")
      .then((r) => r.json()).then((d) => { if (d.status === "ok") setDoctors(d.users); });
    fetch("/api/admin/users?role=technician")
      .then((r) => r.json()).then((d) => { if (d.status === "ok") setTechnicians(d.users); });
  }, [type]);

  const [form, setForm] = useState({
    first_name: "", middle_name: "", last_name: "", gender: "",
    username: "", password: "", email: "", phone: "", is_active: "1",
    national_id: "", date_of_birth: "", assign_doctor: "", assign_tech: "",
    code: "", specialty: "", license_number: "", years_experience: "0",
  });

  const [image,     setImage]     = useState<File | null>(null);
  const [preview,   setPreview]   = useState<string | null>(null);
  const [showPwd,   setShowPwd]   = useState(false);
  const [errors,    setErrors]    = useState<Record<string, string | null>>({});
  const [saving,    setSaving]    = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Helper: update a single form field
  const f = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));
  // Helper: update a single field error
  const e = (key: string, val: string | null) => setErrors((p) => ({ ...p, [key]: val }));

  // Live check: hit the API to see if the username is already taken
  const checkUsername = async (val: string) => {
    const localErr = V.username(val);
    if (localErr) { e("username", localErr); return; }
    try {
      const res  = await fetch(`/api/admin/users/check?field=username&value=${encodeURIComponent(val)}`);
      const data = await res.json();
      e("username", data.exists ? "Username already exists" : null);
    } catch { e("username", null); }
  };

  // Handle profile image selection: validate then generate a preview URL
  const handleImage = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0] ?? null;
    const err  = V.image(file);
    e("image", err);
    if (!err && file) { setImage(file); setPreview(URL.createObjectURL(file)); }
  };

  // Run all field validators before submitting — returns true only if everything passes
  const validate = () => {
    const errs: Record<string, string | null> = {};
    errs.first_name   = V.name(form.first_name);
    errs.last_name    = V.name(form.last_name);
    errs.middle_name  = form.middle_name.trim() ? V.name(form.middle_name) : null;
    errs.gender       = V.required(form.gender);
    errs.username     = V.username(form.username);
    errs.password     = V.password(form.password);
    errs.email        = form.email.trim() ? V.email(form.email) : null;
    errs.phone        = V.phone(form.phone);
    if (type === "patient") {
      errs.national_id   = V.nationalId(form.national_id);
      const dobParts = form.date_of_birth ? form.date_of_birth.split("-") : [];
      errs.date_of_birth = (dobParts.length === 3 && dobParts.every(p => p.trim() !== "")) ? null : "Required";
      errs.assign_doctor = V.required(form.assign_doctor);
      errs.assign_tech   = V.required(form.assign_tech);
    }
    if (type === "doctor" || type === "technician") {
      errs.code             = V.required(form.code);
      errs.specialty        = V.specialty(form.specialty);
      errs.license_number   = V.licenseNumber(form.license_number);
      errs.years_experience = V.required(form.years_experience);
    }
    setErrors((prev) => ({ ...prev, ...errs, username: errs.username ?? prev.username }));
    return Object.values({ ...errs }).every((v) => !v) && !errors.username;
  };

  // Build a FormData payload and POST to the create endpoint
  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true); setServerErr(null);
    try {
      const fd = new FormData();
      fd.append("type", type);
      Object.entries(form).forEach(([k, v]) => {
        if (v === "") return;
        fd.append(k, v);
      });
      if (image) fd.append("profile_picture", image);

      const res  = await fetch("/api/admin/users/create", { method: "POST", body: fd });
      const data = await res.json();

      if (data.status !== "ok") {
        // Show field-level error if the server returns a specific field name
        if (data.field) {
          setErrors((prev) => ({ ...prev, [data.field]: data.message }));
        } else {
          setServerErr(data.message || "Something went wrong");
        }
        return;
      }

      // Navigate back to the list and pass a success message
      const label = type === "patient" ? "Patient" : type === "doctor" ? "Doctor" : "Technician";
      onBack(`${label} added successfully`);
    } catch {
      setServerErr("Connection error. Please try again.");
    } finally { setSaving(false); }
  };

  const title = type === "patient" ? "Add Patient" : type === "doctor" ? "Add Doctor" : "Add Technician";

  return (
    <>
      <style>{`
        .ps::-webkit-scrollbar{width:4px}
        .ps::-webkit-scrollbar-track{background:#040A16}
        .ps::-webkit-scrollbar-thumb{background:#1e2d42;border-radius:4px}
        input[type="date"] { color-scheme: dark; }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.4) sepia(1) saturate(3) hue-rotate(180deg); cursor: pointer;
        }
        input[type="date"]::-webkit-datetime-edit { color: white; font-family: Arial, sans-serif; direction: ltr; unicode-bidi: embed; }
        input[type="date"]::-webkit-datetime-edit-fields-wrapper { direction: ltr; }
        input[type="date"]::-webkit-datetime-edit-month-field,
        input[type="date"]::-webkit-datetime-edit-day-field,
        input[type="date"]::-webkit-datetime-edit-year-field { color: white; font-family: Arial, sans-serif; }
        input[type="date"]::-webkit-datetime-edit-text { color: gray; }
        input[type="date"]::-webkit-datetime-edit-fields-wrapper { padding: 0; }
      `}</style>

      <div className="fixed inset-0 bg-[#040A16] z-50 flex flex-col overflow-hidden">
        <div className="max-w-6xl w-full mx-auto px-3 md:px-6 lg:px-8 pt-4 md:pt-5 lg:pt-6 pb-4 md:pb-5 lg:pb-6 flex flex-col h-full">

          <div className="relative flex items-center mb-3 lg:mb-4 flex-shrink-0 h-8 lg:h-10">
            <h2 className="w-full text-center text-white font-bold text-lg md:text-xl lg:text-3xl">
              {title}
            </h2>
          </div>

          {serverErr && (
            <div className="mb-2 lg:mb-3 bg-red-900/30 border border-red-500/30 rounded-xl px-3 py-2 text-red-300 text-xs lg:text-sm flex items-start gap-2 lg:gap-3 flex-shrink-0">
              <XCircle size={13} className="flex-shrink-0 mt-0.5 text-red-400" />
              <span>{serverErr}</span>
            </div>
          )}

          <div className="bg-[#0D1A2D] border border-white/10 rounded-2xl flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6 flex flex-col gap-3 lg:gap-4 min-h-0">

              {/* ── Avatar + Personal Info ── */}
              <div className="flex flex-row gap-3 md:gap-5 lg:gap-7 items-start flex-shrink-0">

                {/* Avatar uploader */}
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className="relative w-[120px] h-[120px] md:w-[130px] md:h-[130px] lg:w-[150px] lg:h-[150px]">
                    <div
                      onClick={() => !preview && fileRef.current?.click()}
                      className={`w-full h-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden relative transition-colors ${
                        preview ? "cursor-default" : "cursor-pointer"
                      } ${errors.image ? "border-red-500/50" : preview ? "border-[#17387C]" : "border-[#1e2d42] hover:border-[#17387C]"} bg-[#040A16]`}
                    >
                      {preview ? (
                        <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-gray-600 pointer-events-none">
                          <Upload size={18} className="md:hidden" />
                          <Upload size={22} className="hidden md:block lg:hidden" />
                          <Upload size={26} className="hidden lg:block" />
                          <span className="text-[9px] md:text-[10px] lg:text-[11px] text-center leading-snug px-1">JPG, PNG,or WEBP only<br />Max 5MB</span>
                        </div>
                      )}
                    </div>
                    {preview && (
                      <button type="button" title="Remove image"
                        onClick={() => { setImage(null); setPreview(null); e("image", V.image(null)); if (fileRef.current) fileRef.current.value = ""; }}
                        className="absolute -top-2 -right-2 w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-[#0D1A2D] border border-red-500/50 hover:bg-red-500/20 hover:border-red-400 flex items-center justify-center shadow-lg transition-all z-10 group">
                        <X size={11} className="text-red-400 group-hover:text-red-300 lg:hidden" />
                        <X size={13} className="text-red-400 group-hover:text-red-300 hidden lg:block" />
                      </button>
                    )}
                  </div>
                  <Err msg={errors.image} />
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImage} />
                </div>

                {/* Personal information fields */}
                <div className="flex-1 min-w-0 flex flex-col gap-2 md:gap-3">
                  <SectionLabel>Personal Information</SectionLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 md:gap-x-4 lg:gap-x-5 gap-y-3 lg:gap-y-4">

                    <Field label="First Name" required error={errors.first_name}>
                      <input className={inp(errors.first_name)} value={form.first_name}
                        onChange={(ev) => {
                          const val = ev.target.value.replace(/[^a-zA-Z\u0600-\u06FF\s'-]/g, "");
                          f("first_name", val); e("first_name", V.name(val));
                        }} />
                    </Field>

                    <Field label="Middle Name" error={errors.middle_name}>
                      <input className={inp(errors.middle_name)} value={form.middle_name}
                        onChange={(ev) => {
                          const val = ev.target.value.replace(/[^a-zA-Z\u0600-\u06FF\s'-]/g, "");
                          f("middle_name", val); e("middle_name", val.trim() ? V.name(val) : null);
                        }} />
                    </Field>

                    <Field label="Last Name" required error={errors.last_name}>
                      <input className={inp(errors.last_name)} value={form.last_name}
                        onChange={(ev) => {
                          const val = ev.target.value.replace(/[^a-zA-Z\u0600-\u06FF\s'-]/g, "");
                          f("last_name", val); e("last_name", V.name(val));
                        }} />
                    </Field>

                    <DD label="Gender" required value={form.gender} error={errors.gender}
                      onChange={(v) => { f("gender", v); e("gender", null); }}
                      options={[{ label: "Male", value: "male" }, { label: "Female", value: "female" }]} />

                    {type === "patient" && <>
                      <Field label="National ID/Iqama" required error={errors.national_id}>
                        <input className={inp(errors.national_id)} placeholder="10 digits"
                          value={form.national_id}
                          onKeyDown={(ev) => { if (!/[\d\b]/.test(ev.key) && !["ArrowLeft","ArrowRight","Delete","Tab"].includes(ev.key)) ev.preventDefault(); }}
                          onChange={(ev) => {
                            const val = ev.target.value.replace(/\D/g, "").slice(0, 10);
                            f("national_id", val); e("national_id", V.nationalId(val));
                          }} />
                      </Field>

                      <Field label="Date of Birth" required error={errors.date_of_birth}>
                        <input type="date" lang="en"
                          className={inp(errors.date_of_birth) + " cursor-pointer"}
                          value={form.date_of_birth}
                          max={new Date().toISOString().split("T")[0]}
                          style={{ colorScheme: "dark" }}
                          onChange={(ev) => { f("date_of_birth", ev.target.value); e("date_of_birth", V.required(ev.target.value)); }} />
                      </Field>
                    </>}

                    {(type === "doctor" || type === "technician") && (
                      <Field label={type === "doctor" ? "Doctor Code" : "Technician Code"} required error={errors.code}>
                        <input className={inp(errors.code)} value={form.code}
                          onChange={(ev) => { f("code", ev.target.value); e("code", V.required(ev.target.value)); }} />
                      </Field>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Account Information ── */}
              <div className="flex flex-col gap-2 lg:gap-4">
                <SectionLabel>Account Information</SectionLabel>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 md:gap-x-4 lg:gap-x-5 gap-y-3 lg:gap-y-4">

                  <Field label="Username" required error={errors.username}>
                    <input className={inp(errors.username)} value={form.username}
                      onChange={(ev) => { f("username", ev.target.value); }}
                      // Trigger uniqueness check when the user leaves the field
                      onBlur={(ev) => checkUsername(ev.target.value)} />
                  </Field>

                  <Field label="Password" required error={errors.password}>
                    <div className="relative">
                      <input type={showPwd ? "text" : "password"} className={inp(errors.password) + " pr-7"}
                        value={form.password}
                        onChange={(ev) => { f("password", ev.target.value); e("password", V.password(ev.target.value)); }} />
                      <button type="button" title={showPwd ? "Hide password" : "Show password"}
                        onClick={() => setShowPwd((p) => !p)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer">
                        {showPwd ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                  </Field>

                  <Field label="Email" error={errors.email}>
                    <input type="email" className={inp(errors.email)} value={form.email}
                      onChange={(ev) => {
                        f("email", ev.target.value);
                        e("email", ev.target.value.trim() ? V.email(ev.target.value) : null);
                      }} />
                  </Field>

                  {/* Phone with a fixed +966 prefix */}
                  <Field label="Phone" required error={errors.phone}>
                    <div className={`flex items-center bg-[#040A16] border ${errors.phone ? "border-red-500/50" : "border-[#1e2d42]"} focus-within:border-[#17387C] rounded-lg overflow-hidden transition-colors`}>
                      <span className="text-gray-400 text-xs lg:text-sm px-2 lg:px-3 border-r border-[#1e2d42] whitespace-nowrap select-none">+966</span>
                      <input
                        className="flex-1 bg-transparent px-2 lg:px-3 py-1.5 lg:py-2 text-white text-xs lg:text-sm outline-none"
                        placeholder="53/54/55XXXXXXX"
                        value={form.phone.replace(/^\+966/, "").replace(/^0/, "")}
                        maxLength={9}
                        onKeyDown={(ev) => { if (!/[\d\b]/.test(ev.key) && !["ArrowLeft","ArrowRight","Delete","Tab"].includes(ev.key)) ev.preventDefault(); }}
                        onChange={(ev) => {
                          const raw = ev.target.value.replace(/\D/g, "").slice(0, 9);
                          f("phone", "+966" + raw);
                          e("phone", V.phone("+966" + raw));
                        }}
                      />
                    </div>
                  </Field>

                  <DD label="Status" required value={form.is_active} error={errors.is_active}
                    onChange={(v) => f("is_active", v)}
                    options={[{ label: "Active", value: "1" }, { label: "Inactive", value: "0" }]} />

                  {type === "patient" && <>
                    <DD label="Assign Doctor" required value={form.assign_doctor} error={errors.assign_doctor}
                      onChange={(v) => { f("assign_doctor", v); e("assign_doctor", null); }} placeholder="Select…"
                      options={doctors.map((d) => ({ label: `${d.firstName} ${d.lastName}`, value: String(d.id) }))} />
                    <DD label="Assign Technician" required value={form.assign_tech} error={errors.assign_tech}
                      onChange={(v) => { f("assign_tech", v); e("assign_tech", null); }} placeholder="Select…"
                      options={technicians.map((t) => ({ label: `${t.firstName} ${t.lastName}`, value: String(t.id) }))} />
                  </>}
                </div>
              </div>

              {/* ── Professional Information (doctor / technician only) ── */}
              {(type === "doctor" || type === "technician") && <>
                <div className="border-t border-white/8" />
                <div className="flex flex-col gap-2 lg:gap-4">
                  <SectionLabel>Professional Information</SectionLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 md:gap-x-4 lg:gap-x-5 gap-y-3 lg:gap-y-4">

                    <Field label="License Number" required error={errors.license_number}>
                      <input
                        className={inp(errors.license_number)}
                        value={form.license_number}
                        maxLength={20}
                        onChange={(ev) => {
                          f("license_number", ev.target.value);
                          e("license_number", V.licenseNumber(ev.target.value));
                        }} />
                    </Field>

                    <Field label="Specialty" required error={errors.specialty}>
                      <input className={inp(errors.specialty)} value={form.specialty}
                        onChange={(ev) => {
                          const val = ev.target.value.replace(/[^a-zA-Z\u0600-\u06FF\s'-]/g, "");
                          f("specialty", val); e("specialty", V.specialty(val));
                        }} />
                    </Field>

                    <ExperienceCounter
                      value={form.years_experience}
                      onChange={(v) => { f("years_experience", v); e("years_experience", V.required(v)); }}
                      error={errors.years_experience}
                    />

                  </div>
                </div>
              </>}

            </div>

            {/* ── Footer actions ── */}
            <div className="flex items-center justify-end gap-2 md:gap-3 lg:gap-4 py-3 lg:py-4 px-3 md:px-4 lg:px-6 flex-shrink-0">
              <button onClick={() => onBack()}
                className="px-4 md:px-6 lg:px-10 py-2 lg:py-2.5 rounded-full border border-white/25 text-white text-xs lg:text-sm hover:bg-white/5 transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={saving}
                className="px-4 md:px-6 lg:px-10 py-2 lg:py-2.5 rounded-full bg-[#17387C] text-white text-xs lg:text-sm font-semibold hover:bg-[#1e4a9e] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2">
                {saving && <span className="w-3 h-3 lg:w-3.5 lg:h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? "Saving…" : "Save"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}