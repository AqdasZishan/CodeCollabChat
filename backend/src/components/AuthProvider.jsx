import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import backend from "../../backend";
import { useNavigate } from "react-router-dom";

export const Authcontext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    type: "",
    roll: "",
    id: "",
    profilePicture: "",
  });
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const updateUserData = (newData) => {
    setUser((prev) => ({
      ...prev,
      ...newData,
    }));
  };

  const setProfilePicture = (url) => {
    setUser((prev) => ({
      ...prev,
      profilePicture: url,
    }));
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(`${backend}/user/details`, {
          headers: { Authorization: token },
        });

        setUser({
          name: response.data.name,
          email: response.data.email,
          type: response.data.type,
          roll: response.data.roll,
          id: response.data.id,
          profilePicture: response.data.profilePicture || "",
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchUserDetails();
  }, [token, navigate]);

  const contextValue = {
    ...user,
    updateUserData,
    setProfilePicture,
  };

  return (
    <Authcontext.Provider value={contextValue}>{children}</Authcontext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
