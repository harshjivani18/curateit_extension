import "./AIBrandModal.css";

import React, { useState }          from "react";
import { useDispatch }              from "react-redux";
import { Modal, Typography, Input, Button, message } from 'antd';

import { 
    addPersona, 
    addVoice, 
    deleteBrand, 
    editBrand 
}                                   from "../../actions/ai-brands";
import session from "../../utils/session";
import { ImMagicWand } from "react-icons/im";

const { TextArea } = Input;

const AIBrandModal = ({ visible, onCancel, onSubmit, action, title, currentName="", currentDescription="", currentId=null, type="Persona" }) => {
    const dispatch                      = useDispatch();
    const [name, setName]               = useState(currentName)
    const [description, setDescription] = useState(currentDescription)
    const [nameError, setNameError]     = useState("")
    const [descriptionError, 
           setDescriptionError]         = useState("")
    const [saving, setSaving]           = useState(false)

    const onCreateBrand = async () => {
        if (!name || name === "") {
            setNameError("Name is required")
            return;
        }
        if (!description || description === "") {
            setDescriptionError("Description is required")
            return;
        }
        setSaving(true)
        let res;
        if (type === "Persona") {
            res = await dispatch(addPersona({ name, description, brand_type: type, author: parseInt(session.userId) }))
        }
        else {
            res = await dispatch(addVoice({ name, description, brand_type: type, author: parseInt(session.userId) }))
        }
        setSaving(false)
        // const res = await dispatch(addBrand({ name, description, brand_type: type, author: parseInt(session.userId) }))
        if (res?.payload?.data?.data && onCancel) {
            message.success(`${type} created successfully`)
            onSubmit && onSubmit(res?.payload?.data?.data)
            onCancel()
        }
    }

    const onSaveBrand = async () => {
        if (!currentId) {
            message.error("Brand ID not set")
            return;
        }
        if (!name || name === "") {
            setNameError("Name is required")
            return;
        }
        if (!description || description === "") {
            setDescriptionError("Description is required")
            return;
        }
        const res = await dispatch(editBrand({ name, description, brand_type: type, author: parseInt(session.userId) }, currentId))
        if (res?.payload?.data?.data?.attributes && onCancel) {
            message.success("Brand updated successfully")
            onCancel()
        }
    }

    const onDeleteBrand = async () => {
        if (currentId) {
            const res = await dispatch(deleteBrand(currentId))
            if (res?.error === undefined && onCancel) {
                message.success("Brand deleted successfully")
                onCancel()
            }
        }
    }

    return (
        <Modal open={visible} 
               onCancel={onCancel} 
               header={null}
               footer={null}
               className="ct-ai-brand-modal">
            <Typography.Title level={6} className="ct-ai-modal-title">{title}</Typography.Title>
            <Typography.Text className="ct-ai-modal-label mb-2">Name</Typography.Text>
            <Input className="ct-ai-modal-input mb-2" 
                   value={name}
                   onChange={(e) => {
                        const { value } = e.target;
                        setName(value)
                   }}
                   placeholder="Insert the name"  />
            {nameError && <Typography.Text type="danger" className="mb-2">{nameError}</Typography.Text>}
            <Typography.Text className="ct-ai-modal-label mb-2">Description</Typography.Text>
            <TextArea className="ct-ai-modal-text-area mb-2" 
                   value={description}
                   style={{
                        height: 120,
                        resize: 'none',
                   }}
                   onChange={(e) => {
                        const { value } = e.target;
                        setDescription(value)
                   }}
                   placeholder="Describe your brand voice tone, Style, value, target audience in few words"  />
            {descriptionError && <Typography.Text type="danger" className="mb-2">{descriptionError}</Typography.Text>}
            <div className="ct-ai-modal-footer">
                {action === "create" && <Button type="primary" disabled={saving} onClick={onCreateBrand} className="bg-[#347AE2] flex items-center w-[100px] justify-center">
                    <ImMagicWand className="h-5 w-5 mr-2" />
                    Create
                </Button>}
                {action === "edit" && <>
                    <Button type="danger" onClick={onDeleteBrand} className="text-[red] mr-2">Delete</Button>
                    <Button type="primary" onClick={onSaveBrand} className="bg-[#347AE2]">Save</Button>
                </>}
            </div>
        </Modal>
    )
}

export default AIBrandModal;