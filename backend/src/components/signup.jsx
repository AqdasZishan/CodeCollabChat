"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  User,
  Hash,
  UserCheck,
  Lock,
  ColumnsIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import backend from "../../backend.js";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setemail] = useState();
  const [name, setname] = useState();
  const [roll, setroll] = useState();
  const [password, setpassword] = useState();
  const [type, settype] = useState("");
  const navigate = useNavigate();

  async function handleSignup() {
    await axios
      .post(`${backend}/user/create`, {
        email,
        name,
        type,
        password,
        roll,
      })
      .then((res) => {
        console.log(res.data);
        localStorage.setItem("token", `Bearer ${res.data.token}`);
        window.location.href = "/";
      })
      .catch((err) => {
        console.log(err);

        console.log(err.response.data.message);
      });
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-primary">
            Sign Up
          </CardTitle>
          <CardDescription>
            Create an account to join our learning platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  onChange={(e) => {
                    setemail(e.target.value);
                  }}
                  type="email"
                  placeholder="Email"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  onChange={(e) => {
                    setname(e.target.value);
                  }}
                  type="text"
                  placeholder="Full Name"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className={`${type === "TEACHER" ? "hidden" : ""} relative`}>
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  onChange={(e) => {
                    setroll(e.target.value);
                  }}
                  type="text"
                  placeholder="Roll Number"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Select
                  onValueChange={(value) => {
                    settype(value);
                  }}
                  required
                >
                  <SelectTrigger className="w-full pl-10">
                    <SelectValue placeholder="Select User Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  onChange={(e) => {
                    setpassword(e.target.value);
                  }}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="pl-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            <Button
              onClick={() => {
                handleSignup();
              }}
              className="w-full"
              type="submit"
            >
              Sign Up
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </div>
          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
