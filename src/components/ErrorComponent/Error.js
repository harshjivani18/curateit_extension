import React from "react";

const Error = ({ error, origin, errorValue, errorCode }) => {
  console.log("errorValue : ", errorValue);
  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "#333",
      fontFamily: "Arial, sans-serif",
    },
    message: {
      textAlign: "center",
      maxWidth: "600px",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#d1ecf1", // light blue color
      borderColor: "#bee5eb",
    },
    heading: {
      color: "#0c5460", // dark cyan color
      fontSize: "2.5rem",
      marginBottom: "20px",
    },
    paragraph: {
      color: "#6c757d", // grey color for text
      marginBottom: "10px",
    },
    retryButton: {
      display: "inline-block",
      padding: "10px 20px",
      marginTop: "20px",
      border: "none",
      borderRadius: "4px",
      backgroundColor: "#0c5460", // dark cyan color for the button
      color: "white",
      textDecoration: "none",
      fontWeight: "bold",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.message}>
        {/* <h1 style={styles.heading}>Oops Some Error Occured!</h1> */}

        {errorCode && errorCode !== "" ? (
          <h1 style={styles.heading}>AI Results forbidden on this page</h1>
        ) : (
          <h1 style={styles.heading}>Could not extract Text</h1>
        )}
        <p style={styles.paragraph}>{`Origin : ${origin}`}</p>
        {/* <p style={styles.paragraph}>Please Try Again after sometime</p> */}
      </div>
    </div>
  );
};

export default Error;
