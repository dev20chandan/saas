# SchoolSaaS ERP - Project Tree Structure

Below is the directory tree structure for the entire project, divided into the **Backend** (`school-erp-backend`) and **Frontend** (`school-erp-frontend`). Excludes `node_modules`, `.git`, `.next`, and `dist` for clarity.

```text
school-erp-backend/
├── .env
├── .env.example
├── .gitignore
├── .prettierrc
├── README.md
├── eslint.config.mjs
├── nest-cli.json
├── package-lock.json
├── package.json
├── tsconfig.build.json
├── tsconfig.json
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── logger.middleware.ts
│   ├── main.ts
│   ├── seed.ts
│   ├── admins/
│   │   ├── admins.controller.spec.ts
│   │   ├── admins.controller.ts
│   │   ├── admins.module.ts
│   │   ├── admins.service.spec.ts
│   │   └── admins.service.ts
│   ├── audit/
│   │   ├── audit.controller.spec.ts
│   │   ├── audit.controller.ts
│   │   ├── audit.module.ts
│   │   ├── audit.service.spec.ts
│   │   └── audit.service.ts
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── jwt-auth.guard.ts
│   │   ├── jwt.strategy.ts
│   │   ├── roles.guard.ts
│   │   ├── decorators/
│   │   │   └── roles.decorator.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   ├── common/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   └── interceptors/
│   │       └── transform.interceptor.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── schools/
│   │   ├── schools.controller.ts
│   │   ├── schools.module.ts
│   │   ├── schools.service.spec.ts
│   │   ├── schools.service.ts
│   │   └── dto/
│   │       ├── create-school.dto.ts
│   │       └── update-school.dto.ts
│   ├── stats/
│   │   ├── stats.controller.ts
│   │   ├── stats.module.ts
│   │   └── stats.service.ts
│   ├── support/
│   │   ├── support.controller.spec.ts
│   │   ├── support.controller.ts
│   │   ├── support.module.ts
│   │   ├── support.service.spec.ts
│   │   └── support.service.ts
│   └── users/
│       ├── users.controller.ts
│       ├── users.module.ts
│       ├── users.service.ts
│       └── dto/
│           ├── create-user.dto.ts
│           └── update-user.dto.ts
└── test/
    ├── app.e2e-spec.ts
    └── jest-e2e.json

school-erp-frontend/
├── .env
├── .env.local
├── .gitignore
├── README.md
├── env.example
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── school_illustration.png
│   ├── vercel.svg
│   └── window.svg
└── src/
    ├── app/
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── admins/
    │   │   ├── page.tsx
    │   │   ├── create/
    │   │   │   └── page.tsx
    │   │   └── [id]/
    │   │       └── edit/
    │   │           └── page.tsx
    │   ├── analytics/
    │   │   └── page.tsx
    │   ├── audit/
    │   │   └── page.tsx
    │   ├── dashboard/
    │   │   └── page.tsx
    │   ├── login/
    │   │   └── page.tsx
    │   ├── payments/
    │   │   └── page.tsx
    │   ├── register/
    │   │   └── page.tsx
    │   ├── schools/
    │   │   └── page.tsx
    │   ├── settings/
    │   │   └── page.tsx
    │   ├── subscriptions/
    │   │   └── page.tsx
    │   ├── support/
    │   │   └── page.tsx
    │   └── users/
    │       ├── page.tsx
    │       └── create/
    │           └── page.tsx
    ├── components/
    │   ├── PageTracker.tsx
    │   ├── auth/
    │   │   ├── CredentialsStep.tsx
    │   │   ├── RegisterAdminInfo.tsx
    │   │   ├── RegisterPlans.tsx
    │   │   ├── RegisterReview.tsx
    │   │   ├── RegisterSchoolInfo.tsx
    │   │   ├── RegisterSuccess.tsx
    │   │   ├── SchoolIdStep.tsx
    │   │   └── SuccessStep.tsx
    │   ├── dashboard/
    │   │   ├── DashboardLayout.tsx
    │   │   └── Sidebar.tsx
    │   └── ui/
    │       ├── DataTable.tsx
    │       └── StatCard.tsx
    ├── hooks/
    │   ├── useAdmins.ts
    │   ├── useAudit.ts
    │   ├── useSchools.ts
    │   ├── useStats.ts
    │   ├── useSubscriptions.ts
    │   ├── useSupport.ts
    │   ├── useTransactions.ts
    │   └── useUsers.ts
    └── lib/
        ├── AuthContext.tsx
        ├── ThemeContext.tsx
        ├── api.ts
        └── auth.ts
```
