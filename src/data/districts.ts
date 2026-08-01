export interface District {
  id: string;
  nameEn: string;
  nameBn: string;
  divisionEn: string;
  divisionBn: string;
  lat: number;
  long: number;
  isMainCity?: boolean;
}

export const DISTRICTS_64: District[] = [
  {
    "id": "dhaka",
    "nameEn": "Dhaka",
    "nameBn": "ঢাকা",
    "divisionEn": "Dhaka",
    "divisionBn": "ঢাকা",
    "lat": 23.7115253,
    "long": 90.4111451
  },
  {
    "id": "faridpur",
    "nameEn": "Faridpur",
    "nameBn": "ফরিদপুর",
    "divisionEn": "Dhaka",
    "divisionBn": "ঢাকা",
    "lat": 23.6070822,
    "long": 89.8429406
  },
  {
    "id": "gazipur",
    "nameEn": "Gazipur",
    "nameBn": "গাজীপুর",
    "divisionEn": "Dhaka",
    "divisionBn": "ঢাকা",
    "lat": 24.0022858,
    "long": 90.4264283
  },
  {
    "id": "gopalganj",
    "nameEn": "Gopalganj",
    "nameBn": "গোপালগঞ্জ",
    "divisionEn": "Dhaka",
    "divisionBn": "ঢাকা",
    "lat": 23.0050857,
    "long": 89.8266059
  },
  {
    "id": "jamalpur",
    "nameEn": "Jamalpur",
    "nameBn": "জামালপুর",
    "divisionEn": "Mymensingh",
    "divisionBn": "ময়মনসিংহ",
    "lat": 24.937533,
    "long": 89.937775
  },
  {
    "id": "kishoreganj",
    "nameEn": "Kishoreganj",
    "nameBn": "কিশোরগঞ্জ",
    "divisionEn": "Dhaka",
    "divisionBn": "ঢাকা",
    "lat": 24.444937,
    "long": 90.776575
  },
  {
    "id": "madaripur",
    "nameEn": "Madaripur",
    "nameBn": "মাদারীপুর",
    "divisionEn": "Dhaka",
    "divisionBn": "ঢাকা",
    "lat": 23.164102,
    "long": 90.1896805
  },
  {
    "id": "manikganj",
    "nameEn": "Manikganj",
    "nameBn": "মানিকগঞ্জ",
    "divisionEn": "Dhaka",
    "divisionBn": "ঢাকা",
    "lat": 23.8644,
    "long": 90.0047
  },
  {
    "id": "munshiganj",
    "nameEn": "Munshiganj",
    "nameBn": "মুন্সিগঞ্জ",
    "divisionEn": "Dhaka",
    "divisionBn": "ঢাকা",
    "lat": 23.5422,
    "long": 90.5305
  },
  {
    "id": "mymensingh",
    "nameEn": "Mymensingh",
    "nameBn": "ময়মনসিংহ",
    "divisionEn": "Mymensingh",
    "divisionBn": "ময়মনসিংহ",
    "lat": 24.7471,
    "long": 90.4203
  },
  {
    "id": "narayanganj",
    "nameEn": "Narayanganj",
    "nameBn": "নারায়াণগঞ্জ",
    "divisionEn": "Dhaka",
    "divisionBn": "ঢাকা",
    "lat": 23.63366,
    "long": 90.496482
  },
  {
    "id": "narsingdi",
    "nameEn": "Narsingdi",
    "nameBn": "নরসিংদী",
    "divisionEn": "Dhaka",
    "divisionBn": "ঢাকা",
    "lat": 23.932233,
    "long": 90.71541
  },
  {
    "id": "netrokona",
    "nameEn": "Netrokona",
    "nameBn": "নেত্রকোণা",
    "divisionEn": "Mymensingh",
    "divisionBn": "ময়মনসিংহ",
    "lat": 24.870955,
    "long": 90.727887
  },
  {
    "id": "rajbari",
    "nameEn": "Rajbari",
    "nameBn": "রাজবাড়ি",
    "divisionEn": "Dhaka",
    "divisionBn": "ঢাকা",
    "lat": 23.7574305,
    "long": 89.6444665
  },
  {
    "id": "shariatpur",
    "nameEn": "Shariatpur",
    "nameBn": "শরীয়তপুর",
    "divisionEn": "Dhaka",
    "divisionBn": "ঢাকা",
    "lat": 23.2423,
    "long": 90.4348
  },
  {
    "id": "sherpur",
    "nameEn": "Sherpur",
    "nameBn": "শেরপুর",
    "divisionEn": "Mymensingh",
    "divisionBn": "ময়মনসিংহ",
    "lat": 25.0204933,
    "long": 90.0152966
  },
  {
    "id": "tangail",
    "nameEn": "Tangail",
    "nameBn": "টাঙ্গাইল",
    "divisionEn": "Dhaka",
    "divisionBn": "ঢাকা",
    "lat": 24.2513,
    "long": 89.9167
  },
  {
    "id": "bogura",
    "nameEn": "Bogura",
    "nameBn": "বগুড়া",
    "divisionEn": "Rajshahi",
    "divisionBn": "রাজশাহী",
    "lat": 24.8465228,
    "long": 89.377755
  },
  {
    "id": "joypurhat",
    "nameEn": "Joypurhat",
    "nameBn": "জয়পুরহাট",
    "divisionEn": "Rajshahi",
    "divisionBn": "রাজশাহী",
    "lat": 25.0968,
    "long": 89.0227
  },
  {
    "id": "naogaon",
    "nameEn": "Naogaon",
    "nameBn": "নওগাঁ",
    "divisionEn": "Rajshahi",
    "divisionBn": "রাজশাহী",
    "lat": 24.7936,
    "long": 88.9318
  },
  {
    "id": "natore",
    "nameEn": "Natore",
    "nameBn": "নাটোর",
    "divisionEn": "Rajshahi",
    "divisionBn": "রাজশাহী",
    "lat": 24.420556,
    "long": 89.000282
  },
  {
    "id": "nawabganj",
    "nameEn": "Nawabganj",
    "nameBn": "নবাবগঞ্জ",
    "divisionEn": "Rajshahi",
    "divisionBn": "রাজশাহী",
    "lat": 24.5965034,
    "long": 88.2775122
  },
  {
    "id": "pabna",
    "nameEn": "Pabna",
    "nameBn": "পাবনা",
    "divisionEn": "Rajshahi",
    "divisionBn": "রাজশাহী",
    "lat": 23.998524,
    "long": 89.233645
  },
  {
    "id": "rajshahi",
    "nameEn": "Rajshahi",
    "nameBn": "রাজশাহী",
    "divisionEn": "Rajshahi",
    "divisionBn": "রাজশাহী",
    "lat": 24.3745,
    "long": 88.6042
  },
  {
    "id": "sirajgonj",
    "nameEn": "Sirajgonj",
    "nameBn": "সিরাজগঞ্জ",
    "divisionEn": "Rajshahi",
    "divisionBn": "রাজশাহী",
    "lat": 24.4533978,
    "long": 89.7006815
  },
  {
    "id": "dinajpur",
    "nameEn": "Dinajpur",
    "nameBn": "দিনাজপুর",
    "divisionEn": "Rangpur",
    "divisionBn": "রংপুর",
    "lat": 25.6217061,
    "long": 88.6354504
  },
  {
    "id": "gaibandha",
    "nameEn": "Gaibandha",
    "nameBn": "গাইবান্ধা",
    "divisionEn": "Rangpur",
    "divisionBn": "রংপুর",
    "lat": 25.328751,
    "long": 89.528088
  },
  {
    "id": "kurigram",
    "nameEn": "Kurigram",
    "nameBn": "কুড়িগ্রাম",
    "divisionEn": "Rangpur",
    "divisionBn": "রংপুর",
    "lat": 25.805445,
    "long": 89.636174
  },
  {
    "id": "lalmonirhat",
    "nameEn": "Lalmonirhat",
    "nameBn": "লালমনিরহাট",
    "divisionEn": "Rangpur",
    "divisionBn": "রংপুর",
    "lat": 25.9923,
    "long": 89.2847
  },
  {
    "id": "nilphamari",
    "nameEn": "Nilphamari",
    "nameBn": "নীলফামারী",
    "divisionEn": "Rangpur",
    "divisionBn": "রংপুর",
    "lat": 25.931794,
    "long": 88.856006
  },
  {
    "id": "panchagarh",
    "nameEn": "Panchagarh",
    "nameBn": "পঞ্চগড়",
    "divisionEn": "Rangpur",
    "divisionBn": "রংপুর",
    "lat": 26.3411,
    "long": 88.5541606
  },
  {
    "id": "rangpur",
    "nameEn": "Rangpur",
    "nameBn": "রংপুর",
    "divisionEn": "Rangpur",
    "divisionBn": "রংপুর",
    "lat": 25.7558096,
    "long": 89.244462
  },
  {
    "id": "thakurgaon",
    "nameEn": "Thakurgaon",
    "nameBn": "ঠাকুরগাঁও",
    "divisionEn": "Rangpur",
    "divisionBn": "রংপুর",
    "lat": 26.0336945,
    "long": 88.4616834
  },
  {
    "id": "barguna",
    "nameEn": "Barguna",
    "nameBn": "বরগুনা",
    "divisionEn": "Barishal",
    "divisionBn": "বরিশাল",
    "lat": 22.0953,
    "long": 90.1121
  },
  {
    "id": "barishal",
    "nameEn": "Barishal",
    "nameBn": "বরিশাল",
    "divisionEn": "Barishal",
    "divisionBn": "বরিশাল",
    "lat": 22.701,
    "long": 90.3535
  },
  {
    "id": "bhola",
    "nameEn": "Bhola",
    "nameBn": "ভোলা",
    "divisionEn": "Barishal",
    "divisionBn": "বরিশাল",
    "lat": 22.685923,
    "long": 90.648179
  },
  {
    "id": "jhalokati",
    "nameEn": "Jhalokati",
    "nameBn": "ঝালকাঠি",
    "divisionEn": "Barishal",
    "divisionBn": "বরিশাল",
    "lat": 22.6406,
    "long": 90.1987
  },
  {
    "id": "patuakhali",
    "nameEn": "Patuakhali",
    "nameBn": "পটুয়াখালী",
    "divisionEn": "Barishal",
    "divisionBn": "বরিশাল",
    "lat": 22.3596316,
    "long": 90.3298712
  },
  {
    "id": "pirojpur",
    "nameEn": "Pirojpur",
    "nameBn": "পিরোজপুর",
    "divisionEn": "Barishal",
    "divisionBn": "বরিশাল",
    "lat": 22.5841,
    "long": 89.972
  },
  {
    "id": "bandarban",
    "nameEn": "Bandarban",
    "nameBn": "বান্দরবান",
    "divisionEn": "Chattogram",
    "divisionBn": "চট্টগ্রাম",
    "lat": 22.1953275,
    "long": 92.2183773
  },
  {
    "id": "brahmanbaria",
    "nameEn": "Brahmanbaria",
    "nameBn": "ব্রাহ্মণবাড়িয়া",
    "divisionEn": "Chattogram",
    "divisionBn": "চট্টগ্রাম",
    "lat": 23.9570904,
    "long": 91.1119286
  },
  {
    "id": "chandpur",
    "nameEn": "Chandpur",
    "nameBn": "চাঁদপুর",
    "divisionEn": "Chattogram",
    "divisionBn": "চট্টগ্রাম",
    "lat": 23.2332585,
    "long": 90.6712912
  },
  {
    "id": "chattogram",
    "nameEn": "Chattogram",
    "nameBn": "চট্টগ্রাম",
    "divisionEn": "Chattogram",
    "divisionBn": "চট্টগ্রাম",
    "lat": 22.335109,
    "long": 91.834073
  },
  {
    "id": "cumilla",
    "nameEn": "Cumilla",
    "nameBn": "কুমিল্লা",
    "divisionEn": "Chattogram",
    "divisionBn": "চট্টগ্রাম",
    "lat": 23.4682747,
    "long": 91.1788135
  },
  {
    "id": "cox-s-bazar",
    "nameEn": "Cox's Bazar",
    "nameBn": "কক্স বাজার",
    "divisionEn": "Chattogram",
    "divisionBn": "চট্টগ্রাম",
    "lat": 21.4272,
    "long": 92.0058
  },
  {
    "id": "feni",
    "nameEn": "Feni",
    "nameBn": "ফেনী",
    "divisionEn": "Chattogram",
    "divisionBn": "চট্টগ্রাম",
    "lat": 23.0159,
    "long": 91.3976
  },
  {
    "id": "khagrachari",
    "nameEn": "Khagrachari",
    "nameBn": "খাগড়াছড়ি",
    "divisionEn": "Chattogram",
    "divisionBn": "চট্টগ্রাম",
    "lat": 23.119285,
    "long": 91.984663
  },
  {
    "id": "lakshmipur",
    "nameEn": "Lakshmipur",
    "nameBn": "লক্ষ্মীপুর",
    "divisionEn": "Chattogram",
    "divisionBn": "চট্টগ্রাম",
    "lat": 22.942477,
    "long": 90.841184
  },
  {
    "id": "noakhali",
    "nameEn": "Noakhali",
    "nameBn": "নোয়াখালী",
    "divisionEn": "Chattogram",
    "divisionBn": "চট্টগ্রাম",
    "lat": 22.869563,
    "long": 91.099398
  },
  {
    "id": "rangamati",
    "nameEn": "Rangamati",
    "nameBn": "রাঙ্গামাটি",
    "divisionEn": "Chattogram",
    "divisionBn": "চট্টগ্রাম",
    "lat": 22.7324,
    "long": 92.2985
  },
  {
    "id": "habiganj",
    "nameEn": "Habiganj",
    "nameBn": "হবিগঞ্জ",
    "divisionEn": "Sylhet",
    "divisionBn": "সিলেট",
    "lat": 24.374945,
    "long": 91.41553
  },
  {
    "id": "maulvibazar",
    "nameEn": "Maulvibazar",
    "nameBn": "মৌলভীবাজার",
    "divisionEn": "Sylhet",
    "divisionBn": "সিলেট",
    "lat": 24.482934,
    "long": 91.777417
  },
  {
    "id": "sunamganj",
    "nameEn": "Sunamganj",
    "nameBn": "সুনামগঞ্জ",
    "divisionEn": "Sylhet",
    "divisionBn": "সিলেট",
    "lat": 25.0658042,
    "long": 91.3950115
  },
  {
    "id": "sylhet",
    "nameEn": "Sylhet",
    "nameBn": "সিলেট",
    "divisionEn": "Sylhet",
    "divisionBn": "সিলেট",
    "lat": 24.8897956,
    "long": 91.8697894
  },
  {
    "id": "bagerhat",
    "nameEn": "Bagerhat",
    "nameBn": "বাগেরহাট",
    "divisionEn": "Khulna",
    "divisionBn": "খুলনা",
    "lat": 22.651568,
    "long": 89.785938
  },
  {
    "id": "chuadanga",
    "nameEn": "Chuadanga",
    "nameBn": "চুয়াডাঙ্গা",
    "divisionEn": "Khulna",
    "divisionBn": "খুলনা",
    "lat": 23.6401961,
    "long": 88.841841
  },
  {
    "id": "jashore",
    "nameEn": "Jashore",
    "nameBn": "যশোর",
    "divisionEn": "Khulna",
    "divisionBn": "খুলনা",
    "lat": 23.16643,
    "long": 89.2081126
  },
  {
    "id": "jhenaidah",
    "nameEn": "Jhenaidah",
    "nameBn": "ঝিনাইদহ",
    "divisionEn": "Khulna",
    "divisionBn": "খুলনা",
    "lat": 23.5448176,
    "long": 89.1539213
  },
  {
    "id": "khulna",
    "nameEn": "Khulna",
    "nameBn": "খুলনা",
    "divisionEn": "Khulna",
    "divisionBn": "খুলনা",
    "lat": 22.815774,
    "long": 89.568679
  },
  {
    "id": "kushtia",
    "nameEn": "Kushtia",
    "nameBn": "কুষ্টিয়া",
    "divisionEn": "Khulna",
    "divisionBn": "খুলনা",
    "lat": 23.901258,
    "long": 89.120482
  },
  {
    "id": "magura",
    "nameEn": "Magura",
    "nameBn": "মাগুরা",
    "divisionEn": "Khulna",
    "divisionBn": "খুলনা",
    "lat": 23.487337,
    "long": 89.419956
  },
  {
    "id": "meherpur",
    "nameEn": "Meherpur",
    "nameBn": "মেহেরপুর",
    "divisionEn": "Khulna",
    "divisionBn": "খুলনা",
    "lat": 23.762213,
    "long": 88.631821
  },
  {
    "id": "narail",
    "nameEn": "Narail",
    "nameBn": "নড়াইল",
    "divisionEn": "Khulna",
    "divisionBn": "খুলনা",
    "lat": 23.172534,
    "long": 89.512672
  },
  {
    "id": "satkhira",
    "nameEn": "Satkhira",
    "nameBn": "সাতক্ষীরা",
    "divisionEn": "Khulna",
    "divisionBn": "খুলনা",
    "lat": 22.7185,
    "long": 89.0705
  }
];