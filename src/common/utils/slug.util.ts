/**
 * Латин/кирилл нэрийг URL-д тохирох slug болгоно.
 *   "Camo Star Trucker" -> "camo-star-trucker"
 *   "Хүрэм хар"         -> "khurem-khar"
 */
const CYRILLIC: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'ye',
  ё: 'yo',
  ж: 'j',
  з: 'z',
  и: 'i',
  й: 'i',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  ө: 'u',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ү: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sh',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .split('')
    .map((ch) => CYRILLIC[ch] ?? ch)
    .join('')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}
