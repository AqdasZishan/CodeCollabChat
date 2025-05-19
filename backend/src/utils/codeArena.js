import axios from "axios";
const judge0 = import.meta.env.VITE_JUDGE0;
import backend from "../../backend";

const EXECUTION_TIMEOUT = 10000; // 10 seconds timeout

//run code logic
export const handleRunCode = async ({
  languageCode,
  codes,
  setOutput,
  setLoading,
  loading,
  output,
}) => {
  if (loading) return; // Prevent multiple executions

  setLoading(true);
  const timeoutId = setTimeout(() => {
    setLoading(false);
    setOutput({
      ...output,
      [languageCode.language]: "Execution timed out. Please try again.",
    });
  }, EXECUTION_TIMEOUT);

  try {
    const response = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions?wait=true&fields=*",
      {
        language_id: languageCode.code,
        source_code: codes[languageCode.language],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-key": judge0,
        },
      }
    );

    clearTimeout(timeoutId);

    const { stdout, stderr, compile_output } = response.data;

    if (stderr) {
      setOutput({ ...output, [languageCode.language]: stderr });
    } else if (compile_output) {
      setOutput({ ...output, [languageCode.language]: compile_output });
    } else {
      setOutput({ ...output, [languageCode.language]: stdout || "No output" });
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Code execution error:", error);
    setOutput({
      ...output,
      [languageCode.language]:
        error.response?.data?.message ||
        "Error executing code. Please try again.",
    });
  } finally {
    setLoading(false);
  }
};

//save code
export async function SaveCode(
  projectId,
  languageCode,
  codes,
  token,
  setSaveCodeLoading
) {
  if (!projectId || !languageCode || !codes || !token) {
    console.error("Missing required parameters for SaveCode");
    return;
  }

  setSaveCodeLoading(true);

  try {
    const response = await axios.post(
      `${backend}/room/project/code/save/${projectId}`,
      {
        code: codes[languageCode.language],
        language: languageCode.language,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    if (response.data) {
      alert("Code saved successfully");
    }
  } catch (error) {
    console.error("Error saving code:", error);
    alert(
      error.response?.data?.message || "Failed to save code. Please try again."
    );
  } finally {
    setSaveCodeLoading(false);
  }
}
