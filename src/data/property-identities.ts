/** Reviewed name mapping, 2026-09-07. IDs are never assigned by row position. */
export const identities = [
  ["aia", "Aia", "აია", ["Aya"]],
  ["philiali", "Filiali", "ფილიალი", ["Philiali"]],
  ["gelati", "Gelati", "გელათი", []],
  ["geologist", "Geologi", "გეოლოგი", ["Geologist", "Geolog"]],
  ["intouristi", "Hotel Tskaltubo / Intourist", "სასტუმრო წყალტუბო / ინტურისტი", ["Intouristi", "Intourist"]],
  ["imereti", "Imereti", "იმერეთი", []],
  ["iveria", "Iveria", "ივერია", []],
  ["legends", "Legends / former military sanatorium", "ლეგენდს / ყოფილი სამხედრო სანატორიუმი", ["Legends Tskaltubo Spa Resort", "Military sanatorium"]],
  ["medea", "Medea", "მედეა", []],
  ["megobroba", "Megobroba", "მეგობრობა", []],
  ["meshakhte", "Meshakhte", "მეშახტე", ["Shakhtiori", "Miner"]],
  ["metalurgi", "Metalurgi", "მეტალურგი", ["Metallurgist", "Metallurg"]],
  ["rioni", "Rioni", "რიონი", []],
  ["rkinigzeli", "Rkinigzeli", "რკინიგზელი", ["Railwayman"]],
  ["sakartvelo", "Sakartvelo", "საქართველო", ["Georgia"]],
  ["samgurali", "Samgurali", "სამგურალი", []],
  ["savane", "Savane", "სავანე", []],
  ["sinatle", "Sinatle", "სინათლე", []],
  ["tbilisi", "Tbilisi", "თბილისი", []],
  ["tsiskari", "Tsiskari", "ცისკარი", []],
  ["tskaltubo-rustaveli-48", "Sanatorium Tskaltubo · Rustaveli 48", "სანატორიუმი წყალტუბო · რუსთაველის 48", ["Sanatorium Tskaltubo"]],
  ["ushishroeba", "Ushishroeba", "უშიშროება", []],
] as const;
/** Unverified cadastral references from audit §8.2; no title certification. */
export const auditIdentityMapping: Readonly<Record<string, string>> = {
  intouristi: "29.08.35.065", geologist: "29.08.31.399", savane: "29.08.33.076",
  imereti: "29.08.32.395", meshakhte: "29.08.32.091", rkinigzeli: "29.08.35.118",
  megobroba: "29.08.35.153", philiali: "29.08.33.086", gelati: "29.08.31.392",
  aia: "29.08.34.001", medea: "29.08.35.108",
};
