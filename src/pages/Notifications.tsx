import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Search, CheckCheck, Trash2, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useNotifications } from '@/lib/notification-context';
import { formatDistanceToNow } from 'date-fns';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
    default: return <Info className="h-5 w-5 text-blue-500" />;
  }
};

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifications = useMemo(() => 
    notifications.filter(notification => {
      const matchesSearch = (notification.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                           (notification.message?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      if (activeTab === 'unread') return matchesSearch && !notification.read;
      if (activeTab === 'read') return matchesSearch && notification.read;
      return matchesSearch;
    }), [notifications, searchQuery, activeTab]);

  const handleNotificationClick = (id: string, read: boolean) => {
    if (!read) {
      markAsRead(id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 gradient-primary rounded-xl">
            <Bell className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with your latest activities {unreadCount > 0 && `(${unreadCount} unread)`}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    All Notifications
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllAsRead}
                      >
                        <CheckCheck className="h-4 w-4 mr-2" />
                        Mark all read
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mx-6 mb-4">
                    <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
                    <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
                    <TabsTrigger value="read">Read ({notifications.length - unreadCount})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={activeTab} className="mt-0">
                    {filteredNotifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No notifications found</h3>
                        <p className="text-muted-foreground">
                          {searchQuery ? 'Try adjusting your search terms' : 'You\'re all caught up!'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {filteredNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`group p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 ${
                              !notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                            }`}
                            onClick={() => handleNotificationClick(notification.id, notification.read)}
                          >
                            <div className="flex items-start gap-4">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {notification.title}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    {!notification.read && (
                                      <Badge variant="destructive" className="text-xs">
                                        New
                                      </Badge>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeNotification(notification.id);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-muted-foreground">
                                    {notification.created_at ? 
                                      formatDistanceToNow(new Date(notification.created_at), { addSuffix: true }) : 
                                      'Unknown time'
                                    }
                                  </p>
                                  {!notification.read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-3 text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(notification.id);
                                      }}
                                    >
                                      Mark as read
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with quick stats */}
          <div className="lg:w-80">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notification Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Total</span>
                  <Badge variant="secondary">{notifications.length}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                  <span className="text-sm font-medium">Unread</span>
                  <Badge variant="destructive">{unreadCount}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm font-medium">Read</span>
                  <Badge className="bg-green-600 hover:bg-green-700">{notifications.length - unreadCount}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}