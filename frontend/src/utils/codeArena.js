import axios from "axios";
const judge0 = import.meta.env.VITE_JUDGE0;
import backend from "../../backend";
import { constSelector } from "recoil";

//run code logic
export const handleRunCode = async ({
  languageCode,
  codes,
  setOutput,
  setLoading,
  loading,
  output,
}) => {
  setLoading(true);
  try {
    await axios
      .post(
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
      )
      .then(async (res) => {
        console.log(res);
        const stdout = res.data.stdout;
        const stderr = res.data.stderr;
        if (!stderr) {
          setOutput({ ...output, [languageCode.language]: stdout });
          return;
        }
        setOutput({ ...output, [languageCode.language]: stderr });
        // const token=res.data.token;
        // await axios.get(`https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=false&fields=*`,{
        //   headers:{
        //     "x-rapidapi-key":"c0e3d8c26fmsh39eac4c50506fd2p16fdcfjsn877bcd1c4479"
        //   }
        // }).then(res=>{
        //   console.log(res);
        // }).catch((err)=>{

        //   console.log(err);
        // })
      })
      .catch((err) => {
        console.log(err);
      });
    setLoading(false);
    // const result = eval(code)
    //   setOutput(String(result))
  } catch (error) {
    //   setOutput(String(error))
    console.log(error);
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
  setSaveCodeLoading(true);

  await axios
    .post(
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
    )
    .then((res) => {
      alert("code saved");
      setSaveCodeLoading(false);
    })
    .catch((err) => {
      console.log(err);
      setSaveCodeLoading(false);
    });
}
