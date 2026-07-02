export const COMPLAINT_TYPES = [
  "تأخر في إنجاز معاملة",
  "تعامل الموظف مقدم الخدمة",
  "تعطل النظام التقني",
  "تعقيد في الإجراءات",
  "رسوم الخدمة",
  "ضعف جودة الخدمة",
  "طول مدة الانتظار",
  "عدم الموافقة على الخدمة",
] as const;

export const COMPLAINT_STATUSES = [
  { label: "قيد الانتظار", value: "PENDING" },
  { label: "قيد المعالجة", value: "IN_PROGRESS" },
  { label: "تم الحل", value: "RESOLVED" },
  { label: "مغلقة", value: "CLOSED" },
  { label: "مرفوضة", value: "REJECTED" },
] as const;

export const PROVINCES = [
  "دمشق",
  "ريف دمشق",
  "حلب",
  "حمص",
  "اللاذقية",
  "حماة",
  "طرطوس",
  "دير الزور",
  "الحسكة",
  "الرقة",
  "إدلب",
  "السويداء",
  "درعا",
  "القنيطرة",
] as const;

export const AGENCIES = [
  "وزارة الإدارة المحلية والبيئة",
  "وزارة المالية",
  "وزارة الدفاع",
  "وزارة الاقتصاد والصناعة",
  "وزارة التعليم العالي",
  "وزارة الصحة",
  "وزارة التربية",
  "وزارة الطاقة",
  "أمانة رئاسة مجلس الوزراء",
  "وزارة الأشغال العامة والإسكان",
  "وزارة الاتصالات والتقانة",
  "وزارة الداخلية",
  "وزارة الزراعة",
  "وزارة الشؤون الاجتماعية والعمل",
  "وزارة الثقافة",
  "وزارة النقل",
  "وزارة العدل",
  "وزارة السياحة",
  "وزارة الإعلام",
  "وزارة الأوقاف",
  "نقابة المعلمين",
  "الاتحاد الرياضي العام",
  "الاتحاد العام للفلاحين",
  "مجلس الدولة",
  "وزارة التنمية الإدارية",
  "وزارة الخارجية والمغتربين",
  "وزارة الطوارئ والكوارث",
  "الهيئة العامة للمنافذ البرية والبحرية",
] as const;

export const AUDIT_ACTION_OPTIONS = [
  { label: "إنشاء شكوى", value: "CREATE_COMPLAINT" },
  { label: "تحديث شكوى", value: "UPDATE_COMPLAINT" },
  { label: "الرد على شكوى", value: "RESPOND_TO_COMPLAINT" },
  { label: "طلب معلومات إضافية", value: "REQUEST_ADDITIONAL_INFO" },
  { label: "تقديم معلومات إضافية", value: "PROVIDE_ADDITIONAL_INFO" },
  { label: "إلغاء طلب المعلومات", value: "CANCEL_INFO_REQUEST" },
  { label: "تسجيل رمز الإشعارات", value: "REGISTER_NOTIFICATION_TOKEN" },
  { label: "إلغاء رمز الإشعارات", value: "UNREGISTER_NOTIFICATION_TOKEN" },
  { label: "إرسال إشعار", value: "SEND_NOTIFICATION" },
  { label: "تسجيل دخول", value: "LOGIN" },
  { label: "دخول مواطن", value: "LOGIN_CITIZEN" },
  { label: "دخول موظف", value: "LOGIN_EMPLOYEE" },
  { label: "تسجيل مواطن جديد", value: "REGISTER_CITIZEN" },
  { label: "إنشاء مواطن", value: "CREATE_CITIZEN" },
  { label: "تحديث مواطن", value: "UPDATE_CITIZEN" },
  { label: "حذف مواطن", value: "DELETE_CITIZEN" },
  { label: "إنشاء موظف", value: "CREATE_EMPLOYEE" },
  { label: "تحديث موظف", value: "UPDATE_EMPLOYEE" },
  { label: "حذف موظف", value: "DELETE_EMPLOYEE" },
  { label: "تحديث صلاحيات المستخدم", value: "UPDATE_USER_PERMISSIONS" },
  { label: "إنشاء دور (Role)", value: "CREATE_ROLE" },
  { label: "تحديث دور (Role)", value: "UPDATE_ROLE" },
  { label: "حذف دور (Role)", value: "DELETE_ROLE" },
  { label: "تحديث صلاحيات الدور", value: "UPDATE_ROLE_PERMISSIONS" },
  { label: "تغيير كلمة المرور", value: "CHANGE_PASSWORD" },
  { label: "إعادة تعيين كلمة المرور", value: "RESET_PASSWORD" },
] as const;

export const AUDIT_TARGET_TYPE_OPTIONS = [
  { label: "شكوى", value: "COMPLAINT" },
  { label: "طلب معلومات", value: "INFORMATION_REQUEST" },
  { label: "رمز إشعارات", value: "NOTIFICATION_TOKEN" },
  { label: "إشعار", value: "NOTIFICATION" },
  { label: "مستخدم", value: "USER" },
  { label: "مواطن", value: "CITIZEN" },
  { label: "موظف", value: "EMPLOYEE" },
  { label: "دور", value: "ROLE" },
] as const;

export const DEMO_PASSWORD = "Demo12345!";

export const DEMO_ACCOUNTS = {
  admin: { email: "admin@demo.com", password: DEMO_PASSWORD, role: "PLATFORM_ADMIN", firstName: "أحمد", lastName: "المدير" },
  supervisor: { email: "supervisor@demo.com", password: DEMO_PASSWORD, role: "SUPERVISOR", firstName: "سارة", lastName: "المشرفة" },
  viewer: { email: "viewer@demo.com", password: DEMO_PASSWORD, role: "VIEWER", firstName: "محمد", lastName: "المشاهد" },
} as const;

export const DEMO_ACCOUNT_OPTIONS = [
  {
    id: "admin",
    loginType: "admin" as const,
    label: "مدير المنصة",
    roleLabel: "PLATFORM_ADMIN",
    email: DEMO_ACCOUNTS.admin.email,
    password: DEMO_PASSWORD,
  },
  {
    id: "supervisor",
    loginType: "employee" as const,
    label: "مشرف",
    roleLabel: "SUPERVISOR",
    email: DEMO_ACCOUNTS.supervisor.email,
    password: DEMO_PASSWORD,
  },
  {
    id: "viewer",
    loginType: "employee" as const,
    label: "مشاهد",
    roleLabel: "VIEWER",
    email: DEMO_ACCOUNTS.viewer.email,
    password: DEMO_PASSWORD,
  },
] as const;
