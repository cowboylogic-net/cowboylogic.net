# ✅ Registration Feature Development Checklist (Backend)

## 📁 Phase 1: Models & Database Design

### 🔧 1. Update User model (`models/User.js`)

- [x] Keep only fields, які спільні для всіх користувачів:
  - `id` (UUID, primary key)
  - `email` (string, required, unique)
  - `password` (string, required)
  - `fullName` (string, required)
  - `phoneNumber` (string, optional)
  - `role` (enum or string, required) — values: `'user'`, `'partner'`, `'admin'`, `'superAdmin'`
  - `newsletter` (boolean, default: `false`)
  - `heardAboutUs` (string, optional)
  - `isEmailVerified` (boolean, default: `false`)
- [x] Define association:
  - `User.hasOne(PartnerProfile, { foreignKey: 'userId', onDelete: 'CASCADE' })`

### 🆕 2. Create new model: `models/PartnerProfile.js`

- [x] Fields:
  - `id` (auto-increment or UUID, primary key)
  - `userId` (foreign key to `User`, required, unique)
  - `organizationName` (string, required)
  - `businessType` (string, optional)
  - `address` (string, optional)
  - `address2` (string, optional)
  - `billingAddress` (string, optional)
  - `city` (string, optional)
  - `postalCode` (string, optional)
  - `state` (string, optional)
  - `country` (string, optional)
- [x] Define association:
  - `PartnerProfile.belongsTo(User, { foreignKey: 'userId' })`

### ⚙️ 3. Database Sync / Migration

- [x] If using sync:
  - `sequelize.sync({ alter: true })` (only for dev)
- [ ] If using migrations:
  - Create separate migration files for `User` and `PartnerProfile`
- [x] Ensure all fields have correct types and constraints
- [x] Apply proper indexes (e.g., unique `email`, foreign key on `PartnerProfile.userId`)

---

## 📁 Phase 2: Controllers and Route Logic

### 📍 4. Registration Route (`routes/auth.js`)

- [x] Accept POST `/register` with:
  - Required: `email`, `password`, `repeatPassword`, `fullName`, `role`, `termsAgreed`
  - Optional: `phoneNumber`, `newsletter`, `heardAboutUs`
  - If `role === 'partner'`: also accept `partnerProfile` object with:
    - `organizationName`, `businessType`, `address`, etc.
- [x] Route logic:
  - Validate input
  - Register user with `User.create()`
  - If `role === 'partner'`: create `PartnerProfile` linked to user
  - Return token or success response

### 🧠 5. Update `authController.register()` logic

- [x] Check `role` validity (`'user'` or `'partner'`)
- [x] Hash password before saving
- [x] If `role === 'partner'`, validate and save partner data separately
- [x] Wrap both creates in transaction (`sequelize.transaction()`) for atomicity
- [x] Return created user and token
- [x] Optional: send welcome/confirmation email

---

## 📁 Phase 3: Backend Validation

### ✅ 6. Joi Schema for registration (`schemas/authSchema.js`)

- [x] `email` — valid email, required
- [x] `password` and `repeatPassword` — must match
- [x] `fullName` — required
- [x] `role` — required, must be one of `'user'`, `'partner'`
- [x] If `role === 'partner'`, `partnerProfile` object:
  - `organizationName` — required
  - other fields — optional
- [x] `termsAgreed` — required `true` boolean
- [x] Optional fields: `phoneNumber`, `newsletter`, `heardAboutUs`

---

## 📁 Phase 4: Roles & Authorization

### 🔐 7. Role Field Management

- [x] Default: `'user'`
- [x] Checkbox: if selected → `'partner'`
- [x] Protect role field from being arbitrarily set by user (enforce rules in controller)

### 🔑 8. Middlewares (optional, future)

- [x] Add `checkRole('admin')`, `checkRole('partner')` for future use
- [x] Secure admin-only or partner-only routes

---

## 📁 Phase 5: Testing

### 🧪 9. Manual & Unit Tests

- [ ] Successful registration as regular user
- [ ] Successful registration as partner (with linked PartnerProfile)
- [ ] Error: invalid email
- [ ] Error: mismatched passwords
- [ ] Error: missing required fields based on role
- [ ] Data correctly stored in `User` and `PartnerProfile`
- [ ] Transaction rollback on failure

---

## 🧠 Optional / Future Enhancements

- [x] Email verification token and `/verify-email` endpoint
- [ ] Admin review/approval for new partner registrations
- [x] Auto-login after successful registration
- [ ] Multi-step form frontend support
- [x] GDPR consent timestamp storage
- [x] Rate limiting on registration endpoint

---

## ⛳ Final Pre-Frontend Review

- [x] User model has only general fields
- [x] PartnerProfile is created only when needed
- [x] Associations between User and PartnerProfile work correctly
- [x] All logic wrapped in try/catch with transactions
- [x] All validation errors return structured messages
- [x] Roles are enforced securely
