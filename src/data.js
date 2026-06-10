export const ADMIN_PASSWORD = 'admin@nexshop';
export const DEFAULT_UPI = 'MAB.037326059540013@AXISBANK';

export function formatCurrency(value) {
  const number = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  return isNaN(number)
    ? '₹0.00'
    : `₹${number.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

export function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  const v = String(value).trim().toLowerCase();
  return !['false', '0', 'no', ''].includes(v);
}

export function buildUpiHref(method, upiId, amount) {
  const parsedAmount = Number(String(amount).replace(/[^0-9.]/g, ''));
  const amountValue = isNaN(parsedAmount) ? 0 : parsedAmount;
  const txnId = Math.floor(Math.random() * 1e10);

  if (method === 'phonepe') {
    const isAndroid = /android/.test(navigator.userAgent.toLowerCase());
    if (isAndroid) {
      const payload = {
        contact: { cbcName: '', nickName: '', vpa: upiId, type: 'VPA' },
        p2pPaymentCheckoutParams: {
          note: 'Shopping',
          isByDefaultKnownContact: true,
          initialAmount: Math.round(amountValue * 100),
          currency: 'INR',
          checkoutType: 'DEFAULT',
          transactionContext: 'p2p',
        },
      };
      const encoded = encodeURIComponent(
        encodeURIComponent(JSON.stringify(payload)),
      );
      return `phonepe://native?data=${encoded}`;
    }
  }

  if (method === 'paytm') {
    return `paytmmp://cash_wallet?pa=${upiId}&pn=Shopping&am=${amountValue}&cu=INR&tn=${txnId}&featuretype=money_transfer`;
  }

  return `upi://pay?pa=${upiId}&pn=Shopping&am=${amountValue}&cu=INR&tn=${txnId}`;
}

export function buildQrCodeUrl(upiId, amount) {
  const amountValue = Number(String(amount).replace(/[^0-9.]/g, '')) || 0;
  const uri = `upi://pay?pa=${upiId}&pn=Shopping&am=${amountValue}&cu=INR`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(uri)}`;
}

export function parseProductRows(text) {
  const rows = text.trim().split(/\r?\n/).filter(Boolean);
  if (rows.length < 2) return [];
  const delimiter = rows[0].includes('\t')
    ? '\t'
    : rows[0].includes(';')
    ? ';'
    : ',';

  const parseLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (char === delimiter && !inQuotes) {
        values.push(current);
        current = '';
        continue;
      }
      current += char;
    }
    values.push(current);
    return values;
  };

  const headers = parseLine(rows[0]).map((header) =>
    header.trim().toLowerCase().replace(/[\s_-]/g, ''),
  );

  return rows.slice(1).map((row) => {
    const values = parseLine(row);
    const item = {};
    headers.forEach((key, index) => {
      item[key] = (values[index] || '').trim();
    });
    return normalizeCsvProduct(item);
  }).filter(Boolean);
}

function normalizeCsvProduct(item) {
  const name =
    item.name || item.productname || item.title || item.product || '';
  if (!name) return null;
  const id = item.id ? parseInt(item.id, 10) : Date.now() + Math.floor(Math.random() * 1000);
  return {
    id,
    name,
    sellPrice: formatCurrency(item.sellprice || item.price || item.saleprice || item.sell || '199'),
    mrpPrice: formatCurrency(item.mrpprice || item.mrp || item.originalprice || '5999'),
    offPercent: item.offpercent || item.discount || item.off || '97% off',
    imgUrl: item.imgurl || item.image || item.imageurl || item.img || item.photo || '',
    rating: item.rating || '4.2',
    reviewCount: item.reviewcount || item.reviews || '500',
    freeDelivery: parseBoolean(item.freedelivery || item.delivery || 'true'),
  };
}

export const PRODUCT_DESCRIPTIONS = {
  1: `Upgrade your daily nutrition with this value-packed dry fruits combo that includes Almonds, Cashews, Pistachios (Pista), and Kishmish (Raisins) — each in 1KG quantity.

Carefully selected for premium quality, these dry fruits are rich in protein, healthy fats, and essential nutrients. Whether you're boosting your energy, preparing festive sweets, or looking for a healthy snack, this combo is the perfect choice.

💥 Best for: Daily use, festivals, gifting, and bulk savings.

🔥 Key Features:
👉 Includes 4 Premium Dry Fruits – Almonds, Cashews, Pistachios & Raisins
👉 1KG Each – Total 4KG Value Pack
👉 Rich in Protein, Fiber & Healthy Nutrients
👉 Fresh, Crunchy & Naturally Delicious
👉 Perfect for Daily Snacking & Festive Gifting
👉 Budget-Friendly Combo Offer`,
  2: `Get the best of staple groceries in one power-packed combo! This Essential Grocery Mega Saver Combo includes Rice 5KG, Atta 10KG, Sugar 5KG & Soya Oil 5L — covering all your kitchen essentials.

💥 Best for: Monthly grocery savings, family use, and bulk buying.

🔥 Key Features:
👉 Rice 5KG – Premium quality
👉 Atta 10KG – Soft & healthy wheat flour
👉 Sugar 5KG – Pure refined sugar
👉 Soya Oil 5L – Heart-healthy cooking oil
👉 Huge 97% Discount
👉 Free Delivery`,
  3: `This Daily Essentials Mega Saver Combo is your one-stop solution for all kitchen needs. Includes Atta 10KG, Basmati Rice 5KG, Sugar 5KG & Soya Oil 5L.

💥 Best for: Daily cooking, family packs, and bulk grocery shopping.

🔥 Key Features:
👉 Atta 10KG – Premium quality wheat flour
👉 Basmati Rice 5KG – Long grain aromatic rice
👉 Sugar 5KG – Refined white sugar
👉 Soya Oil 5L – Light & healthy cooking oil
👉 Amazing 97% off deal
👉 Free Delivery included`,
  default: `This amazing combo gives you incredible value for money. Carefully sourced and quality-checked, every item in this pack is designed to meet your daily needs.

💥 Best for: Daily use, family packs, and bulk savings.

🔥 Key Features:
👉 Premium quality products
👉 Huge savings at ₹199 only
👉 Free Delivery
👉 97% discount on MRP
👉 Trusted & verified seller`,
};

export const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: 'Premium 4KG Mix Dry Fruits Combo – Almonds, Cashews, Pistachios & Kishmish (1KG Each)',
    sellPrice: '₹199.00',
    mrpPrice: '₹5,999.00',
    offPercent: '97% off',
    rating: '3.9',
    reviewCount: '1374',
    imgUrl:
      'https://cdn.shopify.com/s/files/1/0728/8487/9496/files/Gemini_Generated_Image_mgf77cmgf77cmgf7.png?v=1774764915',
    freeDelivery: true,
  },
  {
    id: 2,
    name: 'Essential Grocery Mega Saver Combo – Rice 5KG, Atta 10KG, Sugar 5KG & Soya Oil 5L',
    sellPrice: '₹199.00',
    mrpPrice: '₹5,999.00',
    offPercent: '97% off',
    rating: '3.6',
    reviewCount: '6476',
    imgUrl:
      'https://cdn.shopify.com/s/files/1/0728/8487/9496/files/Gemini_Generated_Image_e5duave5duave5du.png?v=1774764917',
    freeDelivery: true,
  },
  {
    id: 3,
    name: 'Daily Essentials Mega Saver Combo – Atta 10KG, Basmati Rice 5KG, Sugar 5KG & Soya Oil 5L',
    sellPrice: '₹199.00',
    mrpPrice: '₹5,999.00',
    offPercent: '97% off',
    rating: '3.7',
    reviewCount: '4802',
    imgUrl:
      'https://cdn.shopify.com/s/files/1/0728/8487/9496/files/Gemini_Generated_Image_b7k5xsb7k5xsb7k5.png?v=1774764917',
    freeDelivery: true,
  },
  {
    id: 4,
    name: 'Rasoi Samagri Special Combo – 20KG Atta, 5KG Sugar, 1KG Besan & 5L Mustard Oil',
    sellPrice: '₹199.00',
    mrpPrice: '₹5,999.00',
    offPercent: '97% off',
    rating: '4.4',
    reviewCount: '1343',
    imgUrl:
      'https://cdn.shopify.com/s/files/1/0728/8487/9496/files/Gemini_Generated_Image_j3ynhoj3ynhoj3yn.png?v=1774764914',
    freeDelivery: true,
  },
  {
    id: 5,
    name: 'Grocery Essentials Combo – 10KG Rice, 10KG Atta & 5L Kachi Ghani Mustard Oil',
    sellPrice: '₹199.00',
    mrpPrice: '₹5,999.00',
    offPercent: '97% off',
    rating: '3.9',
    reviewCount: '7961',
    imgUrl:
      'https://cdn.shopify.com/s/files/1/0728/8487/9496/files/Gemini_Generated_Image_oyjekioyjekioyje.png?v=1774764922',
    freeDelivery: true,
  },
  {
    id: 6,
    name: '5KG Premium Mix Dry Fruits Combo – Almonds, Cashews, Pistachios, Walnuts & Raisins',
    sellPrice: '₹199.00',
    mrpPrice: '₹5,999.00',
    offPercent: '97% off',
    rating: '4.4',
    reviewCount: '1796',
    imgUrl:
      'https://cdn.shopify.com/s/files/1/0728/8487/9496/files/Gemini_Generated_Image_9avcrz9avcrz9avc.png?v=1774764871',
    freeDelivery: true,
  },
  {
    id: 7,
    name: 'Surf Excel Easy Wash 10KG Pack + FREE Comfort Fabric Conditioner 1L',
    sellPrice: '₹199.00',
    mrpPrice: '₹5,999.00',
    offPercent: '97% off',
    rating: '4.0',
    reviewCount: '2293',
    imgUrl:
      'https://cdn.shopify.com/s/files/1/0728/8487/9496/files/Gemini_Generated_Image_jyteb2jyteb2jyte.png?v=1774764921',
    freeDelivery: true,
  },
  {
    id: 8,
    name: 'Super Cleaning Combo – Ariel Liquid 6.4L + Tide Powder 8KG + 3x Harpic Toilet Cleaner',
    sellPrice: '₹199.00',
    mrpPrice: '₹5,999.00',
    offPercent: '97% off',
    rating: '3.6',
    reviewCount: '8307',
    imgUrl:
      'https://cdn.shopify.com/s/files/1/0728/8487/9496/files/Gemini_Generated_Image_5d5dyu5d5dyu5d5d.png?v=1774764922',
    freeDelivery: true,
  },
  {
    id: 9,
    name: 'Super Saver Grocery Combo – Rice 5KG, Atta 10KG, Sugar 5KG & Refined Oil 5L',
    sellPrice: '₹199.00',
    mrpPrice: '₹5,999.00',
    offPercent: '97% off',
    rating: '3.5',
    reviewCount: '8689',
    imgUrl:
      'https://cdn.shopify.com/s/files/1/0728/8487/9496/files/Gemini_Generated_Image_7i9cdo7i9cdo7i9c.png?v=1774764921',
    freeDelivery: true,
  },
  {
    id: 10,
    name: 'Mega Kitchen Combo – Atta 5KG, Sunflower Oil 5L, Ghee 1L, Salt 1KG & Sugar 1KG',
    sellPrice: '₹199.00',
    mrpPrice: '₹5,999.00',
    offPercent: '97% off',
    rating: '4.4',
    reviewCount: '3592',
    imgUrl:
      'https://cdn.shopify.com/s/files/1/0728/8487/9496/files/Gemini_Generated_Image_ax3dasax3dasax3d.png?v=1774764920',
    freeDelivery: true,
  },
  {
    id: 11,
    name: 'Limited Time Grocery Combo – Rice 5KG, Atta 5KG, Oil 5L, Salt 1KG & Sugar 1KG',
    sellPrice: '₹199.00',
    mrpPrice: '₹5,999.00',
    offPercent: '97% off',
    rating: '4.0',
    reviewCount: '6340',
    imgUrl:
      'https://cdn.shopify.com/s/files/1/0728/8487/9496/files/Gemini_Generated_Image_rhct2trhct2trhct.png?v=1774764919',
    freeDelivery: true,
  },
  {
    id: 12,
    name: 'Beverage & Grocery Combo – Tata Tea 1.5KG, Sugar 5KG, Coffee, Green Tea & Masala Tea',
    sellPrice: '₹199.00',
    mrpPrice: '₹5,999.00',
    offPercent: '97% off',
    rating: '3.5',
    reviewCount: '6085',
    imgUrl:
      'https://cdn.shopify.com/s/files/1/0728/8487/9496/files/Gemini_Generated_Image_tjjtxctjjtxctjjt.png?v=1774764920',
    freeDelivery: true,
  },
  {
    id: 13,
    name: 'Mega Home Care Combo – Ariel 5KG, Washing Liquid, Toilet Cleaner (2x), Soaps & Dove Shampoo 1L',
    sellPrice: '₹199.00',
    mrpPrice: '₹5,999.00',
    offPercent: '97% off',
    rating: '3.6',
    reviewCount: '8205',
    imgUrl:
      'https://cdn.shopify.com/s/files/1/0728/8487/9496/files/ChatGPT_Image_Mar_18_2026_09_43_30_PM.png?v=1774764860',
    freeDelivery: true,
  },
  {
    id: 14,
    name: 'Double Value Oil Combo – 15L Sunflower Oil + 15L Groundnut Oil (Total 30 Litres)',
    sellPrice: '₹199.00',
    mrpPrice: '₹5,999.00',
    offPercent: '97% off',
    rating: '4.2',
    reviewCount: '9913',
    imgUrl:
      'https://cdn.shopify.com/s/files/1/0728/8487/9496/files/ChatGPT_Image_Mar_18_2026_09_46_12_PM.png?v=1774764860',
    freeDelivery: true,
  },
  {
    id: 15,
    name: 'Double Nut Combo – 5KG Almonds + 5KG Cashews (Total 10KG Pack)',
    sellPrice: '₹199.00',
    mrpPrice: '₹5,999.00',
    offPercent: '97% off',
    rating: '3.5',
    reviewCount: '9029',
    imgUrl:
      'https://cdn.shopify.com/s/files/1/0728/8487/9496/files/ChatGPT_Image_Mar_18_2026_09_47_43_PM.png?v=1774764862',
    freeDelivery: true,
  },
  {
    id: 16,
    name: 'Essential Grocery Combo – Besan (5KG), Atta 5KG, Moong Dal 1KG, Oil 1L & Sugar 1KG',
    sellPrice: '₹199.00',
    mrpPrice: '₹5,999.00',
    offPercent: '97% off',
    rating: '4.2',
    reviewCount: '6169',
    imgUrl:
      'https://cdn.shopify.com/s/files/1/0728/8487/9496/files/ChatGPT_Image_Mar_18_2026_09_49_55_PM.png?v=1774764863',
    freeDelivery: true,
  },
  {
    id: 17,
    name: 'Mega Personal Care Combo – Tide 8KG, Head & Shoulders Shampoo 2L, Nivea Soaps & Colgate Pack',
    sellPrice: '₹199.00',
    mrpPrice: '₹5,999.00',
    offPercent: '97% off',
    rating: '3.8',
    reviewCount: '4245',
    imgUrl:
      'https://cdn.shopify.com/s/files/1/0728/8487/9496/files/ChatGPT_Image_Mar_18_2026_09_52_51_PM.png?v=1774764858',
    freeDelivery: true,
  },
];

export const DEFAULT_REVIEWS = [
  {
    name: 'Rahul Sharma',
    rating: 5,
    status: 'Very Good',
    date: '05 Jan, 2026',
    verified: true,
    helpful: 48,
    hasPhoto: true,
    comment:
      'Really impressed with the quality. It looks exactly like the photo and feels premium. Totally satisfied with this purchase — will definitely order again!',
  },
  {
    name: 'Priya G',
    rating: 4,
    status: 'Good',
    date: '02 Jan, 2026',
    verified: true,
    helpful: 31,
    hasPhoto: true,
    comment:
      'Product is exactly as shown in the pictures. Delivery was quick and packaging was super neat. Highly recommended to everyone!',
  },
  {
    name: 'Sneha Kulkarni',
    rating: 5,
    status: 'Very Good',
    date: '28 Dec, 2025',
    verified: true,
    helpful: 27,
    hasPhoto: false,
    comment:
      'Great value for money. The quality exceeded my expectations and I\'m very happy with the overall experience. Must buy!',
  },
];
