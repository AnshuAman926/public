import React, { useState, useRef, useEffect } from "react";
import "./UploadComponent.css";
import logo from "./assets/images/hcltech logo.png";
import logo1 from "./assets/images/Superchargers_Logo.png";
import background from "./assets/images/background.png";

const UploadComponent = () => {
  const [file, setFile] = useState(null);
  const [imgSrc, setImgSrc] = useState("");
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [notification, setNotification] = useState("");
  const [isUploadVisible, setIsUploadVisible] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [welcomeText, setWelcomeText] = useState("Welcome");
  const [headingText, setHeadingText] = useState(
    " to Harit Upvan,Greater Noida Wwest\n49th HCL Day Mega Plantation"
  ); // State for heading text
  const [isPhone, setIsPhone] = useState(false); // State for detecting mobile device
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const url =
    "https://script.google.com/macros/s/AKfycby4G9IRnAJW9lNm7XvLW5PVdPRV81i7UytV2qw6qRIvDAYd57OLotxEZfRHHD6eza8_/exec";

  useEffect(() => {
    const checkIfPhone = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(
        userAgent
      );
    };

    setIsPhone(checkIfPhone()); // Initialize isPhone state based on initial check

    const handleResize = () => {
      setIsPhone(checkIfPhone()); // Update isPhone state on resize event
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty dependency array to run effect only once on mount

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      const res = reader.result;
      setImgSrc(res);
      setIsUploading(true);

      const base64String = res.split("base64,")[1];
      const payload = {
        base64: base64String,
        type: selectedFile.type,
        name: selectedFile.name,
      };

      fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
      })
        .then((response) => {
          console.log("Response status:", response.status);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.text();
        })
        .then((data) => {
          console.log("Image upload response:", data);
          console.log("Uploaded file URL:", data.url);
          setImgSrc("");
          setWelcomeText("");
          console.log(welcomeText);
          setFile(null);
          setNotification(`Image uploaded successfully! File URL: ${data.url}`);
          setIsUploadVisible(false);
          setIsUploading(false);
          setHeadingText("Thank you for participating in Lamp Lighting"); // Update heading text
          console.log("Heading text updated to:", headingText); // Log the updated heading text
        })
        .catch((error) => {
          console.error("Error:", error);
          setNotification("Failed to upload image.");
          setIsUploading(false);
        });
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleTakeSelfie = () => {
    setIsCameraOn(true);
    setIsCaptured(false);
    setIsUploadVisible(false); // Hide other components when taking a selfie
    setHeadingText(" to Harit Upvan,Greater Noida Wwest\n49th HCL Day Mega Plantation"); // Reset heading text
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" } })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      })
      .catch((err) => {
        console.error("Error accessing camera: ", err);
        setNotification("Failed to access camera. Please check permissions.");
      });
  };

  const handleCapture = () => {
    const context = canvasRef.current.getContext("2d");
    context.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    const dataUrl = canvasRef.current.toDataURL("image/png");
    setImgSrc(dataUrl);
    videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    setIsCameraOn(false);
    setIsCaptured(true);
    setIsUploading(true);
    handleNextStep(dataUrl); // Call handleNextStep with the captured image
  };

  const handleNextStep = (imageDataUrl) => {
    const base64String = imageDataUrl.split("base64,")[1];
    const payload = {
      base64: base64String,
      type: "image/png",
      name: "selfie.png",
    };

    fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
    })
      .then((response) => {
        console.log("Response status:", response.status);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((data) => {
        console.log("Selfie upload response:", data);
        setImgSrc(""); // Clear the captured image source
        setWelcomeText("");
        setFile(null);
        setNotification("Selfie uploaded successfully!");
        setIsUploadVisible(false);
        setIsUploading(false);
        setIsCaptured(false); // Reset the captured state
        setHeadingText("Thank you for participating in Lamp Lighting"); // Update heading text
        console.log("Heading text updated to:", headingText); // Log the updated heading text
      })
      .catch((error) => {
        console.error("Error:", error);
        setNotification("Failed to upload selfie.");
        setIsUploading(false);
      });
  };

  return (
    <div className="body">
      <div className="logo">
        <div className="logo_main">
          <img src={logo} alt="Logo" />
        </div>
        <div className="logo1">
          <img src={logo1} alt="Logo1" />
        </div>
      </div>
      <div className="Heading">
        <h2>
          <p className="fw-light">
            <b className="fw-bold">{welcomeText}</b>
            {headingText.split("\n").map((text, index) => (
              <React.Fragment key={index}>
                {text}
                <br />
              </React.Fragment>
            ))}
          </p>
        </h2>
      </div>
      {isCaptured ? (
        <div className="captured-image">
          <img src={imgSrc} alt="Captured Selfie" style={{ width: "100%" }} />
        </div>
      ) : (
        <>
          {!isUploadVisible ? null : (
            <div className="form">
              <div
                className="image-upload"
                onClick={() => document.getElementById("file-input").click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                {imgSrc ? (
                  <img src={imgSrc} alt="Preview" />
                ) : (
                  <p> Click here to upload your selfie</p>
                )}
              </div>
              <button className="upload-button" onClick={handleTakeSelfie}>
                Take Selfie
              </button>
            </div>
          )}
          {isCameraOn && (
            <div className="video-container">
              <video ref={videoRef} autoPlay playsInline></video>
              <button className="capture-button" onClick={handleCapture}>
                Capture
              </button>
            </div>
          )}
          {isCaptured && (
            <button
              className="retake-button"
              onClick={() => setIsCameraOn(true)}
            >
              Retake Selfie
            </button>
          )}
          <canvas
            ref={canvasRef}
            style={{ display: "none" }}
            width="640"
            height="480"
          ></canvas>
        </>
      )}
      {isUploading && (
        <div className="upload-notification">
          <div className="notification">
            Uploading, please wait... Do not reload the page.
          </div>
        </div>
      )}
      {notification && (
        <div className="notification-popup">
          <div className="notification">{notification}</div>
        </div>
      )}
    </div>
  );
};

export default UploadComponent;
