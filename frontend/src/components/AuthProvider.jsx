import { createContext, useState, useEffect } from "react";
import axios from "axios";
import backend from "../../backend";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

export const Authcontext = createContext(null);

const AuthProvider = ({ children }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [roll, setRoll] = useState("");
  const [id, setId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        setIsLoading(false);
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(`${backend}/user/details`, {
          headers: {
            Authorization: token,
          },
        });
        setName(res.data.name);
        setEmail(res.data.email);
        setType(res.data.type);
        setRoll(res.data.roll);
        setId(res.data.id);
      } catch (err) {
        console.error("Error fetching user data:", err);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [token, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Authcontext.Provider
      value={{
        name,
        email,
        type,
        roll,
        id,
        setName,
        setEmail,
        setType,
        setRoll,
        setId,
      }}
    >
      {children}
    </Authcontext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
