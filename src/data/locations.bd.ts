export type Division = {
  name: string
  districts: District[]
}

export type District = {
  name: string
  areas: string[]
}

export const BD_DIVISIONS: Division[] = [
  {
    name: "Dhaka",
    districts: [
      {
        name: "Dhaka",
        areas: [
          "Bashundhara R/A",
          "Gulshan",
          "Banani",
          "Uttara",
          "Dhanmondi",
          "Mirpur",
          "Mohammadpur",
          "Banasree",
          "Purbachal",
          "Aftabnagar",
          "Baridhara",
          "Niketon",
          "Tejgaon",
          "Khilgaon",
          "Rampura",
          "Badda",
          "Jatrabari",
          "Lalbagh",
          "Old Dhaka",
          "Wari",
          "Shyamoli",
          "Adabor",
          "Rayerbazar",
        ],
      },
      {
        name: "Gazipur",
        areas: ["Gazipur Sadar", "Tongi", "Joydebpur", "Kaliakoir", "Kapasia"],
      },
      {
        name: "Narayanganj",
        areas: ["Narayanganj Sadar", "Sonargaon", "Araihazar", "Bandar"],
      },
      {
        name: "Manikganj",
        areas: ["Manikganj Sadar", "Singair", "Shibalaya"],
      },
    ],
  },
  {
    name: "Chattogram",
    districts: [
      {
        name: "Chattogram",
        areas: [
          "Agrabad",
          "GEC Circle",
          "Nasirabad",
          "Halishahar",
          "Panchlaish",
          "Khulshi",
          "Muradpur",
          "Bayezid",
          "Pahartali",
          "Oxygen",
          "Maizdia",
          "Chawk Bazar",
        ],
      },
      { name: "Cox's Bazar", areas: ["Cox's Bazar Sadar", "Teknaf", "Ukhia"] },
    ],
  },
  {
    name: "Sylhet",
    districts: [
      {
        name: "Sylhet",
        areas: ["Sylhet Sadar", "Zindabazar", "Ambarkhana", "Shahporan", "Tilagor"],
      },
      { name: "Moulvibazar", areas: ["Moulvibazar Sadar", "Sreemangal"] },
    ],
  },
  {
    name: "Rajshahi",
    districts: [
      {
        name: "Rajshahi",
        areas: ["Rajshahi Sadar", "Boalia", "Motihar", "Shah Makhdum", "Paba"],
      },
      { name: "Bogura", areas: ["Bogura Sadar", "Sherpur", "Gabtali"] },
    ],
  },
  {
    name: "Khulna",
    districts: [
      {
        name: "Khulna",
        areas: ["Khulna Sadar", "Sonadanga", "Khalishpur", "Daulatpur", "Boyra"],
      },
      { name: "Jessore", areas: ["Jessore Sadar", "Monirampur", "Jhikargachha"] },
    ],
  },
  {
    name: "Barishal",
    districts: [
      {
        name: "Barishal",
        areas: ["Barishal Sadar", "Natun Bazar", "Chawk Bazar", "Band Road"],
      },
    ],
  },
  {
    name: "Rangpur",
    districts: [
      {
        name: "Rangpur",
        areas: ["Rangpur Sadar", "Guptapara", "Mahiganj", "Kaunia"],
      },
      { name: "Dinajpur", areas: ["Dinajpur Sadar", "Birampur"] },
    ],
  },
  {
    name: "Mymensingh",
    districts: [
      {
        name: "Mymensingh",
        areas: ["Mymensingh Sadar", "Ganginarpar", "Shambhuganj"],
      },
    ],
  },
]

export const DIVISION_NAMES = BD_DIVISIONS.map((d) => d.name)

export function getDistricts(division: string): string[] {
  return BD_DIVISIONS.find((d) => d.name === division)?.districts.map((d) => d.name) ?? []
}

export function getAreas(division: string, district: string): string[] {
  return (
    BD_DIVISIONS.find((d) => d.name === division)
      ?.districts.find((d) => d.name === district)
      ?.areas ?? []
  )
}
