import { HitSpot, UserProfile, Review, AppNotification } from '../types';

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user-1',
    firstName: 'Κώστας',
    lastName: 'Παπαγεωργίου',
    nickname: 'Ο Μερακλής του Αιγαίου',
    email: 'kostas.chef@hitspots.gr',
    avatarUrl: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=400&q=80',
    bio: 'Executive Chef & λάτρης της αυθεντικής πρώτης ύλης! Αναζητώ πάντα παραδοσιακούς ξυλόφουρνους, ψαροταβέρνες δίπλα στο κύμα και οικογενειακά μαγειρεία σε όλη την Ελλάδα.',
    topFoods: [
      'Κατσικάκι στον ξυλόφουρνο με σταμναγκάθι',
      'Φαγκρί στα κάρβουνα με αγουρέλαιο',
      'Προζυμένιο ψωμί με παλαιωμένη γραβιέρα Νάξου'
    ],
    badge: 'ΜΑΣΤΕΡΜΑΙΝΤ',
    role: 'admin',
    favoriteRegions: ['Athens & Attica', 'Chania & West Crete', 'Cyclades (Naxos/Santorini/Paros)'],
    spotsSubmittedCount: 6,
    reviewsCount: 42,
    joinedAt: '2024-01-15'
  },
  {
    id: 'user-2',
    firstName: 'Έλενα',
    lastName: 'Βασιλείου',
    nickname: 'Gelato Queen',
    email: 'elena.taste@hitspots.gr',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Artisan Gelato & Pastry Scout! Έχω πάθος με το 100% φρέσκο ελληνικό πρόβειο γάλα, το ΠΟΠ φιστίκι Αιγίνης και το χειροποίητο φύλλο μπουγάτσας.',
    topFoods: [
      'Gelato Φιστίκι Αιγίνης ΠΟΠ',
      'Παραδοσιακή Μπουγάτσα Θεσσαλονίκης με κρέμα',
      'Καϊμάκι με σαλέπι και γλυκό βύσσινο'
    ],
    badge: 'ΦΙΛΟΣ ΚΙ ΑΔΕΡΦΟΣ/Η',
    role: 'scout',
    favoriteRegions: ['Athens & Attica', 'Thessaloniki & North'],
    spotsSubmittedCount: 4,
    reviewsCount: 38,
    joinedAt: '2024-03-20'
  },
  {
    id: 'user-3',
    firstName: 'Μανώλης',
    lastName: 'Κατσανεβάκης',
    nickname: 'Κρητικός Ανιχνευτής',
    email: 'manolis.crete@hitspots.gr',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Γυρίζω τα ορεινά χωριά της Κρήτης ανακαλύπτοντας κρυμμένα καφενεία, τσικάλια στη φωτιά, άγρια χόρτα και αυθεντική κρητική φιλοξενία.',
    topFoods: [
      'Χανιώτικο Μπουρέκι με ξινομυζήθρα',
      'Αρνάκι αντικριστό στα Λευκά Όρη',
      'Στάκα με αυγά ελευθέρας βοσκής'
    ],
    badge: 'ΚΑΛΟΦΑΓΑΣ/ΟΥ',
    role: 'scout',
    favoriteRegions: ['Chania & West Crete', 'Heraklion & East Crete'],
    spotsSubmittedCount: 3,
    reviewsCount: 51,
    joinedAt: '2024-02-10'
  },
  {
    id: 'user-4',
    firstName: 'Δημήτρης',
    lastName: 'Αλεξόπουλος',
    nickname: 'Souvlaki Hunter',
    email: 'dimitris.foodie@hitspots.gr',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'Λάτρης του αυθεντικού street food. Αν η πίτα έχει λάδι ή το κρέας είναι κατεψυγμένο, δεν πλησιάζω! Μόνο κάρβουνο και χειροποίητες σάλτσες.',
    topFoods: [
      'Αλάδωτο τυλιχτό σουβλάκι με κόκκινη σάλτσα',
      'Πίτα μπιφτεκάκι στα κάρβουνα',
      'Χειροποίητες τηγανητές πατάτες σε ελαιόλαδο'
    ],
    badge: 'ΠΑΜΕ ΠΑΙΔΙΑ',
    role: 'member',
    favoriteRegions: ['Athens & Attica', 'Thessaloniki & North', 'Peloponnese (Mani/Nafplio)'],
    spotsSubmittedCount: 1,
    reviewsCount: 29,
    joinedAt: '2024-05-02'
  },
  {
    id: 'user-5',
    firstName: 'Σοφία',
    lastName: 'Νικολάου',
    nickname: 'Η Αρχόντισσα της Πίτας',
    email: 'sofia.pita@hitspots.gr',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    bio: 'Λατρεύω τα ηπειρώτικα χωριά, τις παραδοσιακές πίτες με χειροποίητο φύλλο βέργας και τα μαγειρευτά στη γάστρα!',
    topFoods: [
      'Ηπειρώτικη Αλευρόπιτα στο ταψί',
      'Κόκορας κρασάτος με χυλοπίτες',
      'Γαλακτομπούρεκο με πρόβειο βούτυρο'
    ],
    badge: 'ΜΑΣΤΕΡ',
    role: 'scout',
    favoriteRegions: ['Epirus & Zagori', 'Peloponnese (Mani/Nafplio)'],
    spotsSubmittedCount: 5,
    reviewsCount: 34,
    joinedAt: '2024-04-12'
  },
  {
    id: 'user-6',
    firstName: 'Γιώργος',
    lastName: 'Μαυρίδης',
    nickname: 'Ο Θαλασσόλυκος',
    email: 'giorgos.sea@hitspots.gr',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    bio: 'Ψάχνω τις πιο αυθεντικές ψαροταβέρνες και ουζερί δίπλα στο κύμα σε Κυκλάδες, Δωδεκάνησα και Ιόνιο!',
    topFoods: [
      'Χταπόδι λιαστό στα κάρβουνα',
      'Αστακομακαρονάδα Αιγαίου',
      'Συμιακό γαριδάκι τηγανητό'
    ],
    badge: 'ΜΕΡΑΚΛΗΣ/ΜΕΡΑΚΛΙΝΑ',
    role: 'member',
    favoriteRegions: ['Cyclades (Naxos/Santorini/Paros)', 'Dodecanese (Rhodes/Kos)'],
    spotsSubmittedCount: 2,
    reviewsCount: 19,
    joinedAt: '2024-06-18'
  }
];

export const INITIAL_HIT_SPOTS: HitSpot[] = [
  {
    id: 'spot-1',
    authorId: 'user-2',
    author: DEMO_USERS[1],
    title: 'Epik Gelato Syntagma',
    titleEl: 'Epik Gelato Συντάγματος',
    category: 'Gelato',
    region: 'Athens & Attica',
    address: 'Dorou 2, Syntagma Square, Athens 105 63',
    googleMapsUrl: 'https://maps.google.com/?q=Epik+Gelato+Athens',
    coordinates: { lat: 37.9753, lng: 23.7335 },
    whyIsItSpecial: 'Made exclusively with raw sheep and goat milk from small monasteries in Thessaly, paired with PDO Aegina pistachios roasted in-house every morning. Zero artificial emulsifiers, pure velvety texture, and an unbeatable floral mastic scoop with rose petal preserve.',
    whyIsItSpecialEl: 'Παρασκευάζεται αποκλειστικά με πρόβειο και κατσικίσιο γάλα από μικρές μονάδες της Θεσσαλίας, σε συνδυασμό με ΠΟΠ Φιστίκι Αιγίνης που καβουρδίζεται καθημερινά στο εργαστήριο. Χωρίς κανένα πρόσθετο, με ασύγκριτη βελούδινη υφή και κορυφαία μαστίχα Χίου με γλυκό τριαντάφυλλο.',
    signatureDishes: ['PDO Aegina Pistachio Gelato', 'Kaimaki with Greek Wild Orchid & Sheep Milk', 'Dark Chocolate with Kalamata Olive Oil & Sea Salt'],
    signatureDishesEl: ['Gelato Φιστίκι Αιγίνης ΠΟΠ', 'Καϊμάκι με Σαλέπι & Πρόβειο Γάλα', 'Bitter Σοκολάτα με Εξαιρετικό Παρθένο Ελαιόλαδο Καλαμάτας'],
    priceLevel: '5-10€',
    coverImageUrl: 'https://images.unsplash.com/photo-1560008511-318a7a92383c?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1560008511-318a7a92383c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=1200&q=80'
    ],
    youtubeVideoUrls: [
      'https://www.youtube.com/watch?v=9f5qR-h_G7s'
    ],
    rating: 4.9,
    reviewsCount: 28,
    createdAt: '2025-01-10T14:30:00Z',
    tags: ['Artisan Gelato', 'PDO Aegina Pistachio', 'Sheep Milk', 'Athens Center'],
    insiderTips: 'Ask for a spoonful of warm sour cherry spoon sweet over the sheep kaimaki. Arrive before 19:00 as pistachio batches sell out fast!',
    verifiedSpot: true
  },
  {
    id: 'spot-2',
    authorId: 'user-4',
    author: DEMO_USERS[3],
    title: 'Kostas Souvlaki Pentelis (Since 1950)',
    titleEl: 'Ο Κώστας Σουβλάκι Πεντέλης (Από το 1950)',
    category: 'Authentic Souvlaki',
    region: 'Athens & Attica',
    address: 'Pl. Agias Irinis / Pentelis 5, Syntagma, Athens 105 57',
    googleMapsUrl: 'https://maps.google.com/?q=Kostas+Souvlaki+Pentelis+Athens',
    coordinates: { lat: 37.9748, lng: 23.7312 },
    whyIsItSpecial: 'The absolute antithesis of modern greasy souvlaki. Un-oiled dry grilled pita on iron plate, prime lean pork kalamaki cut daily by hand, freshly chopped parsley, thick Greek sheep yogurt, and their legendary secret spiced red tomato sauce that has remained unchanged for 70+ years.',
    whyIsItSpecialEl: 'Η απόλυτη αντίθεση του λιπαρού σουβλακίου. Αλάδωτη πίτα ψημένη στην πλάκα, χειροποίητο χοιρινό καλαμάκι χωρίς λίπη, φρεσκοκομμένος μαϊντανός, στραγγιστό πρόβειο γιαούρτι και η θρυλική πικάντικη κόκκινη σάλτσα ντομάτας που παραμένει ίδια από το 1950.',
    signatureDishes: ['Handmade Pork Kalamaki Pita with Secret Spicy Sauce', 'Beef Patty (Biftekaki) with Parsley & Red Sauce', 'Double Meat Wrapped Souvlaki'],
    signatureDishesEl: ['Πίτα Καλαμάκι Χοιρινό με Μυστική Σάλτσα & Μαϊντανό', 'Πίτα Μπιφτεκάκι με Κρεμμύδι & Σάλτσα', 'Διπλό Χειροποίητο Τυλιχτό'],
    priceLevel: '5-10€',
    coverImageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1200&q=80'
    ],
    youtubeVideoUrls: [
      'https://www.youtube.com/watch?v=r0tA7kY1mZc'
    ],
    rating: 4.95,
    reviewsCount: 64,
    createdAt: '2025-01-14T11:00:00Z',
    tags: ['Legendary Street Food', 'No Oil Pita', 'Secret Red Sauce', 'Historic Spot'],
    insiderTips: 'They open at 10:00 and close strictly when meat runs out (usually by 14:30). Expect a queue of 15-20 people, moves quickly.',
    verifiedSpot: true
  },
  {
    id: 'spot-3',
    authorId: 'user-3',
    author: DEMO_USERS[2],
    title: 'Dounias Traditional Gastronomy (Drakona)',
    titleEl: 'Ντουνιάς - Παραδοσιακή Κρητική Γαστρονομία (Δρακώνα)',
    category: 'Hidden Mountain Taverna',
    region: 'Chania & West Crete',
    address: 'Drakona Mountain Village, Keramia, Chania, Crete 731 00',
    googleMapsUrl: 'https://maps.google.com/?q=Dounias+Taverna+Drakona+Chania',
    coordinates: { lat: 35.4218, lng: 24.0321 },
    whyIsItSpecial: 'Zero electricity in cooking. Everything is prepared in traditional wood-burning stoves and clay pots (tsikalia) using certified heirloom ingredients grown in owner Stelios Trilyrakis’s organic bio-farm right below the taverna. The slow-simmered goat in stamnagathi and potato cooked in pork fat (choiromeri) will ruin normal restaurant food for you forever.',
    whyIsItSpecialEl: 'Μηδενικός ηλεκτρισμός στο μαγείρεμα. Τα πάντα ψήνονται σε παραδοσιακές ξυλόσομπες και πήλινα τσικάλια, με υλικά αποκλειστικά από τη βιολογική φάρμα του Στέλιου Τριλυράκη. Το κατσικάκι με σταμναγκάθι και οι πατάτες ψημένες στο ζωμό κρέατος επαναπροσδιορίζουν την ελληνική γεύση.',
    signatureDishes: ['Slow-Cooked Goat in Clay Pot with Wild Greens', 'Wood-Fired Organic Sourdough Bread with Staka', 'Cretan Boureki with Local Zucchini & Xinomyzithra'],
    signatureDishesEl: ['Κατσικάκι τσικαλάτο με άγρια χόρτα', 'Προζυμένιο ψωμί στον ξυλόφουρνο με στάκα', 'Παραδοσιακό Χανιώτικο Μπουρέκι με κολοκύθι & ξινομυζήθρα'],
    priceLevel: '15-20€',
    coverImageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1510629954389-c1e0da47d414?auto=format&fit=crop&w=1200&q=80'
    ],
    youtubeVideoUrls: [
      'https://www.youtube.com/watch?v=H2j5U-y_S1o'
    ],
    rating: 5.0,
    reviewsCount: 47,
    createdAt: '2025-01-18T16:20:00Z',
    tags: ['Wood-Fired Clay Pots', 'Farm-to-Table', 'Slow Food', 'Crete Mountains'],
    insiderTips: 'Call ahead 2-3 days in high season. Ask Stelios to take you into the open wood-stove kitchen to choose your dishes directly from the clay pots.',
    verifiedSpot: true
  },
  {
    id: 'spot-4',
    authorId: 'user-1',
    author: DEMO_USERS[0],
    title: 'Thalassino Ageri (Tabakaria)',
    titleEl: 'Θαλασσινό Αγέρι (Ταμπακαριά Χανιά)',
    category: 'Seafood & Psarotaverna',
    region: 'Chania & West Crete',
    address: 'Vivilaki 35, Tabakaria Quarter, Chania 731 33',
    googleMapsUrl: 'https://maps.google.com/?q=Thalassino+Ageri+Chania',
    coordinates: { lat: 35.5186, lng: 24.0384 },
    whyIsItSpecial: 'Tables right on the pebbled water edge inside the historic 19th-century leather tanneries (Tabakaria). Unmatched charcoal-grilled Aegean sea bream and red mullets landed hours prior by local coastal caïques, seasoned solely with coarse sea salt and green estate olive oil.',
    whyIsItSpecialEl: 'Τραπέζια ακριβώς εκεί που σκάει το κύμα, στα ιστορικά βιομηχανικά Ταμπακαριά των Χανίων. Φρέσκα ψάρια ημέρας ψημένα στα κάρβουνα με μαεστρία, χοντρό αλάτι και αγουρέλαιο. Ασυναγώνιστη ατμόσφαιρα και κακαβιά.',
    signatureDishes: ['Charcoal Grilled Aegean Red Snapper & Mullet', 'Fresh Sea Urchin Salad (Ahinos)', 'Cretan Fish Soup (Kakavia) with Saffron'],
    signatureDishesEl: ['Φαγκρί & Μπαρμπούνια στα κάρβουνα', 'Φρέσκια Αχινοσαλάτα με λάδι & λεμόνι', 'Χανιώτικη Κακαβιά με σαφράν & πετρόψαρα'],
    priceLevel: '20-25€ και πάνω',
    coverImageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80'
    ],
    youtubeVideoUrls: [
      'https://www.youtube.com/watch?v=kY7w9X8vQ1M'
    ],
    rating: 4.88,
    reviewsCount: 33,
    createdAt: '2025-01-22T19:00:00Z',
    tags: ['Seafront Dining', 'Fresh Aegean Fish', 'Historical Tabakaria', 'Raw Seafood'],
    insiderTips: 'Book table #1 or #2 right on the waterline at sunset time (around 20:00 in summer). The sea urchin pasta special is not on the printed menu, ask the head waiter.',
    verifiedSpot: true
  },
  {
    id: 'spot-5',
    authorId: 'user-2',
    author: DEMO_USERS[1],
    title: 'Bougatsa Bantis (Thessaloniki)',
    titleEl: 'Μπουγάτσα Μπαντής (Θεσσαλονίκη)',
    category: 'Bougatsa & Pastry',
    region: 'Thessaloniki & North',
    address: 'Panagias Faneromenis 33, Thessaloniki 546 32',
    googleMapsUrl: 'https://maps.google.com/?q=Bougatsa+Bantis+Thessaloniki',
    coordinates: { lat: 40.6432, lng: 22.9478 },
    whyIsItSpecial: 'Hand-thrown paper-thin phyllo pastry spun in mid-air using traditional goat butter recipes brought from Cappadocia in 1922. Famous for savory minced beef filling with toasted pine nuts, plus the unsweetened whole-wheat cheese bougatsa that sells out by 9:30 AM.',
    whyIsItSpecialEl: 'Χειροποίητο αέρινο φύλλο ανοιγμένο στον αέρα με αυθεντική συνταγή από την Καισάρεια του 1922. Διάσημη για την κιμαδόπιτα με καβουρδισμένο κουκουνάρι, καθώς και την αυθεντική κρεμώδη μπουγάτσα με κανέλα και άχνη.',
    signatureDishes: ['Handmade Minced Beef Bougatsa with Cappadocia Spices', 'Classic Vanilla Semolina Custard Bougatsa with Cinnamon', 'Savory Myzithra & Feta Cheese Bougatsa'],
    signatureDishesEl: ['Μπουγάτσα με κιμά και μπαχαρικά Ανατολής', 'Κλασική Μπουγάτσα Κρέμα με άχνη & κανέλα', 'Μπουγάτσα με πλούσιο τυρί & βούτυρο γάλακτος'],
    priceLevel: '5-10€',
    coverImageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80'
    ],
    youtubeVideoUrls: [
      'https://www.youtube.com/watch?v=mN5z9wP2k0I'
    ],
    rating: 4.96,
    reviewsCount: 52,
    createdAt: '2025-02-01T08:15:00Z',
    tags: ['Handmade Phyllo', 'Historic Recipe 1922', 'Thessaloniki Heritage', 'Must Breakfast'],
    insiderTips: 'Order a mixed plate with half cream and half minced meat. Pair with traditional Thessaloniki Ariani drink.',
    verifiedSpot: true
  },
  {
    id: 'spot-6',
    authorId: 'user-1',
    author: DEMO_USERS[0],
    title: 'Axiotissa Mezedopoleio (Naxos)',
    titleEl: 'Αξιώτισσα - Μεζεδοπωλείο (Καστράκι Νάξος)',
    category: 'Modern Greek',
    region: 'Cyclades (Naxos/Santorini/Paros)',
    address: 'Kastraki Coast Road, Naxos Island 843 02',
    googleMapsUrl: 'https://maps.google.com/?q=Axiotissa+Naxos',
    coordinates: { lat: 37.0094, lng: 25.3853 },
    whyIsItSpecial: 'Reinventing Cycladic soul food using heirloom organic vegetables grown in the backyard patch and aged Naxian graviera cheeses. The slow-roasted beef cheeks in xinomavro wine and the smoked eggplant with tahini & pomegranate molasses are legendary.',
    whyIsItSpecialEl: 'Επαναπροσδιορίζει την κυκλαδίτικη κουζίνα με βιολογικά λαχανικά από το μποστάνι του μαγαζιού και παλαιωμένη γραβιέρα Νάξου. Τα μοσχαρίσια μάγουλα σε κρασί ξινόμαυρο και η καπνιστή μελιτζάνα με ταχίνι είναι αριστουργήματα.',
    signatureDishes: ['Slow Braised Naxian Beef Cheeks with Sunchoke Puree', 'Smoked Eggplant Carpaccio with Tahini & Pomegranate', 'Fried Naxos Potatoes in Olive Oil with Graviera Shavings'],
    signatureDishesEl: ['Μοσχαρίσια Μάγουλα Νάξου με πουρέ τοπιναμπούρ', 'Καπνιστή Μελιτζάνα με ταχίνι & ρόδι', 'Τηγανητές Πατάτες Νάξου σε ελαιόλαδο με τριμμένη γραβιέρα'],
    priceLevel: '15-20€',
    coverImageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=1200&q=80'
    ],
    youtubeVideoUrls: [
      'https://www.youtube.com/watch?v=vL4c8rT9n1E'
    ],
    rating: 4.93,
    reviewsCount: 39,
    createdAt: '2025-02-05T18:00:00Z',
    tags: ['Organic Garden', 'Naxos Potatoes', 'Cycladic Gastronomy', 'Local Graviera'],
    insiderTips: 'Reservations are strictly mandatory 7 to 10 days in advance during July/August. Do not skip their homemade bread basket with wild oregano.',
    verifiedSpot: true
  },
  {
    id: 'spot-7',
    authorId: 'user-3',
    author: DEMO_USERS[2],
    title: 'Elafonisi & Kedrodasos Turquoise Beach',
    titleEl: 'Ελαφόνιση & Κεδρόδασος (Παραλία)',
    category: 'Παραλίες',
    region: 'Chania & West Crete',
    address: 'Elafonisi & Kedrodasos Coast, Chania, Crete 730 01',
    googleMapsUrl: 'https://maps.google.com/?q=Kedrodasos+Beach+Chania',
    coordinates: { lat: 35.2712, lng: 23.5619 },
    whyIsItSpecial: 'Crystal-clear turquoise lagoon waters framed by ancient wild juniper cedars and pink coral sand. After swimming in Kedrodasos, stop at the nearby mountain village of Elos for local chestnut honey and roasted lamb.',
    whyIsItSpecialEl: 'Κρυστάλλινα τιρκουάζ νερά πλαισιωμένα από αιωνόβιους κέδρους και ροζ κοραλλένια άμμο. Μετά το μπάνιο στο Κεδρόδασος, απαραίτητη στάση στο ορεινό χωριό Έλος για κατσικάκι και τοπικό μέλι καστανιάς!',
    signatureDishes: ['Cold Cretan Raki & Dakos by the Coast', 'Grilled Sea Bream at Sunset', 'Local Thyme Honey Pasteli'],
    signatureDishesEl: ['Κρητικός Ντάκος & Παξιμάδια μετά τη θάλασσα', 'Φρέσκο Ψάρι στα κάρβουνα δίπλα στο κύμα', 'Χειροποίητο Παστέλι με θυμαρίσιο μέλι'],
    priceLevel: '5-10€',
    coverImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80'
    ],
    youtubeVideoUrls: [
      'https://www.youtube.com/watch?v=5b1t8wM6v2Q'
    ],
    rating: 4.98,
    reviewsCount: 44,
    createdAt: '2025-02-08T12:00:00Z',
    tags: ['Turquoise Waters', 'Wild Cedar Forest', 'Pink Sand', 'Crete Beach'],
    insiderTips: 'Arrive before 09:30 AM to enjoy the quietest coves under the cedar trees and bring plenty of cold water.',
    verifiedSpot: true
  },
  {
    id: 'spot-8',
    authorId: 'user-3',
    author: DEMO_USERS[2],
    title: 'Samaria Gorge National Park',
    titleEl: 'Το Φαράγγι της Σαμαριάς (Λευκά Όρη)',
    category: 'Τοποθεσίες',
    region: 'Chania & West Crete',
    address: 'Οροπέδιο Ομαλού - Αγία Ρουμέλη, Σφακιά, Χανιά 730 05',
    googleMapsUrl: 'https://maps.google.com/?q=Samaria+Gorge+Chania',
    coordinates: { lat: 35.3081, lng: 23.9184 },
    whyIsItSpecial: 'One of the longest and most breathtaking gorges in Europe (16 km), carving through the White Mountains down to the Libyan Sea at Agia Roumeli. Famous for the dramatic "Portes" (Iron Gates) where the canyon narrows to just 3 meters and rises 300 meters high, ancient cypress forests, and Cretan wild goats (Kri-Kri).',
    whyIsItSpecialEl: 'Ένα από τα μεγαλύτερα και πιο επιβλητικά φαράγγια της Ευρώπης (16 χλμ.), που διασχίζει τα Λευκά Όρη από το Ξυλόσκαλο Ομαλού μέχρι το Λιβυκό Πέλαγος στην Αγία Ρουμέλη. Ξεχωρίζει για τις θρυλικές «Πόρτες» όπου τα βράχια στενεύουν στα 3 μέτρα, τις κρυστάλλινες πηγές, το εγκαταλελειμμένο χωριό Σαμαριά και τα κρητικά αγριοκάτσικα (Κρι-Κρι).',
    signatureDishes: ['Πεζοπορία 16 χλμ. από Ξυλόσκαλο έως Αγία Ρουμέλη', 'Οι Σιδερένιες «Πόρτες» του Φαραγγιού', 'Βουτιά στα κρυστάλλινα νερά της Αγίας Ρουμέλης'],
    signatureDishesEl: ['Πεζοπορία 16 χλμ. από Ξυλόσκαλο έως Αγία Ρουμέλη', 'Οι Σιδερένιες «Πόρτες» του Φαραγγιού', 'Βουτιά στα κρυστάλλινα νερά της Αγίας Ρουμέλης'],
    priceLevel: '5-10€',
    coverImageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
    ],
    youtubeVideoUrls: [
      'https://www.youtube.com/watch?v=2v4x9zL8p3K'
    ],
    rating: 4.99,
    reviewsCount: 58,
    createdAt: '2025-02-10T07:30:00Z',
    tags: ['Τοποθεσίες', 'Φαράγγι Σαμαριάς', 'Λευκά Όρη', 'Φύση & Πεζοπορία'],
    insiderTips: 'Ξεκινήστε την κατάβαση από το Ξυλόσκαλο στις 07:00 π.μ. με καλά ορειβατικά παπούτσια. Υπάρχουν πηγές με πόσιμο νερό σε όλη τη διαδρομή!',
    verifiedSpot: true
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    targetUserId: 'user-1',
    type: 'comment_on_shared_spot',
    spotId: 'spot-4',
    spotTitle: 'Θαλασσινό Αγέρι (Ταμπακαριά Χανιά)',
    spotCategory: 'Seafood & Psarotaverna',
    actorId: 'user-2',
    actorName: 'Έλενα Βασιλείου',
    actorAvatar: DEMO_USERS[1].avatarUrl,
    messageEl: 'Η Έλενα Βασιλείου σχολίασε στο Spot που μοιραστήκατε: «Θαλασσινό Αγέρι (Ταμπακαριά Χανιά)»',
    messageEn: 'Elena Vasileiou commented on your shared spot: "Thalassino Ageri (Tabakaria)"',
    snippet: 'Το φαγκρί στα κάρβουνα δίπλα στο κύμα ήταν ανεπανάληπτο! ★ 5.0',
    read: false,
    createdAt: 'Πριν 10 λεπτά'
  },
  {
    id: 'notif-2',
    targetUserId: 'ALL',
    type: 'favorite_spot_updated',
    spotId: 'spot-3',
    spotTitle: 'Ντουνιάς - Παραδοσιακή Κρητική Γαστρονομία (Δρακώνα)',
    spotCategory: 'Hidden Mountain Taverna',
    actorId: 'user-3',
    actorName: 'Μανώλης Κατσανεβάκης',
    actorAvatar: DEMO_USERS[2].avatarUrl,
    messageEl: 'Αγαπημένο Spot Ενημερώθηκε: «Ντουνιάς - Παραδοσιακή Κρητική Γαστρονομία» (Νέο YouTube Video & Σημειώσεις)',
    messageEn: 'Favorite Culinary Spot Updated: "Dounias Traditional Gastronomy" (New YouTube Video & Notes)',
    snippet: 'Προστέθηκε νέο βίντεο από τις ξυλόσομπες και τα πήλινα τσικάλια στη Δρακώνα!',
    read: false,
    createdAt: 'Πριν 25 λεπτά'
  },
  {
    id: 'notif-3',
    targetUserId: 'user-1',
    type: 'comment_on_shared_spot',
    spotId: 'spot-6',
    spotTitle: 'Αξιώτισσα - Μεζεδοπωλείο (Καστράκι Νάξος)',
    spotCategory: 'Modern Greek',
    actorId: 'user-5',
    actorName: 'Σοφία Νικολάου',
    actorAvatar: DEMO_USERS[4].avatarUrl,
    messageEl: 'Η Σοφία Νικολάου άφησε νέα κριτική στο Spot σας: «Αξιώτισσα - Μεζεδοπωλείο (Καστράκι Νάξος)»',
    messageEn: 'Sofia Nikolaou left a new review on your shared spot: "Axiotissa Mezedopoleio (Naxos)"',
    snippet: 'Τα μοσχαρίσια μάγουλα και οι πατάτες Νάξου σε ελαιόλαδο είναι όνειρο! ★ 5.0',
    read: false,
    createdAt: 'Πριν 1 ώρα'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    spotId: 'spot-1',
    author: DEMO_USERS[0],
    rating: 5,
    content: 'The texture of the sheep milk base is simply extraordinary. No ice crystals, pure density and the raw aroma of fresh milk. The Aegina pistachio scoop has roasted crunch that proves the nuts were roasted on the same day.',
    visitDate: '2025-02-12',
    signatureOrdered: 'Aegina Pistachio & Kaimaki Double Scoop',
    isApproved: true,
    likesCount: 14,
    createdAt: '2025-02-13T10:30:00Z',
    replies: [
      {
        id: 'rep-1',
        reviewId: 'rev-1',
        author: DEMO_USERS[1],
        content: 'Spot on Kostas! The maestro told me they source their mastic directly from Pyrgi Chios co-op. A game changer in Athens.',
        createdAt: '2025-02-13T12:00:00Z',
        isApproved: true
      }
    ]
  },
  {
    id: 'rev-2',
    spotId: 'spot-2',
    author: DEMO_USERS[1],
    rating: 5,
    content: 'Nothing compares to Kostas red sauce. It has an acidic kick from natural plum tomatoes and hot pepper flakes that cuts through the juicy pork fat perfectly. The dry pita remains crisp even to the last bite.',
    visitDate: '2025-02-14',
    signatureOrdered: 'Pork Kalamaki Pita with Double Red Sauce',
    isApproved: true,
    likesCount: 19,
    createdAt: '2025-02-14T15:20:00Z',
    replies: []
  },
  {
    id: 'rev-3',
    spotId: 'spot-3',
    author: DEMO_USERS[3],
    rating: 5,
    content: 'Eating at Dounias is a spiritual experience for anyone who values slow food. The wild mountain stamnagathi has zero bitterness and the wood-fired clay pot goat melts with a gentle fork touch.',
    visitDate: '2025-02-18',
    signatureOrdered: 'Clay Pot Braised Goat & Mountain Sourdough',
    isApproved: true,
    likesCount: 22,
    createdAt: '2025-02-19T09:40:00Z',
    replies: []
  }
];
