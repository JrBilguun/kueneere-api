/**
 * Системийн эрхүүд. users.roles баганад CSV хэлбэрээр хадгалагдана
 * (жишээ: "user,marketer").
 */
export enum Role {
  /** Бүх эрхтэй */
  ADMIN = 'admin',
  /** Бараа, ангилал, захиалга удирдана */
  MANAGER = 'manager',
  /** Кампанит ажил, контент, төсөв, аудитори удирдана */
  MARKETER = 'marketer',
  /** Дэлгүүрийн энгийн хэрэглэгч */
  USER = 'user',
}

export const STAFF_ROLES = [Role.ADMIN, Role.MANAGER, Role.MARKETER];
