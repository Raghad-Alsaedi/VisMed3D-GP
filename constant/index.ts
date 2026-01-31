export const NAV_LINKS_DOCTOR = [
  {
    href: "/doctor",
    Key: "doctor_home",
    label: "Home",
    icon: "M6 19h3.692v-5.884h4.616V19H18v-9l-6-4.538L6 10zm-1 1V9.5l7-5.288L19 9.5V20h-5.692v-5.884h-2.616V20zm7-7.77",
  },
  {
    href: "/doctor/patients",
    Key: "doctor_patients",
    label: "Patients",
    icon: "M19 20.75a1 1 0 0 0 1-1v-1.246c.004-2.806-3.974-5.004-8-5.004s-8 2.198-8 5.004v1.246a1 1 0 0 0 1 1zM15.604 6.854a3.604 3.604 0 1 1-7.208 0a3.604 3.604 0 0 1 7.208 0",
  },
];

export const NAV_LINKS_TECH = [
  {
    href: "/radio_tech",
    Key: "radiology_technician_home",
    label: "Home",
    icon: "M6 19h3.692v-5.884h4.616V19H18v-9l-6-4.538L6 10zm-1 1V9.5l7-5.288L19 9.5V20h-5.692v-5.884h-2.616V20zm7-7.77",
  },
  {
    href: "/radio_tech/uploadFile",
    Key: "radiology_technician_Upload",
    label: "Upload",
    icon: "M11.5 17.77h1v-4.695l2.1 2.1l.708-.713L12 11.154l-3.308 3.308l.714.707l2.094-2.094zM6.616 21q-.691 0-1.153-.462T5 19.385V4.615q0-.69.463-1.152T6.616 3H14.5L19 7.5v11.885q0 .69-.462 1.153T17.384 21zM14 8V4H6.616q-.231 0-.424.192T6 4.615v14.77q0 .23.192.423t.423.192h10.77q.23 0 .423-.192t.192-.424V8zM6 4v4zv16z",
  },
];

export const LOG_OUT = [
  {
    href: "/logout",
    Key: "log_out",
    label: "Log Out",
    icon1:
      "M5 5h6c.55 0 1-.45 1-1s-.45-1-1-1H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h6c.55 0 1-.45 1-1s-.45-1-1-1H5z",
    icon2:
      "m20.65 11.65l-2.79-2.79a.501.501 0 0 0-.86.35V11h-7c-.55 0-1 .45-1 1s.45 1 1 1h7v1.79c0 .45.54.67.85.35l2.79-2.79c.2-.19.2-.51.01-.7",
  },
];

export const LOG_IN = [
  { href: "/doctor", key: "doctor", label: "Doctor" },
  {
    href: "/radio_tech",
    key: "radiology technician",
    label: "Radiology Technician",
  },
  { href: "/patients", key: "patients", label: "Patient" },
];
