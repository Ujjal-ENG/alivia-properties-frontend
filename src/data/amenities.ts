export type AmenityCategory = {
  category: string
  icon: string
  items: string[]
}

export const AMENITIES: AmenityCategory[] = [
  {
    category: "Security",
    icon: "Shield",
    items: ["24/7 Security Guard", "CCTV Surveillance", "Video Intercom", "Gated Compound", "Fire Detection System"],
  },
  {
    category: "Parking",
    icon: "Car",
    items: ["Covered Parking", "Open Parking", "Visitor Parking", "Basement Parking"],
  },
  {
    category: "Utilities",
    icon: "Zap",
    items: [
      "Generator Backup",
      "Uninterrupted Power Supply",
      "Rooftop Solar Panel",
      "Gas Line",
      "Water Reservoir",
      "High-speed Internet",
    ],
  },
  {
    category: "Recreation",
    icon: "Dumbbell",
    items: [
      "Rooftop Garden",
      "Children's Play Area",
      "Community Hall",
      "Indoor Games Room",
      "Swimming Pool",
      "Gymnasium",
      "Jogging Track",
    ],
  },
  {
    category: "Elevator & Access",
    icon: "ArrowUpDown",
    items: ["Passenger Lift", "Service Lift", "Wheelchair Access", "Lobby with Reception"],
  },
  {
    category: "Comfort",
    icon: "Wind",
    items: [
      "Central AC",
      "Split AC in Bedrooms",
      "Modular Kitchen",
      "Built-in Wardrobes",
      "False Ceiling",
      "Premium Tiles",
    ],
  },
]

export const ALL_AMENITIES: string[] = AMENITIES.flatMap((c) => c.items)
