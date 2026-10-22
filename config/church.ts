export const church = {
  name: "Church of Christ at Red Cross",
  address: "Mahatma Road, Blantyre, Malawi",
  timeZone: "Africa/Blantyre",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=52X9%2BHGP+Blantyre+Malawi",
  phone: "+265 (0) 888 565 565",
  phoneUrl: "tel:+265888565565",
  whatsappUrl: "https://wa.me/265888565565",
  email: "churchofchristatredcross@gmail.com",
  facebookUrl: "https://www.facebook.com/share/18ioYhR8RB/",
  youtubeUrl: "https://www.youtube.com/@churchofchristatredcross",
} as const;

export const sundayServices = [
  { language: "English", time: "7:00 AM", endTime: "9:00 AM" },
  { language: "Chichewa", time: "9:30 AM", endTime: "11:30 AM" },
] as const;

export const combinedService = {
  time: "8:00 AM",
  note: "On the last Sunday of each month, we meet together for one combined service at 8:00 AM.",
} as const;

export const homecellGathering = {
  day: "Wednesday",
  time: "6:00 PM",
  note: "In respective homes, according to each homecell’s program.",
} as const;
