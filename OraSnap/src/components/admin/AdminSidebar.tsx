import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Camera,
  Calendar,
  DollarSign,
  Settings,
  Bell,
  ShieldAlert,
  FileText,
  BarChart3,
  Activity,
  Download,
  CheckSquare,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  title: string;
  icon: React.ElementType;
  value: string;
  badge?: number;
}

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingCount?: number;
  disputeCount?: number;
  moderationCount?: number;
}

export function AdminSidebar({ 
  activeTab, 
  onTabChange, 
  pendingCount = 0,
  disputeCount = 0,
  moderationCount = 0 
}: AdminSidebarProps) {
  const navItems: NavItem[] = [
    { title: 'Overview', icon: LayoutDashboard, value: 'overview' },
    { title: 'Analytics', icon: BarChart3, value: 'analytics' },
    { title: 'Photographers', icon: Camera, value: 'photographers', badge: pendingCount },
    { title: 'Users', icon: Users, value: 'users' },
    { title: 'Bookings', icon: Calendar, value: 'bookings' },
    { title: 'Booking Calendar', icon: Calendar, value: 'calendar' },
    { title: 'Payments', icon: DollarSign, value: 'payments' },
    { title: 'Disputes', icon: ShieldAlert, value: 'disputes', badge: disputeCount },
    { title: 'Moderation', icon: CheckSquare, value: 'moderation', badge: moderationCount },
    { title: 'Announcements', icon: Bell, value: 'announcements' },
    { title: 'Activity Logs', icon: Activity, value: 'activity' },
    { title: 'Export Data', icon: Download, value: 'export' },
    { title: 'Settings', icon: Settings, value: 'settings' },
  ];

  return (
    <div className="w-64 border-r border-border bg-card min-h-[calc(100vh-4rem)]">
      <ScrollArea className="h-full py-4">
        <div className="px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.value}
              onClick={() => onTabChange(item.value)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                activeTab === item.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge && item.badge > 0 && (
                <span className={cn(
                  "px-2 py-0.5 text-xs rounded-full",
                  activeTab === item.value
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-destructive/10 text-destructive"
                )}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
