import React, { useEffect, useRef, useState } from "react";

const URL = "ws://localhost:8000/ws/v1";

const Logs = () => {
  const clientRef = useRef(null);
  const [waitingToReconnect, setWaitingToReconnect] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const [msg, setMsg] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("");
  const [messages, setMessages] = useState({});

  useEffect(() => {
    if (waitingToReconnect) {
      return;
    }

    // Only set up the websocket once
    if (!clientRef.current) {
      const client = new WebSocket(URL);
      clientRef.current = client;

      window.client = client;

      client.onerror = (e) => console.error(e);

      client.onopen = () => {
        setIsOpen(true);
        console.log("ws opened");
        client.send("ping");
      };

      client.onclose = () => {
        if (clientRef.current) {
          // Connection failed
          console.log("ws closed by server");
        } else {
          // Cleanup initiated from app side, can return here, to not attempt a reconnect
          console.log("ws closed by app component unmount");
          return;
        }

        if (waitingToReconnect) {
          return;
        }

        // Parse event code and log
        setIsOpen(false);
        console.log("ws closed");

        // Setting this will trigger a re-run of the effect,
        // cleaning up the current websocket, but not setting
        // up a new one right away
        setWaitingToReconnect(true);

        // This will trigger another re-run, and because it is false,
        // the socket will be set up again
        setTimeout(() => setWaitingToReconnect(null), 5000);
      };

      client.onmessage = (message) => {
        const parsedData = JSON.parse(message.data);
        setMessages(parsedData)
        setTime(parsedData.time);
        setMsg(parsedData.message);
        setType(parsedData.type);
      };

      return () => {
        console.log("Cleanup");
        // Dereference, so it will set up next time
        clientRef.current = null;

        client.close();
      };
    }
  }, [waitingToReconnect]);

 

  const yearFormat = time.slice(0, 10);
  const timerFormat = time.slice(11, 19);
  console.log(messages.type);
  if (messages.type === "TRADING_REPORT"){

  }
  

  return (
    <>
      <div className="bg-transparent float-left w-[49%] h-[95%]  absolute left-0 bottom-0 ">
        <h1 className="text-yellow-300">Websocket {isOpen ? "Connected" : "Disconnected"}</h1>
        {waitingToReconnect && <p  className="text-yellow-300">Reconnecting momentarily...</p>}
        <p className="text-sm text-white">
          🕑 Time : {timerFormat} {yearFormat}
        </p>
        <p className=" text-sm text-white"> 🔴 Status : {messages.type === "FEED" ? messages.message : ""}</p>
      </div>

      <div className="bg-transparent float-left w-[49%]  h-[95%] absolute right-0 bottom-0">
      <h1 className=" text-sm text-yellow-300"> 🔴 Ordered</h1>
      {messages.type === "TRADING_REPORT" ? <p className=" text-sm text-white">{messages.message}</p>  : ""}
        
      </div>
    </>
  );
};

export default Logs;