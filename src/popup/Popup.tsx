import { useState, useEffect } from 'react'
import Logo from "../assets/logo.png";
import './Popup.css'
import CopyIcon from "../assets/copyIcon.png";


export const Popup = () => {
  const [keyValuePairs, setKeyValuePairs] = useState<{ key: string, value: string }[]>([])
  useEffect(() => {
    chrome.runtime.sendMessage({ action: 'getCurrentTabUrl' }, (response) => {
      if (response) {
        setCurrentWebsiteLink(response);
      } else {
        console.error('Failed to get current tab URL');
      }
    });
  }, [])

  const [currentWebsiteLink, setCurrentWebsiteLink] = useState<string>("")

  useEffect(() => {
    console.log("currentWebsiteLink", currentWebsiteLink);
  }, [currentWebsiteLink])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await new Promise((resolve, reject) => {
          chrome.storage.local.get(null, (data) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(data);
            }
          });
        });
        const newKeyValuePairs = [];
        for (const key in data as Record<string, string>) {
          if (key.includes(currentWebsiteLink)) {
            // const keyWithoutTimestamp = key.replace(/-\d+$/, '');
            const savedText = (data as Record<string, string>)[key];
            console.log(`Saved text for key '${key}':`, savedText);
            newKeyValuePairs.push({ key: key, value: savedText });
          }
        }
        console.log("newKeyValuePairs", newKeyValuePairs);
        if (newKeyValuePairs.length === 0) {
          return;
        } else {
          setKeyValuePairs(newKeyValuePairs); // Update keyValuePairs directly with newKeyValuePairs
        }
      } catch (error) {
        console.error("Error fetching data from Chrome Storage:", error);
      }
    };

    fetchData();
  }, [currentWebsiteLink])

  const deleteKeyValuePair = (key: string) => {
    chrome.storage.local.remove(key, () => {
      const newKeyValuePairs = keyValuePairs.filter((keyValuePair) => keyValuePair.key !== key);
      setKeyValuePairs(newKeyValuePairs);
    });
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  }

  useEffect(() => {
    console.log("keyValuePairs", keyValuePairs);
  }, [keyValuePairs]);

  return (
    <div className="key-value-pair-list" style={{ borderRadius: "8px", border: "2px", borderColor: "white", margin: "10px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "center" , flexDirection: "column"}}>
      <div style={{  top: "0px"}}>
        {/* <img src={Logo} alt="Logo" style={{ height: "170px", width: "200px" }} /> */}
        <h1>reta<small style={{color: "#5271FF"}}>↓</small>n</h1>
      </div>
      <div style={{ borderWidth: "5px", borderStyle: "solid", borderColor: "white", borderRadius: "8px", height: "85vh", marginTop: "-10px",width: "90vw", overflow: "auto" }}>
        {keyValuePairs.map((keyValuePair, index) => {
          const sortedWithTimestamp = keyValuePairs.sort((a, b) => {
            const aTimestamp = parseInt(a.key.split("-")[1]);
            const bTimestamp = parseInt(b.key.split("-")[1]);
            return bTimestamp - aTimestamp;
          }
          );
          return (
            <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", padding: "8px", margin: "8px", borderRadius: "8px", borderWidth: "2px", borderColor: "white", borderStyle: "solid" }} className="key-value-pair" key={index}>
              <div style={{ display: "flex" }}>
                {/* <a style={{ textDecoration: "none",height: "15px", padding: "5px 10px", marginRight: "10px", borderRadius: "5px", backgroundColor: "#1877F2", color: "black" }} className="key" href={keyValuePair.key.split(/-\d+$/)[0]} target="_blank">Link</a> */}
                <div style={{ alignItems: "start", textAlign: "start" }} className="value">{keyValuePair.value}</div>
              </div>
              <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
              <button style={{ marginLeft: "10px" }} onClick={() => deleteKeyValuePair(keyValuePair.key)}>Delete</button>
              <button style={{ marginLeft: "10px" }} onClick={() => copyToClipboard(keyValuePair.value)}>Copy</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Popup
