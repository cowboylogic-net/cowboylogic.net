export const formatUser = (user) => {
  if (!user) return null;

  const plain = user.toJSON?.() || user;

  // 🧹 Видаляємо чутливі або непотрібні поля
  delete plain.password;
  delete plain.tokenVersion;
  delete plain.isSuperAdmin;
  delete plain.createdAt;
  delete plain.updatedAt;

  // 🖼️ Фікс URL до аватарки
  if (plain.avatarURL && !plain.avatarURL.startsWith("http")) {
    plain.avatarURL = `${process.env.BASE_URL}${plain.avatarURL}`;
  }

  // 🧾 Форматуємо partnerProfile — віддаємо лише дозволені поля
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
