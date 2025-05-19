import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import backend from "../../backend.js";

export default function Signin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    await axios
      .post(`${backend}/user/signin`, {
        email,
        password,
      })
      .then((res) => {
        console.log(res.data);
        localStorage.setItem("token", `Bearer ${res.data.token}`);
        alert(res.data.message);
        window.location.href = "/";
      })
      .catch((err) => {
        console.log(err.response.data.message);
        alert(err.response.data.message);
      });
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-primary">
            Login
          </CardTitle>
          <CardDescription>
            If you're already a member, easily log in now.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* <form> */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                value={email}
                onChange={(e) => {
                  setemail(e.target.value);
                }}
                type="email"
                placeholder="Email"
              />
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
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
                handleLogin();
              }}
              className="w-full"
              type="submit"
            >
              Login
            </Button>
          </div>
          {/* </form> */}
          <div className="mt-4 text-center text-sm">
            <div className="text-primary hover:underline hover:cursor-pointer">
              Forgot password?
            </div>
          </div>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center text-sm">
            Don't have an account?{" "}
            <div
              onClick={() => {
                navigate("/create");
              }}
              className="text-primary hover:underline hover:cursor-pointer"
            >
              Sign up
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
