import { useContext, useEffect } from "react";
import { Authcontext } from "../AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfileContent() {
  const value = useContext(Authcontext);
  useEffect(() => {
    console.log(value);
  }, [value]);
  return (
    <>
      <h2 className="text-3xl font-bold mb-6">Profile</h2>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Information */}
        <Card className="flex-grow bg-white shadow-sm">
          <CardContent className="p-6">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name:</Label>
                <Input
                  id="name"
                  value={value.name}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email:</Label>
                <Input
                  id="email"
                  value={value.email}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              <Button className="bg-gray-800 text-white hover:bg-gray-700">
                Edit
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Profile Picture and Actions */}
        <div className="w-full md:w-64 space-y-4">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6 flex flex-col items-center">
              <Avatar className="w-32 h-32">
                <AvatarImage src="/placeholder.svg" alt="Profile picture" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="mt-4 text-lg font-semibold">Username</span>
              <div className="mt-6 w-full space-y-4">
                <Button variant="outline" className="w-full">
                  Change Picture
                </Button>
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
