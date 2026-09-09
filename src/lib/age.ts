export const MIN_AGE = 13;

export function ageFromDob(dob: Date, now: Date = new Date()): number {
  let age = now.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    now.getMonth() < dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

// 13+ gate. Under 13 is blocked outright - no child flow in v1.
export function isOldEnough(dob: Date, now: Date = new Date()): boolean {
  return ageFromDob(dob, now) >= MIN_AGE;
}
