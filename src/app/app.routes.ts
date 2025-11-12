import { Routes } from '@angular/router';
import { HomePage } from './customer-app/pages/HomePage/HomePage';
import { ProductDetailPage } from './customer-app/pages/ProductDetailPage/ProductDetailPage';
import { CollectionPage } from './customer-app/pages/CollectionPage/CollectionPage';
import { ProductsPage } from './customer-app/pages/ProductsPage/ProductsPage';
import { LandiPage } from './customer-app/pages/LandiPage/LandiPage';
import { PaymentPage } from './customer-app/pages/PaymentPage/PaymentPage';
import { OrderHistoryPage } from './customer-app/pages/OrderHistoryPage/OrderHistoryPage';
import { NotFoundPage } from './customer-app/pages/NotFoundPage/NotFoundPage';
import { LoginPage } from './customer-app/pages/LoginPage/LoginPage';
import { SignUpPage } from './customer-app/pages/SignUpPage/SignUpPage';
import { ForgotPasswordPage } from './customer-app/pages/ForgotPasswordPage/ForgotPasswordPage';
import { ResetPasswordPage } from './customer-app/pages/ResetPasswordPage/ResetPasswordPage';
import { DefaultLayout } from './customer-app/components/DefaultLayout/DefaultLayout';
import { BlankLayout } from './customer-app/components/BlankLayout/BlankLayout';
import { PolicyPage } from './customer-app/pages/PolicyPage/PolicyPage';
import { PrivacyPolicyPage } from './customer-app/pages/PrivacyPolicyPage/PrivacyPolicyPage';
import { WarrantyPolicyPage } from './customer-app/pages/WarrantyPolicyPage/WarrantyPolicyPage';
import { ForbiddenPage } from './customer-app/pages/ForbiddenPage/ForbiddenPage';

// Admin imports
import { AdminLayout } from './admin-app/components/AdminLayout/AdminLayout';
import { ProductManagementPage } from './admin-app/pages/ProductManagementPage/ProductManagementPage';
import { OrderManagementPage } from './admin-app/pages/OrderManagementPage/OrderManagementPage';
import { UserManagementPage } from './admin-app/pages/UserManagementPage/UserManagementPage';

// Guards
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
    {
        path: '',
        component: DefaultLayout,
        children: [
            { path: '', component: HomePage },
            { path: 'detail/:id', component: ProductDetailPage },
            { path: 'collection', component: CollectionPage },
            { path: 'products', component: ProductsPage },
            { path: 'landing', component: LandiPage },
            { path: 'payment', component: PaymentPage },
            { path: 'orders', component: OrderHistoryPage },
            { path: 'policy', component: PolicyPage },
            { path: 'warranty-policy', component: WarrantyPolicyPage },
            { path: 'privacy-policy', component: PrivacyPolicyPage }
        ]
    },
    {
        path: 'login',
        component: BlankLayout,
        children: [
            { path: '', component: LoginPage }
        ]
    },
    {
        path: 'sign-up',
        component: BlankLayout,
        children: [
            { path: '', component: SignUpPage }
        ]
    },
    {
        path: 'forgot-password',
        component: BlankLayout,
        children: [
            { path: '', component: ForgotPasswordPage }
        ]
    },
    {
        path: 'reset-password',
        component: BlankLayout,
        children: [
            { path: '', component: ResetPasswordPage }
        ]
    },
    {
        path: 'forbidden',
        component: BlankLayout,
        children: [
            { path: '', component: ForbiddenPage }
        ]
    },
    {
        path: 'admin',
        component: AdminLayout,
        canActivate: [adminGuard],
        children: [
            { path: '', redirectTo: 'products', pathMatch: 'full' },
            { path: 'products', component: ProductManagementPage },
            { path: 'orders', component: OrderManagementPage },
            { path: 'users', component: UserManagementPage }
        ]
    },
    { path: '**', component: NotFoundPage }
];
