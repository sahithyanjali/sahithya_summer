import type { TempleItem } from "../types.ts";

export const TEMPLES_DATA: TempleItem[] = [
  {
    id: "temple_ghati",
    name: "Sri Ghati Subramanya Temple",
    kannadaName: "ಶ್ರೀ ಘಾಟಿ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ ಕ್ಷೇತ್ರ",
    deity: "Lord Subramanya & Sri Lakshmi Narasimha",
    location: "Tubagere, Doddaballapur Taluk",
    district: "Bengaluru Rural",
    distanceFromBangalore: "52 km from Majestic",
    heritageEra: "600+ Years (Dravidian & Sandur Ghorpade patronage)",
    category: "Annadana",
    img: "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?q=80&w=800",
    darshanTimings: "06:00 AM - 08:30 PM (Daily)",
    annadanaTimings: "11:30 AM - 03:30 PM & 06:30 PM - 08:30 PM",
    description: "Renowned pilgrimage destination where Lord Subramanya and Lord Lakshmi Narasimha emerge back-to-back from a single monolithic stone idol, viewed through a polished mirror. Seva Sphoorthi operates daily volunteer brigades for clean dining halls, organic kitchen seva, and weekend queue management.",
    trustInitiatives: [
      "Nitya Annadana Volunteer Service (serving 5,000+ devotees daily)",
      "Swachh Mandir & zero-plastic eco-pilgrimage campaign",
      "Snake sanctuary & ant-hill sacred bio-diversity protection",
      "Free buttermilk and electrolyte hydration kiosks on festival days"
    ],
    sevaSlots: [
      {
        id: "ghati_seva_anna",
        title: "Annadana Hall Meal Distribution & Cleaning",
        time: "10:30 AM - 02:30 PM",
        date: "Every Weekend & Amavasya",
        volunteersNeeded: 15,
        volunteersJoined: 11,
        category: "Annadana",
        description: "Assist kitchen priests in packaging hot sambar-rice prasadam, serving seated pilgrims, and sanitizing dining corridors."
      },
      {
        id: "ghati_seva_crowd",
        title: "Pradakshina Queue & Elder Devotee Assistance",
        time: "07:00 AM - 11:30 AM",
        date: "Saturday & Sunday",
        volunteersNeeded: 10,
        volunteersJoined: 6,
        category: "Queue Assist",
        description: "Help senior citizens, mothers with infants, and specially-abled devotees navigate darshan lines safely."
      },
      {
        id: "ghati_seva_swachh",
        title: "Temple Outer Prakaara Swachh Cleanliness Drive",
        time: "03:00 PM - 06:00 PM",
        date: "Upcoming Sunday",
        volunteersNeeded: 20,
        volunteersJoined: 14,
        category: "Swachh Mandir",
        description: "Segregate plastic, sweep flower compost, and clean stone parikrama walkways around the sacred hill."
      }
    ],
    sponsorships: [
      {
        id: "ghati_sp_501",
        title: "Annadana Meal Pack for 25 Devotees",
        amount: 501,
        description: "Provides fresh, piping-hot rice, dal, and payasa to 25 visiting rural pilgrims.",
        eligible80G: true
      },
      {
        id: "ghati_sp_1001",
        title: "Pushpa Alankara & Akhanda Deepa Oil Seva",
        amount: 1001,
        description: "Supplies pure sesame oil, camphor, and fresh marigold garlands for evening deepa aradhana.",
        eligible80G: true
      },
      {
        id: "ghati_sp_2501",
        title: "Full Session Annadana Meal Sponsorship",
        amount: 2501,
        description: "Covers vegetables, ghee, and provisions for 120 devotees during the afternoon seva.",
        eligible80G: true
      }
    ],
    geoCoords: {
      lat: 13.3184,
      lng: 77.5146,
      mapsQuery: "Sri+Ghati+Subrahmanya+Temple+Doddaballapur"
    }
  },
  {
    id: "temple_someshwara",
    name: "Sri Someshwara Temple (Halasuru)",
    kannadaName: "ಶ್ರೀ ಹಲಸೂರು ಸೋಮೇಶ್ವರ ದೇವಾಲಯ",
    deity: "Lord Someshwara (Shiva) & Goddess Kamakshamma",
    location: "Ulsoor / Halasuru, Old Madras Road",
    district: "Bengaluru Urban",
    distanceFromBangalore: "Central Bangalore (5 km from MG Road)",
    heritageEra: "11th Century Chola Dynasty & Kempe Gowda I (16th Century)",
    category: "Heritage",
    img: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800",
    darshanTimings: "06:00 AM - 12:30 PM & 05:30 PM - 08:45 PM",
    annadanaTimings: "12:30 PM - 02:00 PM (Mondays & Pradosha)",
    description: "One of the oldest surviving temple structures in Bengaluru. Features exquisite Chola and Hoysala-Vijayanagara stone pillars, intricate carvings of Girija Kalyana, and a grand Rajagopuram. Seva Sphoorthi leads youth heritage restoration, eco-friendly stone cleaning, and Pradosha Deepotsava seva here.",
    trustInitiatives: [
      "Ancient granite pillar gentle eco-cleansing & non-destructive preservation",
      "Pradosha and Somavara Deepotsava volunteer lamp-lighting brigade",
      "Youth Vedic architecture guided walks and Kannada inscription documentation",
      "Eco-friendly brass oil lamp collection and recycling"
    ],
    sevaSlots: [
      {
        id: "someshwara_seva_deepa",
        title: "Pradosha Deepotsava Lamp Arrangement & Lighting",
        time: "05:00 PM - 08:30 PM",
        date: "Pradosham & Somavara",
        volunteersNeeded: 12,
        volunteersJoined: 9,
        category: "Heritage",
        description: "Fill 500+ brass and terracotta oil lamps with sacred sesame oil, align rows along the stone prakara, and assist priests during Maha Mangalarathi."
      },
      {
        id: "someshwara_seva_heritage",
        title: "Temple Stone Carving & Compound Cleanliness",
        time: "07:30 AM - 10:30 AM",
        date: "Saturday Morning",
        volunteersNeeded: 15,
        volunteersJoined: 12,
        category: "Swachh Mandir",
        description: "Carefully dust granite carvings, wash temple stone courtyards with water, and maintain heritage signage."
      }
    ],
    sponsorships: [
      {
        id: "somesh_sp_251",
        title: "Bilva Patra & Sacred Deepa Oil Seva",
        amount: 251,
        description: "Fresh Bilva leaves and sesame oil for Lord Someshwara Pradosha Abhisheka.",
        eligible80G: true
      },
      {
        id: "somesh_sp_750",
        title: "Heritage Guide & Kannada Inscription Booklet Print",
        amount: 750,
        description: "Prints educational heritage booklets for school students visiting the Chola architecture.",
        eligible80G: true
      },
      {
        id: "somesh_sp_1500",
        title: "Temple Nandavana Garden Maintenance Seva",
        amount: 1500,
        description: "Maintains flowering Tulasi, Parijata, and Bilva gardens within the sacred inner courtyard.",
        eligible80G: true
      }
    ],
    geoCoords: {
      lat: 12.9774,
      lng: 77.6253,
      mapsQuery: "Someshwara+Temple+Halasuru+Bangalore"
    }
  },
  {
    id: "temple_bhoganandeeshwara",
    name: "Sri Bhoga Nandeeshwara Temple",
    kannadaName: "ಶ್ರೀ ಭೋಗ ನಂದೀಶ್ವರ ದೇವಾಲಯ",
    deity: "Lord Shiva (Arunachaleshwara & Bhoga Nandeeshwara)",
    location: "Nandi Village, Foothills of Nandi Hills",
    district: "Chikkaballapur",
    distanceFromBangalore: "55 km from Hebbal Flyover",
    heritageEra: "9th Century Nolamba, Rashtrakuta & Hoysala architecture",
    category: "Heritage",
    img: "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?q=80&w=800",
    darshanTimings: "07:00 AM - 07:30 PM (Daily)",
    annadanaTimings: "12:00 PM - 02:30 PM (Weekends & Special Days)",
    description: "A breathtaking 9th-century temple complex showcasing pristine Dravidian stone carvings, ornate pillars with musical chimes, and the world-famous 'Shringi Theertha' stepped Kalyani pond. Seva Sphoorthi runs ongoing volunteer cleanups of the sacred Kalyani and promotes eco-tourism etiquette.",
    trustInitiatives: [
      "Sacred Shringi Theertha stepped Kalyani desiltation & water revitalization",
      "Nandavana sacred botanical revival: planting Bilva, Kadamba & Audumbara trees",
      "Heritage guards volunteer unit to stop littering and defacing of 1,100-year-old stone walls",
      "Devotee footwear care and eco-cloth bag distribution kiosk"
    ],
    sevaSlots: [
      {
        id: "bhoga_seva_kalyani",
        title: "Shringi Theertha Step-Well Sacred Water Cleanup",
        time: "08:00 AM - 12:00 PM",
        date: "Second & Fourth Sunday",
        volunteersNeeded: 25,
        volunteersJoined: 19,
        category: "Kalyani Cleaning",
        description: "Join hands with eco-volunteers to remove floating leaves, moss, and sediment from the historical stone step-well."
      },
      {
        id: "bhoga_seva_nandavana",
        title: "Nandavana Herb & Sacred Grove Planting",
        time: "09:00 AM - 01:00 PM",
        date: "Upcoming Saturday",
        volunteersNeeded: 18,
        volunteersJoined: 11,
        category: "Swachh Mandir",
        description: "Plant native aromatic shrubs, build drip irrigation basins, and nurture medicinal plants used for temple rituals."
      }
    ],
    sponsorships: [
      {
        id: "bhoga_sp_500",
        title: "Pushkarani Bio-Cleaning & Safety Kit",
        amount: 500,
        description: "Funds organic water treatment minerals and safe cleaning rakes for the ancient step-well.",
        eligible80G: true
      },
      {
        id: "bhoga_sp_1100",
        title: "Five Native Sacred Temple Trees Plantation",
        amount: 1100,
        description: "Plants and adopts 5 native trees (Peepal, Banyan, Bilva, Neem, Kadamba) with 1-year tree guard protection.",
        eligible80G: true
      },
      {
        id: "bhoga_sp_3000",
        title: "Ancient Stone Pathway Restoration Sponsorship",
        amount: 3000,
        description: "Restores granite flagstone paving around the outer parikrama to prevent rain erosion.",
        eligible80G: true
      }
    ],
    geoCoords: {
      lat: 13.3768,
      lng: 77.6974,
      mapsQuery: "Bhoga+Nandeeshwara+Temple+Nandi"
    }
  },
  {
    id: "temple_basavanagudi",
    name: "Sri Dodda Basavana Gudi (Bull Temple)",
    kannadaName: "ಶ್ರೀ ದೊಡ್ಡ ಬಸವನ ಗುಡಿ (ಬುಲ್ ಟೆಂಪಲ್)",
    deity: "Sacred Nandi (Vahana of Lord Shiva) & Dodda Ganapathi",
    location: "Bull Temple Road, Basavanagudi",
    district: "Bengaluru South",
    distanceFromBangalore: "South Bangalore (Bugle Rock Park precincts)",
    heritageEra: "1537 CE (Kempe Gowda I, Vijayanagara Style)",
    category: "Swachh Seva",
    img: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800",
    darshanTimings: "06:00 AM - 01:00 PM & 04:30 PM - 09:00 PM",
    annadanaTimings: "12:30 PM - 02:00 PM (Festive Days)",
    description: "Housing one of the largest monolithic Nandi bull sculptures in the world (4.5m tall, 6.5m long) carved from a single granite boulder. Famous for the annual Kadalekai Parishe (Groundnut Fair). Seva Sphoorthi organizes crowd stewardship, green waste collection, and elder assistance.",
    trustInitiatives: [
      "Kadalekai Parishe zero-waste volunteer drive & plastic ban enforcement",
      "Daily sacred Nandi butter & oil parikrama cleanliness drive",
      "Elderly pilgrim assistance through Bugle Rock hilltop steps",
      "Prasadam packaging and orderly distribution counters"
    ],
    sevaSlots: [
      {
        id: "basavana_seva_crowd",
        title: "Devotee Darshan Line & Prasadam Assistance",
        time: "09:00 AM - 01:00 PM",
        date: "Saturday & Sunday",
        volunteersNeeded: 14,
        volunteersJoined: 10,
        category: "Queue Assist",
        description: "Guide long weekend darshan queues, distribute temple prasadam gracefully, and aid elderly visitors."
      },
      {
        id: "basavana_seva_clean",
        title: "Bugle Rock & Temple Parikrama Swachh Abhiyaan",
        time: "03:30 PM - 06:30 PM",
        date: "Every Tuesday & Friday",
        volunteersNeeded: 12,
        volunteersJoined: 8,
        category: "Swachh Mandir",
        description: "Keep the historic granite pavilion spotless, clear dry leaves, and manage compost bins."
      }
    ],
    sponsorships: [
      {
        id: "bull_sp_350",
        title: "Prasadam & Pure Butter Lamp Offering",
        amount: 350,
        description: "Provides pure cow ghee and camphor for evening Nandi Deeparadhane.",
        eligible80G: true
      },
      {
        id: "bull_sp_850",
        title: "Eco-Friendly Compost Bin for Kadalekai Shells",
        amount: 850,
        description: "Deploys specialized organic waste bins in Basavanagudi park grounds.",
        eligible80G: true
      },
      {
        id: "bull_sp_2100",
        title: "Green Bugle Rock Temple Cleanliness Drive",
        amount: 2100,
        description: "Supplies cleaning kits, biodegradable gloves, and waste haulage for weekend temple drives.",
        eligible80G: true
      }
    ],
    geoCoords: {
      lat: 12.9427,
      lng: 77.5683,
      mapsQuery: "Bull+Temple+Basavanagudi+Bangalore"
    }
  },
  {
    id: "temple_banashankari",
    name: "Sri Banashankari Amma Temple",
    kannadaName: "ಶ್ರೀ ಬನಶಂಕರಿ ಅಮ್ಮನವರ ದೇವಸ್ಥಾನ",
    deity: "Goddess Banashankari (Shakambhari / Parvati)",
    location: "Kanakapura Road, Banashankari 2nd Stage",
    district: "Bengaluru South",
    distanceFromBangalore: "9 km from City Railway Station",
    heritageEra: "Established in 1915 CE by Somanna Devara",
    category: "Goshaala",
    img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800",
    darshanTimings: "06:00 AM - 01:00 PM & 04:30 PM - 09:00 PM (Full Day on Tue, Fri, Sun)",
    annadanaTimings: "12:00 PM - 03:00 PM & 07:00 PM - 09:00 PM",
    description: "A deeply revered Shakti Peetha temple famous for Rahukala Pooja where devotees light oil lamps in hollowed-out lemon peels. Seva Sphoorthi actively manages lemon waste bio-composting, feeds thousands in community Annadana, and supports the attached temple Goshaala (cow shelter).",
    trustInitiatives: [
      "Lemon peel eco-recycling into organic household compost & bio-enzymes",
      "Annadana Seva catering to 4,000+ devotees during Tuesday & Friday Rahukala",
      "Temple Goshaala: medical checkups, fresh fodder & clean water for 45 indigenous cows",
      "Free health and blood pressure screening camp for rural women in the temple kalyana mantapa"
    ],
    sevaSlots: [
      {
        id: "banashankari_seva_goshaala",
        title: "Temple Goshaala Seva: Feeding & Bathing Indigenous Cows",
        time: "07:00 AM - 10:30 AM",
        date: "Saturday & Sunday",
        volunteersNeeded: 10,
        volunteersJoined: 8,
        category: "Goshaala",
        description: "Chop fresh green fodder, clean cow sheds, distribute jaggery treats, and groom the sacred cows."
      },
      {
        id: "banashankari_seva_anna",
        title: "Rahukala Mega Annadana Volunteers",
        time: "11:00 AM - 03:30 PM",
        date: "Every Tuesday & Friday",
        volunteersNeeded: 20,
        volunteersJoined: 16,
        category: "Annadana",
        description: "Help serve afternoon meals, distribute sweet pongal, and assist priests in dining sanitization."
      }
    ],
    sponsorships: [
      {
        id: "bana_sp_500",
        title: "Cow Fodder & Nutritious Grass Bundle",
        amount: 500,
        description: "Provides 50kg of fresh hybrid napier grass and jaggery for temple cows.",
        eligible80G: true
      },
      {
        id: "bana_sp_1200",
        title: "Women's Health Camp Medicines & Vitamins",
        amount: 1200,
        description: "Sponsors calcium, iron supplements, and doctor kits for 30 elderly women devotees.",
        eligible80G: true
      },
      {
        id: "bana_sp_2500",
        title: "Rahukala Annadana Feeding 100 Devotees",
        amount: 2500,
        description: "Complete wholesome midday meal for 100 pilgrims visiting for Rahukala pooja.",
        eligible80G: true
      }
    ],
    geoCoords: {
      lat: 12.9254,
      lng: 77.5744,
      mapsQuery: "Banashankari+Amma+Temple+Bangalore"
    }
  },
  {
    id: "temple_prasanna_veeranjaneya",
    name: "Sri Prasanna Veeranjaneya Swamy Temple",
    kannadaName: "ಶ್ರೀ ಪ್ರಸನ್ನ ವೀರಾಂಜನೇಯ ಸ್ವಾಮಿ ದೇವಾಲಯ",
    deity: "Lord Veeranjaneya Swamy (Hanuman)",
    location: "Mahalakshmi Layout Hillock",
    district: "Bengaluru West",
    distanceFromBangalore: "Near Rajajinagar (8 km from Majestic)",
    heritageEra: "Consecrated in 1976 CE by Saint Sri Sri Shivakumar Swamiji",
    category: "Swachh Seva",
    img: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800",
    darshanTimings: "06:30 AM - 12:30 PM & 04:30 PM - 08:30 PM",
    annadanaTimings: "12:30 PM - 02:30 PM (Saturdays & Hanuman Jayanti)",
    description: "Features a majestic 22-foot monolithic Hanuman statue sculpted from a natural hillock rock. Positioned peacefully on a serene green hill overlooking Western Bangalore. Seva Sphoorthi coordinates weekly Sanskar Shala cultural sessions for village children and pilgrim water distribution.",
    trustInitiatives: [
      "Hilltop stairway drinking water kiosks & volunteer elder escort",
      "Sunday Sanskar Shala: moral storytelling, yoga & shloka recitation for 80+ kids",
      "Hillside afforestation & bird feeder maintenance around the temple rocks",
      "Festival crowd queue guidance and emergency first-aid station"
    ],
    sevaSlots: [
      {
        id: "anjaneya_seva_sanskar",
        title: "Sanskar Shala Youth Tutoring & Value Classes",
        time: "09:30 AM - 12:30 PM",
        date: "Every Sunday Morning",
        volunteersNeeded: 8,
        volunteersJoined: 6,
        category: "Heritage",
        description: "Teach basic Sanskrit shlokas, heritage stories, drawing, and moral science to neighborhood children."
      },
      {
        id: "anjaneya_seva_hill",
        title: "Hilltop Pathway Cleaning & Eco-Tree Plantation",
        time: "06:30 AM - 09:30 AM",
        date: "Saturday Morning",
        volunteersNeeded: 12,
        volunteersJoined: 9,
        category: "Swachh Mandir",
        description: "Clean stone steps leading to the hilltop temple, clear dry shrubs for fire safety, and plant flowering trees."
      }
    ],
    sponsorships: [
      {
        id: "anjaneya_sp_400",
        title: "Kids Sanskar Shala Books & Art Kits",
        amount: 400,
        description: "Provides notebooks, sketch pens, and Kannada value storybooks for 10 kids.",
        eligible80G: true
      },
      {
        id: "anjaneya_sp_1000",
        title: "Hilltop Water Filter Cartridge & Cool Hydration",
        amount: 1000,
        description: "Funds clean drinking water filtration and paper cups for 500 ascending pilgrims.",
        eligible80G: true
      },
      {
        id: "anjaneya_sp_2000",
        title: "Saturday Hanuman Maha Prasadam Sponsor",
        amount: 2000,
        description: "Sponsors hot spicy kesaribath and puliyogare prasadam distribution for 150 devotees.",
        eligible80G: true
      }
    ],
    geoCoords: {
      lat: 13.0135,
      lng: 77.5458,
      mapsQuery: "Prasanna+Veeranjaneya+Temple+Mahalakshmi+Layout"
    }
  }
];
