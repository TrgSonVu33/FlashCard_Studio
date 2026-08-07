// Flashcard categories and data
// Each category has a key, label, and emoji for display
// Each flashcard set has 10 English-to-Vietnamese vocabulary cards

export const CATEGORIES = [
  { key: 'animals',         label: 'Animals',         emoji: '🐾' },
  { key: 'fruits',          label: 'Fruits',          emoji: '🍎' },
  { key: 'colors',          label: 'Colors',          emoji: '🎨' },
  { key: 'body_parts',      label: 'Body Parts',      emoji: '🫀' },
  { key: 'drinks',          label: 'Drinks',          emoji: '🥤' },
  { key: 'school_supplies', label: 'School Supplies', emoji: '📚' },
];

export const FLASHCARDS = {
  animals: [
    { id: 1,  q: "Horse",    a: "Con Ngựa" },
    { id: 2,  q: "Goat",     a: "Con Dê" },
    { id: 3,  q: "Sheep",    a: "Con Cừu" },
    { id: 4,  q: "Tiger",    a: "Con Hổ" },
    { id: 5,  q: "Lion",     a: "Con Sư tử" },
    { id: 6,  q: "Elephant", a: "Con Voi" },
    { id: 7,  q: "Bear",     a: "Con Gấu" },
    { id: 8,  q: "Monkey",   a: "Con Khỉ" },
    { id: 9,  q: "Giraffe",  a: "Con Hươu cao cổ" },
    { id: 10, q: "Rabbit",   a: "Con Thỏ" },
  ],

  fruits: [
    { id: 1,  q: "Apple",      a: "Quả Táo" },
    { id: 2,  q: "Banana",     a: "Quả Chuối" },
    { id: 3,  q: "Orange",     a: "Quả Cam" },
    { id: 4,  q: "Mango",      a: "Quả Xoài" },
    { id: 5,  q: "Grape",      a: "Quả Nho" },
    { id: 6,  q: "Watermelon", a: "Quả Dưa hấu" },
    { id: 7,  q: "Pineapple",  a: "Quả Dứa" },
    { id: 8,  q: "Strawberry", a: "Quả Dâu tây" },
    { id: 9,  q: "Coconut",    a: "Quả Dừa" },
    { id: 10, q: "Lemon",      a: "Quả Chanh" },
  ],

  colors: [
    { id: 1,  q: "Red",    a: "Màu Đỏ" },
    { id: 2,  q: "Blue",   a: "Màu Xanh dương" },
    { id: 3,  q: "Green",  a: "Màu Xanh lá" },
    { id: 4,  q: "Yellow", a: "Màu Vàng" },
    { id: 5,  q: "White",  a: "Màu Trắng" },
    { id: 6,  q: "Black",  a: "Màu Đen" },
    { id: 7,  q: "Purple", a: "Màu Tím" },
    { id: 8,  q: "Pink",   a: "Màu Hồng" },
    { id: 9,  q: "Orange", a: "Màu Cam" },
    { id: 10, q: "Brown",  a: "Màu Nâu" },
  ],

  body_parts: [
    { id: 1,  q: "Head",     a: "Đầu" },
    { id: 2,  q: "Hand",     a: "Bàn tay" },
    { id: 3,  q: "Foot",     a: "Bàn chân" },
    { id: 4,  q: "Eye",      a: "Mắt" },
    { id: 5,  q: "Ear",      a: "Tai" },
    { id: 6,  q: "Nose",     a: "Mũi" },
    { id: 7,  q: "Mouth",    a: "Miệng" },
    { id: 8,  q: "Shoulder", a: "Vai" },
    { id: 9,  q: "Knee",     a: "Đầu gối" },
    { id: 10, q: "Finger",   a: "Ngón tay" },
  ],

  drinks: [
    { id: 1,  q: "Water",      a: "Nước" },
    { id: 2,  q: "Milk",       a: "Sữa" },
    { id: 3,  q: "Coffee",     a: "Cà phê" },
    { id: 4,  q: "Tea",        a: "Trà" },
    { id: 5,  q: "Juice",      a: "Nước ép" },
    { id: 6,  q: "Soda",       a: "Nước ngọt" },
    { id: 7,  q: "Smoothie",   a: "Sinh tố" },
    { id: 8,  q: "Lemonade",   a: "Nước chanh" },
    { id: 9,  q: "Cocoa",      a: "Ca cao" },
    { id: 10, q: "Yogurt",     a: "Sữa chua" },
  ],

  school_supplies: [
    { id: 1,  q: "Pencil",     a: "Bút chì" },
    { id: 2,  q: "Pen",        a: "Bút mực" },
    { id: 3,  q: "Eraser",     a: "Cục tẩy" },
    { id: 4,  q: "Ruler",      a: "Thước kẻ" },
    { id: 5,  q: "Notebook",   a: "Vở" },
    { id: 6,  q: "Backpack",   a: "Ba lô" },
    { id: 7,  q: "Scissors",   a: "Kéo" },
    { id: 8,  q: "Glue",       a: "Keo dán" },
    { id: 9,  q: "Marker",     a: "Bút dạ" },
    { id: 10, q: "Sharpener",  a: "Gọt bút chì" },
  ],
};
