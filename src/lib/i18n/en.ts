import type { Dictionary } from "./th";

const en: Dictionary = {
  // ─── Common ───
  common: {
    cancel: "Cancel",
    confirm: "Confirm",
    ok: "OK",
    close: "Close",
    save: "Save",
    saving: "Saving...",
    loading: "Loading...",
    error: "Error",
    back: "Back",
    or: "or",
    edit: "Edit",
    recommended: "Recommended",
    noData: "No data found",
    loginFirst: "Please log in first",
    tryAgain: "Something went wrong. Please try again.",
    processing: "Processing...",
  },

  // ─── Bottom Tab Footer ───
  footer: {
    home: "Home",
    openCard: "Open Card",
    profile: "Profile",
  },

  // ─── Login ───
  login: {
    title: "Log In",
    email: "Email",
    emailPlaceholder: "Enter your email",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    resetPassword: "Reset password",
    submit: "Log In",
    submitting: "Logging in...",
    register: "Register",
    socialLogin: "Log in with Social Network",
  },

  // ─── Register ───
  register: {
    title: "Edit Personal Info",
    email: "Email",
    emailPlaceholder: "Enter your email",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    confirmPassword: "Password (again)",
    confirmPasswordPlaceholder: "Enter your password (again)",
    passwordMismatch: "Passwords do not match",
    passwordRequirement:
      "Password must contain at least 1 lowercase, 1 uppercase, 1 number, and 1 special character (!@#$%^&* etc.)",
    agreeTos: "Accept",
    tosLink: "Terms of Service",
    agreePrivacy: "Allow the platform to collect usage data",
    submit: "Register",
    submitting: "Registering...",
    login: "Log In",
  },

  // ─── Forgot Password ───
  forgot: {
    title: "Reset Password",
    description:
      "Enter your email and we will send you a link to reset your password.",
    email: "Email",
    submit: "Send reset link",
    sent: "Reset link sent! Please check your inbox/spam folder.",
    tip: 'Tip: Search for an email from "Supabase" or check your spam folder.',
    backToLogin: "Back to login",
  },

  // ─── Reset Password ───
  resetPassword: {
    title: "Set New Password",
    description: "Please enter your new password (minimum 8 characters)",
    newPassword: "Enter new password",
    confirmPassword: "Confirm new password",
    minLength: "Password must be at least 8 characters",
    mismatch: "Passwords do not match",
    submitting: "Updating password...",
    submit: "Set New Password",
  },

  // ─── Menu ───
  menu: {
    general: "General",
    personalInfo: "Personal Info",
    systemLanguage: "Language",
    password: "Password",
    aboutSection: "About Tarot & Oracle",
    aboutUs: "About Us",
    tos: "Terms of Service",
    privacy: "Privacy Policy",
    contactUs: "Contact Us",
    deleteAccount: "Delete Account Request",
    logout: "Log Out",
    logoutConfirm: "Are you sure you want to log out?",
    deleteConfirm:
      "Please confirm account deletion. Once confirmed, this action cannot be undone.",
    deleteSuccess:
      "Your account deletion has been confirmed. Your account will be deleted within 7 days.",
    sendingRequest: "Sending...",
  },

  // ─── Language Modal ───
  languageModal: {
    title: "Select Language",
    thai: "ไทย",
    english: "English",
  },

  // ─── Settings / Change Password ───
  changePassword: {
    title: "Change Password",
    currentPassword: "Current Password",
    currentPasswordPlaceholder: "Enter current password",
    newPassword: "New Password",
    newPasswordPlaceholder: "Enter new password",
    newPasswordHint:
      "Must be at least 8 characters with uppercase, lowercase, and numbers",
    confirmPassword: "Confirm New Password",
    confirmPasswordPlaceholder: "Enter new password again",
    submit: "Change Password",
    submitting: "Processing...",
    incomplete: "Incomplete",
    incompleteSub: "Please fill in all fields",
    tooShort: "Password too short",
    tooShortSub: "New password must be at least 8 characters",
    weak: "Weak password",
    weakSub: "Password must contain uppercase, lowercase, and numbers",
    mismatch: "Passwords do not match",
    mismatchSub: "Please make sure the passwords match",
    wrongCurrent: "Incorrect password",
    wrongCurrentSub: "Current password is incorrect",
    tooCommon:
      "This password is too common. Please choose a more complex password.",
    noUser: "User not found",
    noUserSub: "Please log in again",
    success: "Success",
    successSub: "Password changed successfully",
    errorSub: "Unable to change password. Please try again.",
  },

  // ─── Open Card ───
  openCard: {
    title: "Open Card",
    subtitle: "Select a card deck to use",
    all: "All",
    favorite: "Favorite",
    viewInfo: "View Info",
    readFortune: "Read Fortune",
    vipOnly: "VIP Only",
    loginRequired: "Please log in first",
    trialExpired: "Trial expired. Please subscribe to VIP.",
    membersOnly: "This deck is for members only",
    opening: "Opening deck...",
    cannotOpen: "Cannot open deck at this time",
    serverError: "Server connection error",
    noItems: "No items",
    loginToFavorite: "Please log in to save favorites",
  },

  // ─── Reading ───
  reading: {
    title: "Open Card",
    selectSpread: "Select the card spread for your reading",
    subscribeVip: "Subscribe to VIP",
    spreadCard: "Spread",
    cards: "cards",
    circleSpread: "12 Cards (Circle)",
    spread1Desc: "Quick answers, clear insights",
    spread2Desc: "Compare options / pros & cons",
    spread3Desc: "Past / Present / Future",
    spread4Desc: "Situation / Obstacle / Advice / Outcome",
    spread5Desc: "Add a fifth perspective",
    spread6Desc: "Multi-factor overview",
    spread9Desc: "Detailed 9-point analysis",
    spread10Desc: "10-card spread for complex issues",
    spread12Desc: "Complete 12-point analysis",
    spread12CircleDesc: "12-card circle spread",
    questionLabel: "Question or topic for your reading",
    questionPlaceholder: "Leave blank if you prefer not to ask a question",
    focusHint: "Please focus and think about what you want to ask",
    autoShuffle: "Auto Shuffle",
    manualShuffle: "Manual Shuffle",
  },

  // ─── Reading Result ───
  readingResult: {
    yourCards: "Your Cards",
    missingParams: "Missing parameters",
    deckNotFound: "Deck not found",
    cardsNotFound: "No cards found in this deck",
    loadError: "Error loading data",
    noResult: "No results found",
    backToSpread: "Back to spread selection",
    preparingCards: "Preparing cards...",
    cardNumber: "Card #",
    tapToNext: "Tap to go to the next card",
    cardPosition: "Card position #",
    viewCardDetails: "View card details",
    reshuffleAuto: "Reshuffle",
    reshuffleManual: "Shuffle again",
    saveImage: "Save Image",
    shareToFriend: "Share with friends",
    shareTitle: "Your Cards - TAROT & ORACLE",
    cannotCreateImage: "Unable to create image",
    creatingImage: "Creating image...",
  },

  // ─── Packages / VIP ───
  packages: {
    title: "Subscribe VIP",
    trialBanner: "You are using VIP Trial",
    daysLeft: "Days left:",
    days: "days",
    vipMember: "You are a",
    vipYearly: "VIP Yearly member",
    vipMonthly: "VIP Monthly member",
    until: "Until",
    heroTitle: 'Turn your phone into a personal VIP "fortune table"',
    heroDesc:
      "Unlock 20+ licensed card decks, unlimited access 24/7.",
    benefitsTitle: "VIP benefits you will receive:",
    benefit1Title: "Access all decks:",
    benefit1Desc: "20+ authentic decks (including popular ones) in one app",
    benefit2Title: "Unlimited readings:",
    benefit2Desc: "Open cards as many times as you want per day",
    benefit3Title: "Save & Share:",
    benefit3Desc: "Save beautiful reading results and share instantly",
    benefit4Title: "Try for free!:",
    benefit4Desc: "First 30 days for new members",
    monthlyTitle: "VIP Monthly",
    monthlyPrice: "68.- (normally 98.-)",
    monthlyAvg: "Less than ฿3 per day",
    yearlyTitle: "VIP Yearly",
    yearlyPrice: "680.- (normally 980.-)",
    yearlyAvg: "Less than ฿2 per day",
    yearlyBonus:
      "Free! Mystery box worth 500.- (delivered to your door) *Limited quantity",
    currentPlan: "Current VIP",
    connecting: "Connecting...",
    priceNotFound: "Price not found",
    restorePurchase: "Restore purchase",
  },

  // ─── Profile ───
  profile: {
    title: "Personal Info",
    loading: "Loading...",
    noUser: "User not found",
    invalidFile: "Invalid file type",
    invalidFileSub: "Please upload image files only",
    fileTooLarge: "File too large",
    fileTooLargeSub: "Please select an image under 20 MB",
    uploading: "Uploading photo...",
    uploadSuccess: "Success",
    uploadSuccessSub: "Photo uploaded successfully!",
    uploadError: "Error uploading photo",
    yourPackage: "Your Package",
    trial30: "30-day trial",
    freemium: "Freemium",
    vip: "VIP",
    trial: "TRIAL",
    expired: "Expired",
    subscribeVip: "Subscribe VIP",
    planTrial: "Free Trial (VIP)",
    planBasic: "Basic Member",
    planMonthly: "Monthly VIP",
    planYearly: "Annual VIP",
    badgeTrial: "Free Trial (VIP)",
    badgeMonthly: "Monthly VIP",
    badgeYearly: "Annual VIP",
    stripeId: "Customer ID (Stripe)",
    fullName: "Full Name",
    nickname: "Nickname",
    phone: "Phone",
    emailLabel: "Email",
    address: "Address",
  },

  // ─── Profile Edit ───
  profileEdit: {
    title: "Edit Personal Info",
    loading: "Loading...",
    noUser: "User not found",
    firstName: "First Name",
    firstNamePlaceholder: "John",
    lastName: "Last Name",
    nickname: "Nickname",
    phone: "Phone",
    phonePlaceholder: "08xxxxxxxx",
    phoneHelp: "Contact support to change phone number",
    email: "Email",
    emailPlaceholder: "example@email.com",
    emailHelp: "Contact support to change email",
    addressLabel: "Address",
    addressPlaceholder: "123/45 Main Street",
    shareInfoSection: "Info displayed on shared images",
    profileSection: "Your Profile Info",
    username: "Username",
    profilePicture: "Profile Picture",
    socialMedia: "Social Media",
    socialMax: "(max 3)",
    name: "Name",
    noUserFound: "User not found",
    saveError: "Error saving data",
    saveSuccess: "✓ Saved successfully",
  },

  // ─── Contact / About / TnC / Policy ───
  contact: { title: "Contact Us" },
  about: { title: "About Us" },
  tnc: { title: "Terms of Service" },
  policy: { title: "Privacy Policy" },

  // ─── Error Page ───
  errorPage: {
    title: "Error",
    description: "Sorry, something went wrong. Please try again.",
    backHome: "Back to Home",
    goRegister: "Go to Register",
    errorCode: "Error code:",
  },

  // ─── Session Conflict ───
  sessionConflict: {
    title: "Unable to log in",
    description: "This account is currently being used on another device",
  },

  // ─── Header ───
  header: {
    vipPromo: "Subscribe VIP — TAROT & ORACLE",
    linkCopied: "Link copied",
    noShareUrl: "No share URL found",
  },

  // ─── Promo Modal ───
  promo: {
    viewDetails: "View Details",
    dontShowAgain: "Don't show again",
  },

  // ─── Free Decks ───
  freeDecks: {
    title: "Free Decks for Members",
    noDecks: "No free decks available right now",
    loginToFavorite: "Please log in to save favorites",
    removeFavorite: "Remove from favorites",
    addFavorite: "Add to favorites",
    viewInfo: "View Info",
    readFortune: "Read Fortune",
  },

  // ─── Status Modal ───
  statusModal: {
    purchaseSuccess: "✅ Purchased",
    purchaseSuccessSuffix: "successfully!",
    purchaseCancelled: "⚠️ Payment cancelled",
    package: "Package",
  },
};

export default en;
