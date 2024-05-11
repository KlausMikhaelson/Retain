import { useState, useEffect } from 'react'

import './Popup.css'

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

  useEffect(() => {
    console.log("keyValuePairs", keyValuePairs);
  }, [keyValuePairs]);

  return (
    <main>
      <h3>Input Stash</h3>
      <div className="key-value-pair-list">
        <div className="key-value-pair" style={{margin: "20px"}}>
          <div>Input Stash for the current tab</div>
        </div>
        {keyValuePairs.map((keyValuePair, index) => {
          const sortedWithTimestamp = keyValuePairs.sort((a, b) => {
            const aTimestamp = parseInt(a.key.split("-")[1]);
            const bTimestamp = parseInt(b.key.split("-")[1]);
            return bTimestamp - aTimestamp;
          }
          );

          return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px" }} className="key-value-pair" key={index}>
              <div style={{display:"flex"}}>
              <a style={{ textDecoration: "none",height: "15px", padding: "5px 10px", marginRight: "10px", borderRadius: "5px", backgroundColor: "#1877F2", color: "black" }} className="key" href={keyValuePair.key.split(/-\d+$/)[0]} target="_blank">Link</a>
              <div style={{ alignItems: "start", textAlign: "start" }} className="value">{keyValuePair.value}</div>
              </div>
              <button style={{ marginLeft: "10px" }} onClick={() => deleteKeyValuePair(keyValuePair.key)}>Delete</button>
            </div>
          )
        })}
      </div>
    </main>
  )
}

export default Popup
