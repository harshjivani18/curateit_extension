import { React, useState } from "react";

export default function Modal({
  showOpen,
  deleteCollections,
  edit,
  editCollections,
  cancel,
  collectionName,
  message = ""
}) {
  const [editNames, setEditNames] = useState(collectionName)
  const editName = (e) => {
    const { value } = e.target
    if (e.key === "Enter") {
      editCollections(value)
    }
    setEditNames(value)
  }

  const renderEditModal = () => {
    return (
      <div className="popupcontainer">
        <h1 className="content-h">Collection Name </h1>
        <span className={edit ? "popwhite-bg" : ""}></span>
        <input
          className="edit-collection"
          value={editNames}
          onChange={editName}
          onKeyDown={editName}
          style={{ marginTop: "42px" }}
          placeholder="Enter Colleciton Name "
          autoFocus
        />
        <div className="btnn-pop">
          {editNames.length > 1 ? (
            <button
              className="save-btn"
              onClick={() => editCollections(editNames)}
            >
              Save
            </button>
          ) : (
            <button
              className="save-btn disabledbutton"
              onClick={() => editCollections(editNames)}
              disabled
            >
              Save
            </button>
          )}
          <button className="no-btn" onClick={() => cancel(false)}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  const renderDeleteModal = () => {
    return (
      <div className="popup-delete bg-white z-20">
        {message ? (
          <h1 className="content-h">{message}</h1>
        ) : (
          <h1 className="content-h">
            Confirm delete{" "}
            {collectionName.length > 35
              ? collectionName.slice(0, 35).concat("...")
              : collectionName}
            ?
          </h1>
        )}
        <div className="btnn-pop">
          <button className="yes-btn" onClick={() => deleteCollections()}>
            Yes
          </button>
          <button className="no-btn" onClick={() => cancel(false)}>
            No
          </button>
        </div>
      </div>
    )
  }

  return edit ? renderEditModal() : renderDeleteModal()
}
