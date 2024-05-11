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
            const keyWithoutTimestamp = key.replace(/-\d+$/, '');
            const savedText = (data as Record<string, string>)[key];
            console.log(`Saved text for key '${keyWithoutTimestamp}':`, savedText);
            newKeyValuePairs.push({ key: keyWithoutTimestamp, value: savedText });
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

  useEffect(() => {
    console.log("keyValuePairs", keyValuePairs);
  }, [keyValuePairs]);

  return (
    <main>
      <h3>Input Stash</h3>
      <div className="key-value-pair-list">
        <div className="key-value-pair">
          <div>Input Stash for the current tab</div>
        </div>
        {keyValuePairs.map((keyValuePair, index) => (
          <div style={{display: "flex", alignItems: "center"}} className="key-value-pair" key={index}>
            <a style={{textDecoration:"none", padding: "5px 10px", margin: "10px", borderRadius: "5px", backgroundColor: "#1877F2", color: "black"}} className="key" href={keyValuePair.key} target="_blank">Link</a>
            <div style={{alignItems: "start", textAlign: "start"}} className="value">{keyValuePair.value}</div>
          </div>
        ))}
      </div>
    </main>
  )
}

export default Popup
