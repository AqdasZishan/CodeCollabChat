import { useContext, useEffect, useState } from "react";
import { Authcontext } from "../AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import backend from "../../../backend";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ProfileContent() {
  const value = useContext(Authcontext);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(value?.name || "");
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangePictureOpen, setIsChangePictureOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (value) {
      setEditedName(value.name);
    }
  }, [value]);

  const handleEditProfile = async () => {
    if (!editedName || editedName.trim().length === 0) {
      alert("Name cannot be empty!");
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.put(
        `${backend}/user/update`,
        {
          name: editedName.trim(),
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data) {
        // Update the context with new values
        value.updateUserData({
          name: response.data.user.name,
        });
        setIsEditing(false);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response) {
        alert(
          error.response.data.message ||
            "Failed to update profile. Please try again."
        );
      } else if (error.request) {
        alert("No response from server. Please check your connection.");
      } else {
        alert("An error occurred. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("All fields are required!");
      return;
    }

    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters long!");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      const response = await axios.put(
        `${backend}/user/change-password`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data) {
        alert("Password changed successfully!");
        setIsChangePasswordOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        alert(
          error.response.data.message ||
            "Failed to change password. Please try again."
        );
      } else if (error.request) {
        // The request was made but no response was received
        alert("No response from server. Please check your connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        alert("An error occurred. Please try again.");
      }
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePicture = async () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", selectedFile);

    try {
      const response = await axios.put(
        `${backend}/user/update-picture`,
        formData,
        {
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data) {
        alert("Profile picture updated successfully!");
        setIsChangePictureOpen(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        // Update the context with new picture URL
        value.setProfilePicture(response.data.profilePictureUrl);
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      alert("Failed to update profile picture. Please try again.");
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-gray-900">
        Profile Settings
      </h2>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Information */}
        <Card className="flex-grow bg-white border border-gray-200">
          <CardContent className="p-6">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={isEditing ? editedName : value?.name}
                    onChange={(e) => setEditedName(e.target.value)}
                    readOnly={!isEditing}
                    className={
                      isEditing
                        ? "bg-white border border-gray-200"
                        : "bg-gray-50"
                    }
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={value?.email}
                    readOnly
                    className="bg-gray-50"
                    placeholder="Your email address"
                  />
                  <p className="text-sm text-gray-500">
                    Email cannot be changed
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <Button
                      type="button"
                      onClick={handleEditProfile}
                      disabled={isSaving}
                      className="bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedName(value?.name);
                      }}
                      disabled={isSaving}
                      className="border border-gray-200 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Profile Picture and Actions */}
        <div className="w-full md:w-80 space-y-4">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-gray-100">
                  <AvatarImage
                    src={value?.profilePicture || "/placeholder.svg"}
                    alt="Profile picture"
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl font-semibold bg-gray-100 text-gray-600">
                    {value?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="mt-4 text-lg font-semibold text-gray-900">
                {value?.name}
              </span>
              <p className="text-sm text-gray-500 mt-1">{value?.type}</p>
              <div className="mt-6 w-full space-y-3">
                <Button
                  variant="outline"
                  className="w-full border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setIsChangePictureOpen(true)}
                >
                  Change Profile Picture
                </Button>
                <Button
                  variant="outline"
                  className="w-full border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setIsChangePasswordOpen(true)}
                >
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsChangePasswordOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              className="bg-gray-800 text-white hover:bg-gray-700"
            >
              Change Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Picture Dialog */}
      <Dialog open={isChangePictureOpen} onOpenChange={setIsChangePictureOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Profile Picture</DialogTitle>
            <DialogDescription>
              Upload a new profile picture. Supported formats: JPG, PNG, GIF.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center space-y-4">
              {previewUrl && (
                <Avatar className="w-32 h-32">
                  <AvatarImage src={previewUrl} alt="Preview" />
                  <AvatarFallback>Preview</AvatarFallback>
                </Avatar>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsChangePictureOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePicture}
              className="bg-gray-800 text-white hover:bg-gray-700"
            >
              Upload Picture
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
