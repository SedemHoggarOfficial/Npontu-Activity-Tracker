import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Activity {
  id: number;
  title: string;
  description?: string;
  remark?: string;
  status_id: number;
  creator_name: string;
  updated_at: string;
}

// export interface Activity {
//   id: number;
//   title: string;
//   description: string;
//   status_id: number;
//   status: {
//     id: number;
//     name: string;
//     color?: string;
//   };
//   created_by: {
//     id: number;
//     name: string;
//   };
//   updated_at: string;
//   created_at: string;
//   updates: ActivityUpdate[];
// }

export interface ActivityStatus {
  id: number;
  name: string;
}

export interface ActivityUpdate {
    id: number;
    activity?: Activity & { id: number };
    user?: { id: number; name: string; email?: string };
    status?: ActivityStatus;
    remark?: string;
    created_at: string;
    [key: string]: unknown;
}

export interface ActivityUpdate {
    id: number;
    activity?: Activity;
    user?: User;
    status?: ActivityStatus;
    remark?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        first?: string;
        last?: string;
        prev?: string;
        next?: string;
    };
}


