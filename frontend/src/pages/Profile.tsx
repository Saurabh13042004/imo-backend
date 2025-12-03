import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, LogOut } from 'lucide-react';

export default function Profile() {
  const [userEmail] = useState('demo@example.com');

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="flex items-center space-x-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3 rounded-2xl">
            <User className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Demo User Profile</p>
          </div>
        </div>

        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                  <Mail className="h-4 w-4" />
                  <span>{userEmail}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  This is a demo profile. Features are limited in demo mode.
                </p>
                <Button variant="outline" className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}