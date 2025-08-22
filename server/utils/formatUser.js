// utils/formatUser.js
export const formatUser = (user) => {
  if (!user) return null;

  const plain = user.toJSON?.() || user;

  // Прибираємо чутливе
  delete plain.password;
  delete plain.tokenVersion;

  // НЕ видаляємо isSuperAdmin і дати (щоб UI міг їх показати)
  // Нормалізуємо абсолютний URL для аватарки
  if (plain.avatarURL && !plain.avatarURL.startsWith("http")) {
    const base = process.env.BASE_URL?.replace(/\/+$/, "") || "";
    const rel = plain.avatarURL.startsWith("/") ? plain.avatarURL : `/${plain.avatarURL}`;
    plain.avatarURL = `${base}${rel}`;
  }

  // Дати -> ISO, щоб не було "Invalid Date"
  if (plain.createdAt) plain.createdAt = new Date(plain.createdAt).toISOString();
  if (plain.updatedAt) plain.updatedAt = new Date(plain.updatedAt).toISOString();

  // Зручний ярлик для UI: показувати "superAdmin", якщо прапорець true
  plain.effectiveRole = plain.isSuperAdmin ? "superAdmin" : plain.role;

  // Акуратно віддати partnerProfile (як і було)
  const profile = plain.partnerProfile || null;
  plain.partnerProfile = profile?.organizationName
    ? {
        organizationName: profile.organizationName,
        businessType: profile.businessType || null,
        address: profile.address || null,
        address2: profile.address2 || null,
        billingAddress: profile.billingAddress || null,
        city: profile.city || null,
        postalCode: profile.postalCode || null,
        state: profile.state || null,
        country: profile.country || null,
      }
    : null;

  return plain;
};
