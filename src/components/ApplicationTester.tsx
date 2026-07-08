import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { testScenarios, mockPhotographers, mockBookings, mockAnalytics } from '@/utils/mockData';
import { formatPriceLocal } from '@/lib/currency';
import { Play, CheckCircle, XCircle, Users, Calendar, DollarSign, Star, TrendingUp } from 'lucide-react';

interface TestResult {
  success: boolean;
  message: string;
  error?: any;
}

export default function ApplicationTester() {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  const runTest = async (testName: string, testFunction: () => Promise<TestResult>) => {
    setCurrentTest(testName);
    try {
      const result = await testFunction();
      setTestResults(prev => ({ ...prev, [testName]: result }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { success: false, message: 'Test failed', error } 
      }));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults({});
    
    await runTest('User Booking Flow', testScenarios.userBookingFlow);
    await runTest('Photographer Flow', testScenarios.photographerFlow);
    await runTest('Search Flow', testScenarios.searchFlow);
    
    setCurrentTest('');
    setIsRunning(false);
  };

  const getTestIcon = (testName: string) => {
    if (currentTest === testName) return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
    if (!testResults[testName]) return <Play className="w-4 h-4 text-gray-400" />;
    return testResults[testName].success 
      ? <CheckCircle className="w-4 h-4 text-green-600" />
      : <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getTestStatus = (testName: string) => {
    if (currentTest === testName) return 'running';
    if (!testResults[testName]) return 'pending';
    return testResults[testName].success ? 'passed' : 'failed';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SnapZeiT Application Tester
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Comprehensive testing suite with mock data to validate all application features
          </p>
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg"
          >
            {isRunning ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Running Tests...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Run All Tests
              </div>
            )}
          </Button>
        </div>

        {/* Mock Data Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">{mockPhotographers.length}</div>
              <div className="text-sm text-gray-600">Mock Photographers</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">{mockBookings.length}</div>
              <div className="text-sm text-gray-600">Mock Bookings</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">${mockAnalytics.total_earnings.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Mock Earnings</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">{mockAnalytics.average_rating}</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: 'User Booking Flow',
              description: 'Tests complete user journey from browsing to booking',
              steps: ['Browse photographers', 'Search & filter', 'View profile', 'Read reviews', 'Create booking']
            },
            {
              name: 'Photographer Flow',
              description: 'Tests photographer dashboard and management features',
              steps: ['View bookings', 'Check analytics', 'Read messages', 'Handle notifications']
            },
            {
              name: 'Search Flow',
              description: 'Tests search and filtering functionality',
              steps: ['Search by name', 'Filter by location', 'Filter by price', 'Sort results']
            }
          ].map((test) => (
            <Card key={test.name} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">{test.name}</CardTitle>
                  {getTestIcon(test.name)}
                </div>
                <p className="text-sm text-gray-600">{test.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 mb-4">
                  {test.steps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <span className="text-gray-600">{step}</span>
                    </div>
                  ))}
                </div>
                
                <Badge 
                  variant={
                    getTestStatus(test.name) === 'passed' ? 'default' :
                    getTestStatus(test.name) === 'failed' ? 'destructive' :
                    getTestStatus(test.name) === 'running' ? 'secondary' : 'outline'
                  }
                  className="w-full justify-center py-2"
                >
                  {getTestStatus(test.name) === 'running' && 'Running...'}
                  {getTestStatus(test.name) === 'passed' && '✅ Passed'}
                  {getTestStatus(test.name) === 'failed' && '❌ Failed'}
                  {getTestStatus(test.name) === 'pending' && '⏳ Pending'}
                </Badge>
                
                {testResults[test.name] && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {testResults[test.name].message}
                    </p>
                    {testResults[test.name].error && (
                      <p className="text-xs text-red-600 mt-1">
                        Error: {testResults[test.name].error.message}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sample Data Preview */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Sample Mock Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Featured Photographers</h4>
                <div className="space-y-2">
                  {mockPhotographers.slice(0, 3).map(photographer => (
                    <div key={photographer.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <img 
                        src={photographer.avatar_url} 
                        alt={photographer.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{photographer.name}</div>
                        <div className="text-xs text-gray-600">{photographer.specialty} • {photographer.location}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{formatPriceLocal(photographer.price_per_hour, photographer.currency || 'USD')} /hr</div>
                        <div className="text-xs text-yellow-600">★ {photographer.rating}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Recent Bookings</h4>
                <div className="space-y-2">
                  {mockBookings.map(booking => (
                    <div key={booking.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium text-sm">{booking.client_name}</div>
                        <Badge variant={
                          booking.status === 'confirmed' ? 'default' :
                          booking.status === 'pending' ? 'secondary' : 'outline'
                        } className="text-xs">
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        {booking.event_type} • {booking.event_date} • {formatPriceLocal(booking.total_amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Console */}
        <Card className="bg-gray-900 text-green-400 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-green-400">Test Console</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-sm space-y-1">
              <div>🚀 SnapZeiT Application Test Suite Ready</div>
              <div>📊 Mock Data: {mockPhotographers.length} photographers, {mockBookings.length} bookings loaded</div>
              <div>🧪 Test Scenarios: User flow, Photographer flow, Search functionality</div>
              <div>✨ Click "Run All Tests" to validate complete application</div>
              {isRunning && <div className="text-yellow-400">⏳ Running tests... Please wait</div>}
              {Object.keys(testResults).length > 0 && !isRunning && (
                <div className="text-blue-400">
                  ✅ Tests completed: {Object.values(testResults).filter(r => r.success).length}/{Object.keys(testResults).length} passed
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}