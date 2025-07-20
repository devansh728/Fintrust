import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Home, FileText, User, Lock, Rocket } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
  { to: '/digilocker', label: 'DigiLocker', icon: <FileText className="w-5 h-5" /> },
  { to: '/requests', label: 'Requests', icon: <Lock className="w-5 h-5" /> },
  { to: '/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
];

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 opacity-30">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AnimatedBackground />
      <div className="min-h-screen flex relative">
        <aside className="w-64 bg-white/80 shadow-xl flex flex-col items-center py-8 backdrop-blur-md z-10 border-r border-gray-200">
          <Avatar className="mb-6 w-16 h-16 border-4 border-blue-100">
            <AvatarFallback className="bg-blue-600 text-white font-bold text-xl">FC</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold mb-8 tracking-tight text-gray-800">Fintust Canara</h1>
          <nav className="flex flex-col gap-2 w-full px-4">
            {navItems.map((item) => (
              <Button
                key={item.to}
                asChild
                variant="ghost"
                className="justify-start text-lg font-medium flex gap-3 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
              >
                <Link to={item.to} className="w-full flex items-center">
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Link>
              </Button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-8 z-10">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/digilocker" element={<DigiLockerPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <Card className="shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Account Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Balance, recent activity, and quick actions will appear here.</p>
          <Button className="w-full bg-blue-600 hover:bg-blue-700" variant="default">View Details</Button>
        </CardContent>
      </Card>
      
      <Card className="shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-indigo-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            Recent Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">See your latest requests and their status.</p>
          <Button className="w-full" variant="outline" asChild>
            <Link to="/requests">Go to Requests</Link>
          </Button>
        </CardContent>
      </Card>
      
      <Card className="shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 bg-gradient-to-br from-white to-red-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-red-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Security & Anomaly
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Monitor your account for unusual activity and manage security settings.</p>
          <Button className="w-full bg-red-600 hover:bg-red-700" variant="destructive">Report Anomaly</Button>
        </CardContent>
      </Card>
      
      <Card className="col-span-1 md:col-span-3 shadow-xl mt-4 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 border-0 bg-gradient-to-r from-white via-purple-50 to-white">
        <CardHeader>
          <CardTitle className="text-purple-800">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button variant="default" className="bg-purple-600 hover:bg-purple-700" asChild>
            <Link to="/digilocker">Connect DigiLocker</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/requests">Initiate Request</Link>
          </Button>
          <Button variant="outline">Download Statement</Button>
          <Button variant="ghost">Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function RequestsPage() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [dynamicFields, setDynamicFields] = useState('');
  
  const handleSubmit = () => {
    // Handle form submission
    console.log('Request submitted:', { title, desc, dynamicFields });
    setTitle('');
    setDesc('');
    setDynamicFields('');
    setShowForm(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            variant="default" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowForm(!showForm)}
          >
            <Rocket className="mr-2 w-4 h-4" /> 
            {showForm ? 'Cancel Request' : 'Initiate New Request'}
          </Button>
        </CardContent>
      </Card>
      
      {showForm && (
        <div className="animate-in slide-in-from-top-4 duration-300">
          <Card className="max-w-xl mx-auto shadow-2xl border-0 bg-gradient-to-br from-white to-indigo-50">
            <CardHeader>
              <CardTitle className="text-indigo-800">Initiate Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                placeholder="Request Title" 
                value={title} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                className="border-indigo-200 focus:border-indigo-500"
              />
              <Textarea 
                placeholder="Request Description" 
                value={desc} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDesc(e.target.value)}
                className="border-indigo-200 focus:border-indigo-500"
                rows={4}
              />
              <Input 
                placeholder="Additional Fields (comma separated)" 
                value={dynamicFields} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDynamicFields(e.target.value)}
                className="border-indigo-200 focus:border-indigo-500"
              />
              <Button 
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700" 
                variant="default"
                onClick={handleSubmit}
              >
                Submit Request
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Recent Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-green-100 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-green-800">Account Verification Request</span>
                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">Approved</span>
              </div>
              <p className="text-sm text-green-600 mt-1">Submitted 2 days ago</p>
            </div>
            <div className="p-4 bg-yellow-100 rounded-lg border border-yellow-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-yellow-800">Document Upload Request</span>
                <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">Pending</span>
              </div>
              <p className="text-sm text-yellow-600 mt-1">Submitted 1 day ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-purple-50">
        <CardHeader>
          <CardTitle className="text-purple-800">Consent Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
              Give Consent
            </Button>
            <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
              Revoke Consent
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Manage your data sharing preferences and consent settings for various services.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function DigiLockerPage() {
  const [connected, setConnected] = useState(false);
  
  return (
    <Card className="max-w-2xl mx-auto animate-in fade-in duration-500 shadow-xl border-0 bg-gradient-to-br from-white to-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800">DigiLocker Integration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-blue-100 rounded-lg">
          <div className="flex items-center gap-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-800">DigiLocker Connection</h3>
              <p className="text-sm text-blue-600">
                {connected ? 'Your DigiLocker is connected and synced' : 'Connect to access your digital documents'}
              </p>
            </div>
          </div>
          <Switch 
            checked={connected} 
            onCheckedChange={setConnected}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>
        
        <div className="flex gap-4">
          <Button 
            variant="default" 
            disabled={connected} 
            onClick={() => setConnected(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {connected ? 'Connected' : 'Connect DigiLocker'}
          </Button>
          <Button 
            variant="outline" 
            disabled={!connected}
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            View Documents
          </Button>
        </div>
        
        {connected && (
          <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-200 animate-in slide-in-from-top-2 duration-300">
            <h4 className="font-medium text-green-800 mb-2">Available Documents</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-700">Aadhaar Card</span>
                <span className="text-green-600">✓ Verified</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-700">PAN Card</span>
                <span className="text-green-600">✓ Verified</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-700">Driving License</span>
                <span className="text-green-600">✓ Available</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('demo_user');
  
  return (
    <Card className="max-w-2xl mx-auto animate-in fade-in duration-500 shadow-xl border-0 bg-gradient-to-br from-white to-indigo-50">
      <CardHeader>
        <CardTitle className="text-indigo-800">Profile Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-indigo-100 rounded-lg">
          <Avatar className="w-16 h-16 border-4 border-indigo-200">
            <AvatarFallback className="bg-indigo-600 text-white font-bold text-xl">
              {username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-indigo-800">Welcome back!</h3>
            <p className="text-sm text-indigo-600">Manage your account settings</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <Input 
              placeholder="Username" 
              value={username} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              readOnly={!isEditing}
              className={`${!isEditing ? 'bg-gray-50' : 'border-indigo-200 focus:border-indigo-500'}`}
            />
          </div>
          
          <div className="flex gap-4">
            <Button 
              variant={isEditing ? "default" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
              className={isEditing ? "bg-indigo-600 hover:bg-indigo-700" : "border-indigo-300 text-indigo-700 hover:bg-indigo-50"}
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
              Logout
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md w-full mx-4 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="text-center">
          <Avatar className="mx-auto mb-4 w-20 h-20 border-4 border-blue-100">
            <AvatarFallback className="bg-blue-600 text-white font-bold text-2xl">FC</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl text-blue-800">Welcome Back</CardTitle>
          <p className="text-blue-600">Sign in to your Fintust Canara account</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Username" 
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            className="border-blue-200 focus:border-blue-500"
          />
          <Input 
            placeholder="Password" 
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="border-blue-200 focus:border-blue-500"
          />
          <Button 
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700" 
            onClick={() => navigate('/dashboard')}
          >
            Sign In
          </Button>
          <Button variant="link" className="w-full mt-2 text-blue-600" asChild>
            <Link to="/signup">Don't have an account? Sign Up</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md w-full mx-4 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl border-0 bg-gradient-to-br from-white to-indigo-50">
        <CardHeader className="text-center">
          <Avatar className="mx-auto mb-4 w-20 h-20 border-4 border-indigo-100">
            <AvatarFallback className="bg-indigo-600 text-white font-bold text-2xl">FC</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl text-indigo-800">Create Account</CardTitle>
          <p className="text-indigo-600">Join Fintust Canara today</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Username"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            className="border-indigo-200 focus:border-indigo-500"
          />
          <Input 
            placeholder="Password" 
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="border-indigo-200 focus:border-indigo-500"
          />
          <Button 
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700" 
            onClick={() => navigate('/dashboard')}
          >
            Create Account
          </Button>
          <Button variant="link" className="w-full mt-2 text-indigo-600" asChild>
            <Link to="/login">Already have an account? Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;