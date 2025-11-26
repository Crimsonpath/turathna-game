import { drizzle } from "drizzle-orm/mysql2";
import { culturalPacks, questions } from "../drizzle/schema.js";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

const culturalPacksData = [
  {
    name: "Egypt",
    nameAr: "مصر",
    description: "Ancient civilization, pyramids, and modern culture",
    iconUrl: "/images/egypt.png",
    isPremium: 0,
  },
  {
    name: "Japan",
    nameAr: "اليابان",
    description: "Land of the rising sun, technology and tradition",
    iconUrl: "/images/japan.png",
    isPremium: 0,
  },
  {
    name: "Mexico",
    nameAr: "المكسيك",
    description: "Rich history, vibrant culture, and delicious cuisine",
    iconUrl: "/images/mexico.png",
    isPremium: 0,
  },
  {
    name: "Kuwait",
    nameAr: "الكويت",
    description: "Pearl of the Gulf, modern and traditional",
    iconUrl: "/images/kuwait.png",
    isPremium: 0,
  },
];

const questionsData = [
  // Egypt questions
  {
    culturalPackId: 1,
    questionText: "What year was the Cairo Tower completed?",
    questionTextAr: "في أي عام تم الانتهاء من برج القاهرة؟",
    questionType: "multiple_choice",
    correctAnswer: "B",
    options: JSON.stringify(["A: 1956", "B: 1961", "C: 1967", "D: 1972"]),
    optionsAr: JSON.stringify(["أ: 1956", "ب: 1961", "ج: 1967", "د: 1972"]),
    difficulty: "medium",
  },
  {
    culturalPackId: 1,
    questionText: "Which river flows through Egypt?",
    questionTextAr: "أي نهر يمر عبر مصر؟",
    questionType: "multiple_choice",
    correctAnswer: "A",
    options: JSON.stringify(["A: Nile", "B: Amazon", "C: Tigris", "D: Euphrates"]),
    optionsAr: JSON.stringify(["أ: النيل", "ب: الأمازون", "ج: دجلة", "د: الفرات"]),
    difficulty: "easy",
  },
  {
    culturalPackId: 1,
    questionText: "Who was the last active pharaoh of Ancient Egypt?",
    questionTextAr: "من كان آخر فرعون نشط في مصر القديمة؟",
    questionType: "multiple_choice",
    correctAnswer: "C",
    options: JSON.stringify(["A: Tutankhamun", "B: Ramses II", "C: Cleopatra VII", "D: Nefertiti"]),
    optionsAr: JSON.stringify(["أ: توت عنخ آمون", "ب: رمسيس الثاني", "ج: كليوباترا السابعة", "د: نفرتيتي"]),
    difficulty: "medium",
  },
  // Japan questions
  {
    culturalPackId: 2,
    questionText: "What is the traditional Japanese garment called?",
    questionTextAr: "ما اسم الزي الياباني التقليدي؟",
    questionType: "multiple_choice",
    correctAnswer: "B",
    options: JSON.stringify(["A: Hanbok", "B: Kimono", "C: Sari", "D: Qipao"]),
    optionsAr: JSON.stringify(["أ: هانبوك", "ب: كيمونو", "ج: ساري", "د: تشيباو"]),
    difficulty: "easy",
  },
  {
    culturalPackId: 2,
    questionText: "Which mountain is the highest in Japan?",
    questionTextAr: "أي جبل هو الأعلى في اليابان؟",
    questionType: "multiple_choice",
    correctAnswer: "A",
    options: JSON.stringify(["A: Mount Fuji", "B: Mount Everest", "C: Mount Kilimanjaro", "D: Mount Blanc"]),
    optionsAr: JSON.stringify(["أ: جبل فوجي", "ب: جبل إيفرست", "ج: جبل كليمنجارو", "د: جبل بلانك"]),
    difficulty: "easy",
  },
  {
    culturalPackId: 2,
    questionText: "What is the Japanese art of paper folding called?",
    questionTextAr: "ما اسم فن طي الورق الياباني؟",
    questionType: "multiple_choice",
    correctAnswer: "C",
    options: JSON.stringify(["A: Ikebana", "B: Bonsai", "C: Origami", "D: Calligraphy"]),
    optionsAr: JSON.stringify(["أ: إيكيبانا", "ب: بونساي", "ج: أوريغامي", "د: الخط"]),
    difficulty: "medium",
  },
  // Mexico questions
  {
    culturalPackId: 3,
    questionText: "What is the capital city of Mexico?",
    questionTextAr: "ما هي عاصمة المكسيك؟",
    questionType: "multiple_choice",
    correctAnswer: "B",
    options: JSON.stringify(["A: Guadalajara", "B: Mexico City", "C: Cancun", "D: Monterrey"]),
    optionsAr: JSON.stringify(["أ: غوادالاخارا", "ب: مكسيكو سيتي", "ج: كانكون", "د: مونتيري"]),
    difficulty: "easy",
  },
  {
    culturalPackId: 3,
    questionText: "Which ancient civilization built the pyramids of Teotihuacan?",
    questionTextAr: "أي حضارة قديمة بنت أهرامات تيوتيهواكان؟",
    questionType: "multiple_choice",
    correctAnswer: "A",
    options: JSON.stringify(["A: Aztecs", "B: Mayans", "C: Incas", "D: Olmecs"]),
    optionsAr: JSON.stringify(["أ: الأزتيك", "ب: المايا", "ج: الإنكا", "د: الأولمك"]),
    difficulty: "medium",
  },
  {
    culturalPackId: 3,
    questionText: "What is the traditional Mexican Day of the Dead called?",
    questionTextAr: "ما اسم يوم الموتى المكسيكي التقليدي؟",
    questionType: "multiple_choice",
    correctAnswer: "D",
    options: JSON.stringify(["A: Cinco de Mayo", "B: Navidad", "C: Semana Santa", "D: Día de los Muertos"]),
    optionsAr: JSON.stringify(["أ: سينكو دي مايو", "ب: نافيداد", "ج: سيمانا سانتا", "د: ديا دي لوس مويرتوس"]),
    difficulty: "medium",
  },
  // Kuwait questions
  {
    culturalPackId: 4,
    questionText: "What are the iconic Kuwait Towers known for?",
    questionTextAr: "بماذا تشتهر أبراج الكويت الشهيرة؟",
    questionType: "multiple_choice",
    correctAnswer: "B",
    options: JSON.stringify(["A: Shopping", "B: Water storage and observation", "C: Hotels", "D: Government offices"]),
    optionsAr: JSON.stringify(["أ: التسوق", "ب: تخزين المياه والمراقبة", "ج: الفنادق", "د: المكاتب الحكومية"]),
    difficulty: "medium",
  },
  {
    culturalPackId: 4,
    questionText: "What is the currency of Kuwait?",
    questionTextAr: "ما هي عملة الكويت؟",
    questionType: "multiple_choice",
    correctAnswer: "A",
    options: JSON.stringify(["A: Kuwaiti Dinar", "B: Riyal", "C: Dirham", "D: Pound"]),
    optionsAr: JSON.stringify(["أ: الدينار الكويتي", "ب: الريال", "ج: الدرهم", "د: الجنيه"]),
    difficulty: "easy",
  },
  {
    culturalPackId: 4,
    questionText: "Which body of water borders Kuwait?",
    questionTextAr: "أي مسطح مائي يحد الكويت؟",
    questionType: "multiple_choice",
    correctAnswer: "C",
    options: JSON.stringify(["A: Red Sea", "B: Mediterranean Sea", "C: Persian Gulf", "D: Arabian Sea"]),
    optionsAr: JSON.stringify(["أ: البحر الأحمر", "ب: البحر الأبيض المتوسط", "ج: الخليج العربي", "د: بحر العرب"]),
    difficulty: "easy",
  },
];

async function seed() {
  console.log("Starting seed...");

  // Insert cultural packs
  console.log("Inserting cultural packs...");
  for (const pack of culturalPacksData) {
    await db.insert(culturalPacks).values(pack);
  }

  // Insert questions
  console.log("Inserting questions...");
  for (const question of questionsData) {
    await db.insert(questions).values(question);
  }

  console.log("Seed completed successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
